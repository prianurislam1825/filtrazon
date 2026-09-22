// ─────────────────────────────────────────────────────────────
//  GET /api/firebase-sync
//  Fetches latest reading from Firebase RTDB, transforms it,
//  broadcasts via SSE EVERY fetch (not just new seq) so relay
//  status is always fresh, saves to MySQL on new seq only.
// ─────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server'
import { fetchFirebaseLatest, normalizeBool } from '@/lib/firebase/client'
import { getFirebaseState, setFirebaseReading, setFirebaseError, setLocalDbStatus } from '@/lib/firebase/state'
import { broadcastReading, broadcastAlert, startHeartbeat } from '@/lib/sse/broadcaster'
import { generateAlertCandidates } from '@/lib/thresholds'
import { isLocalMode } from '@/lib/config'
import type { Reading, FirebaseReading, Alert } from '@/types'

startHeartbeat()

function toReading(fb: FirebaseReading): Reading {
  return {
    id:           fb.seq,
    device_id:    fb.device_id,
    seq:          fb.seq,
    uptime_ms:    fb.uptime_ms,
    ph:           fb.ph,
    tds:          fb.tds,
    turbidity:    fb.turbidity,
    flow_lpm:     fb.flow_lpm,
    lat:          fb.lat,
    lon:          fb.lon,
    total_liters: fb.total_liters,
    pump_status:  fb.pump_status,
    uv_status:    fb.uv_status,
    relay1:       fb.relay1,
    relay2:       fb.relay2,
    relay3:       fb.relay3,
    relay4:       fb.relay4,
    flags:        fb.flags,
    battery:      fb.battery,
    rssi:         fb.rssi,
    snr:          fb.snr,
    gateway_id:   fb.gateway,
    gateway:      fb.gateway,
    rx_ms:        fb.rx_ms,
    received_at:  fb.fetched_at,
  }
}

// In-memory dedup for DB inserts only (not for SSE broadcast)
const insertedSeqs = new Set<number>()

export async function GET(_request: NextRequest): Promise<Response> {
  // ── 1. Fetch from Firebase ────────────────────────────────
  const result = await fetchFirebaseLatest()

  if (!result.ok || !result.data) {
    setFirebaseError(result.error ?? 'Unknown error')
    return Response.json({ ok: false, error: result.error }, { status: 200 })
  }

  const raw = result.data

  // ── 2. Normalize to FirebaseReading ──────────────────────
  const fbReading: FirebaseReading = {
    device_id:    raw.device_id ?? 'FILTRAZON-01',
    gateway:      raw.gateway ?? 'GW-01',
    seq:          raw.seq ?? 0,
    uptime_ms:    raw.uptime_ms ?? 0,
    ph:           raw.ph ?? 7.0,
    tds:          raw.tds ?? 0,
    turbidity:    raw.turbidity ?? 0,
    flow_lpm:     raw.flow_lpm ?? 0,
    lat:          raw.lat,
    lon:          raw.lon,
    total_liters: raw.total_liters ?? 0,
    pump_status:  normalizeBool(raw.pump_status),
    uv_status:    normalizeBool(raw.uv_status),
    relay1:       !!raw.relay1,
    relay2:       !!raw.relay2,
    relay3:       !!raw.relay3,
    relay4:       !!raw.relay4,
    flags:        raw.flags ?? 0,
    battery:      raw.battery ?? -1,
    rssi:         raw.rssi ?? 0,
    snr:          raw.snr ?? 0,
    rx_ms:        raw.rx_ms ?? Date.now(),
    fetched_at:   result.fetchedAt,
  }

  const reading   = toReading(fbReading)
  let isNewSeq    = !insertedSeqs.has(fbReading.seq)

  if (isNewSeq && !isLocalMode()) {
    try {
      const { getLatestReading } = await import('@/lib/db/readings')
      const latestDb = await getLatestReading(fbReading.device_id)
      if (latestDb && latestDb.seq === fbReading.seq) {
        insertedSeqs.add(fbReading.seq)
        isNewSeq = false
      }
    } catch {}
  }

  // ── 3. Always broadcast via SSE (relay status stays fresh) ─
  broadcastReading(reading)
  global.__latestReading = reading

  // ── 4. DB insert + alerts only on new seq ────────────────
  let savedToDb = false

  if (isNewSeq) {
    insertedSeqs.add(fbReading.seq)
    if (insertedSeqs.size > 500) {
      const first = insertedSeqs.values().next().value as number
      insertedSeqs.delete(first)
    }

    if (!isLocalMode()) {
      try {
        const { insertReading } = await import('@/lib/db/readings')
        const insertId = await insertReading(reading)
        reading.id = insertId
        savedToDb  = true
        setLocalDbStatus(true)
      } catch (err) {
        console.error('[firebase-sync] DB insert failed:', err)
        setLocalDbStatus(false)
      }
    } else {
      savedToDb = true
      setLocalDbStatus(true)
    }

    // Evaluate thresholds → alerts
    const candidates = generateAlertCandidates(
      reading.ph, reading.tds, reading.turbidity,
      reading.flow_lpm, reading.pump_status, reading.uv_status,
      reading.rssi,
    )
    for (const c of candidates) {
      const alert: Alert = {
        id:         Date.now(),
        device_id:  reading.device_id,
        gateway_id: reading.gateway_id,
        severity:   c.severity,
        type:       c.type,
        message:    c.message,
        value:      c.value,
        threshold:  c.threshold,
        status:     'active',
        created_at: result.fetchedAt,
      }
      broadcastAlert(alert)

      if (!isLocalMode() && savedToDb) {
        try {
          const { execute } = await import('@/lib/db/client')
          await execute(
            `INSERT IGNORE INTO alerts
               (device_id, gateway_id, severity, type, message, value, threshold, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
            [
              alert.device_id, alert.gateway_id ?? null,
              alert.severity, alert.type, alert.message,
              String(alert.value ?? ''), String(alert.threshold ?? ''),
              result.fetchedAt,
            ],
          )
        } catch {}
      }
    }
  }

  // ── 5. Update state singleton ─────────────────────────────
  setFirebaseReading(fbReading, savedToDb)

  return Response.json({
    ok:        true,
    isNewSeq,
    firebase:  fbReading,
    fetchedAt: result.fetchedAt,
  })
}
