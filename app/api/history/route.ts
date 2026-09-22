// GET /api/history
// Returns paginated reading history with optional filters

import { type NextRequest } from 'next/server'
import { isLocalMode } from '@/lib/config'
import { evaluateWaterQuality } from '@/lib/thresholds'
import type { TelemetryRow } from '@/types'

export async function GET(request: NextRequest): Promise<Response> {
  const sp        = request.nextUrl.searchParams
  const deviceId  = sp.get('device_id') ?? undefined
  const from      = sp.get('from')      ?? undefined
  const to        = sp.get('to')        ?? undefined
  const limitStr  = sp.get('limit')     ?? '20'
  const offsetStr = sp.get('offset')    ?? '0'
  const limit     = Math.min(Math.max(parseInt(limitStr,  10) || 20, 1), 500)
  const offset    = Math.max(parseInt(offsetStr, 10) || 0, 0)

  // ── Cloud mode: query MySQL ────────────────────────────────
  if (!isLocalMode()) {
    try {
      const { getReadings } = await import('@/lib/db/readings')
      const readings = await getReadings({ device_id: deviceId, from, to, limit, offset })

      const rows: TelemetryRow[] = readings.map(r => {
        const q = evaluateWaterQuality(r.ph, r.tds, r.turbidity, r.flow_lpm, r.pump_status)
        return {
          id:          r.id,
          received_at: typeof r.received_at === 'string' ? r.received_at : new Date(r.received_at).toISOString(),
          seq:         r.seq,
          ph:          r.ph,
          tds:         r.tds,
          turbidity:   r.turbidity,
          flow_lpm:    r.flow_lpm,
          total_liters: r.total_liters ?? 0,
          rssi:        r.rssi,
          snr:         r.snr,
          pump_status: !!r.pump_status,
          uv_status:   !!r.uv_status,
          device_id:   r.device_id,
          gateway_id:  r.gateway_id,
          status:      q.status,
        }
      })

      return Response.json({ ok: true, data: rows })
    } catch (err) {
      console.error('[history] DB query failed:', err)
      return Response.json({ ok: false, error: 'Database error' }, { status: 500 })
    }
  }

  // ── Local/mock mode ────────────────────────────────────────
  const { generateMockHistory, readingsToTelemetryRows } = await import('@/lib/mock/telemetry')
  const allReadings = generateMockHistory(9, 60000).reverse()

  // Apply filters
  let filtered = allReadings
  if (deviceId) filtered = filtered.filter(r => r.device_id === deviceId)
  if (from)     filtered = filtered.filter(r => r.received_at >= from)
  if (to)       filtered = filtered.filter(r => r.received_at <= to)

  const page = filtered.slice(offset, offset + limit)
  const rows = readingsToTelemetryRows(page)

  return Response.json({ ok: true, data: rows, mock: true })
}
