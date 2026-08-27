// GET /api/latest
// Returns the most recent reading.
// Priority: 1) Firebase cache (global.__latestReading set by firebase-sync)
//            2) DB in cloud mode
//            3) Mock fallback

import { type NextRequest } from 'next/server'
import { isLocalMode } from '@/lib/config'
import type { Reading } from '@/types'

export async function GET(_request: NextRequest): Promise<Response> {
  // ── 1. Firebase-synced in-memory cache ────────────────────
  if (global.__latestReading) {
    return Response.json({ ok: true, data: global.__latestReading, source: 'firebase-cache' })
  }

  // ── 2. DB in cloud mode ───────────────────────────────────
  if (!isLocalMode()) {
    try {
      const { getLatestReading } = await import('@/lib/db/readings')
      const reading = await getLatestReading()
      if (reading) {
        global.__latestReading = reading
        return Response.json({ ok: true, data: reading, source: 'db' })
      }
    } catch (err) {
      console.error('[latest] DB query failed:', err)
    }
  }

  // ── 3. Try Firebase directly (cold start, before first sync) ─
  try {
    const { fetchFirebaseLatest, normalizeBool } = await import('@/lib/firebase/client')
    const result = await fetchFirebaseLatest()
    if (result.ok && result.data) {
      const raw = result.data
  // Add flags: 0 to all readings that don't have it
  const reading: Reading = {
    id:           raw.seq,
    device_id:    raw.device_id,
    seq:          raw.seq,
    uptime_ms:    raw.uptime_ms,
    ph:           raw.ph,
    tds:          raw.tds,
    turbidity:    raw.turbidity,
    flow_lpm:     raw.flow_lpm,
    total_liters: raw.total_liters,
    pump_status:  normalizeBool(raw.pump_status),
    uv_status:    normalizeBool(raw.uv_status),
    relay1:       !!raw.relay1,
    relay2:       !!raw.relay2,
    relay3:       !!raw.relay3,
    relay4:       !!raw.relay4,
    flags:        raw.flags ?? 0,
    battery:      raw.battery,
    rssi:         raw.rssi,
    snr:          raw.snr,
    gateway_id:   raw.gateway,
    gateway:      raw.gateway,
    rx_ms:        raw.rx_ms,
    received_at:  result.fetchedAt,
  }
      global.__latestReading = reading
      return Response.json({ ok: true, data: reading, source: 'firebase-direct' })
    }
  } catch {}

  // ── 4. Mock fallback ──────────────────────────────────────
  const { MOCK_LATEST_READING } = await import('@/lib/mock/telemetry')
  const mock: Reading = {
    ...MOCK_LATEST_READING,
    received_at: new Date().toISOString(),
    rx_ms:       Date.now(),
  }
  return Response.json({ ok: true, data: mock, mock: true, source: 'mock' })
}
