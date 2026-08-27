// POST /api/ingest
// Receives telemetry from ESP32/Gateway
// Flow: validate token → validate payload → dedup → save MySQL → eval threshold → alert → SSE broadcast

import { type NextRequest } from 'next/server'
import { validateDeviceToken, isLocalMode } from '@/lib/config'
import { broadcastReading, broadcastAlert, startHeartbeat } from '@/lib/sse/broadcaster'
import { generateAlertCandidates } from '@/lib/thresholds'
import type { IngestPayload, Reading, Alert } from '@/types'

// Start heartbeat once on module load
startHeartbeat()

// In-memory dedup for dev/local mode (DB handles it in cloud via unique constraint)
const recentSeqs = new Map<string, Set<number>>()

function isDuplicate(deviceId: string, seq: number): boolean {
  if (!recentSeqs.has(deviceId)) recentSeqs.set(deviceId, new Set())
  const seqs = recentSeqs.get(deviceId)!
  if (seqs.has(seq)) return true
  seqs.add(seq)
  // Keep only last 200 seqs per device
  if (seqs.size > 200) {
    const first = seqs.values().next().value as number
    seqs.delete(first)
  }
  return false
}

function validatePayload(body: unknown): body is IngestPayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.device_id  === 'string' &&
    typeof b.seq        === 'number' &&
    typeof b.ph         === 'number' &&
    typeof b.tds        === 'number' &&
    typeof b.turbidity  === 'number' &&
    typeof b.flow_lpm   === 'number' &&
    typeof b.total_liters === 'number' &&
    typeof b.rssi       === 'number' &&
    typeof b.snr        === 'number' &&
    typeof b.gateway    === 'string'
  )
}

export async function POST(request: NextRequest): Promise<Response> {
  // ── 1. Validate device token ──────────────────────────────
  const token = request.headers.get('x-device-token')
  if (!isLocalMode() && !validateDeviceToken(token)) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse body ─────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  // ── 3. Validate payload structure ─────────────────────────
  if (!validatePayload(body)) {
    return Response.json({ ok: false, error: 'Invalid payload schema' }, { status: 400 })
  }

  // ── 4. Dedup check ────────────────────────────────────────
  if (isDuplicate(body.device_id, body.seq)) {
    return Response.json({ ok: true, duplicate: true }, { status: 200 })
  }

  // ── 5. Build Reading with server timestamp ────────────────
  const receivedAt = new Date().toISOString()
  const reading: Reading = {
    id:           0, // assigned by DB
    device_id:    body.device_id,
    seq:          body.seq,
    uptime_ms:    body.uptime_ms   ?? 0,
    ph:           body.ph,
    tds:          body.tds,
    turbidity:    body.turbidity,
    flow_lpm:     body.flow_lpm,
    total_liters: body.total_liters,
    pump_status:  !!body.pump_status,
    uv_status:    !!body.uv_status,
    relay1:       !!body.relay1,
    relay2:       !!body.relay2,
    relay3:       !!body.relay3,
    relay4:       !!body.relay4,
    flags:        (body as unknown as Record<string, unknown>).flags as number ?? 0,
    battery:      body.battery ?? 0,
    rssi:         body.rssi,
    snr:          body.snr,
    gateway_id:   body.gateway,
    gateway:      body.gateway,
    rx_ms:        Date.now(),
    received_at:  receivedAt,
  }

  // ── 6. Persist to MySQL (non-blocking in local mode) ──────
  if (!isLocalMode()) {
    try {
      const { insertReading } = await import('@/lib/db/readings')
      const insertId = await insertReading(reading)
      reading.id = insertId
    } catch (err) {
      console.error('[ingest] DB insert failed:', err)
      // Continue — still broadcast to SSE even if DB fails
    }
  }

  // ── 7. Evaluate thresholds → generate alerts ──────────────
  const alertCandidates = generateAlertCandidates(
    reading.ph, reading.tds, reading.turbidity,
    reading.flow_lpm, reading.pump_status, reading.uv_status,
    reading.rssi,
  )

  for (const candidate of alertCandidates) {
    const alert: Alert = {
      id:         Date.now(),
      device_id:  reading.device_id,
      gateway_id: reading.gateway_id,
      severity:   candidate.severity,
      type:       candidate.type,
      message:    candidate.message,
      value:      candidate.value,
      threshold:  candidate.threshold,
      status:     'active',
      created_at: receivedAt,
    }
    broadcastAlert(alert)

    // Persist alert to DB in cloud mode
    if (!isLocalMode()) {
      try {
        const { execute } = await import('@/lib/db/client')
        await execute(
          `INSERT INTO alerts (device_id, gateway_id, severity, type, message, value, threshold, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
          [
            alert.device_id,
            alert.gateway_id ?? null,
            alert.severity,
            alert.type,
            alert.message,
            String(alert.value ?? ''),
            String(alert.threshold ?? ''),
            receivedAt,
          ],
        )
      } catch {}
    }
  }

  // ── 8. SSE broadcast ──────────────────────────────────────
  broadcastReading(reading)

  // ── 9. Cache latest reading in global for /api/latest ─────
  global.__latestReading = reading

  return Response.json({ ok: true, received_at: receivedAt }, { status: 200 })
}

// Allow external callers (ESP32 over HTTP)
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Device-Token',
    },
  })
}
