// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Reading DB queries
// ─────────────────────────────────────────────────────────────

import { query, execute } from './client'
import type { Reading, HistoryQuery } from '@/types'

// ── Insert a new reading (dedup via unique constraint on device_id+seq) ──
export async function insertReading(
  r: Omit<Reading, 'id'>,
): Promise<number> {
  const result = await execute(
    `INSERT INTO readings
      (device_id, seq, uptime_ms, ph, tds, turbidity, flow_lpm,
       total_liters, pump_status, uv_status, relay1, relay2, relay3,
       relay4, flags, battery, rssi, snr, gateway_id, received_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE id=id`,
    [
      r.device_id, r.seq, r.uptime_ms, r.ph, r.tds, r.turbidity,
      r.flow_lpm, r.total_liters,
      r.pump_status ? 1 : 0,
      r.uv_status   ? 1 : 0,
      r.relay1      ? 1 : 0,
      r.relay2      ? 1 : 0,
      r.relay3      ? 1 : 0,
      r.relay4      ? 1 : 0,
      r.flags       ?? 0,
      r.battery, r.rssi, r.snr, r.gateway_id, r.received_at,
    ],
  )
  return result.insertId
}

// ── Latest reading for a device ───────────────────────────
export async function getLatestReading(
  deviceId = 'FILTRAZON-01',
): Promise<Reading | null> {
  const rows = await query<Reading>(
    `SELECT * FROM readings
     WHERE device_id = ?
     ORDER BY received_at DESC
     LIMIT 1`,
    [deviceId],
  )
  return rows[0] ?? null
}

// ── History with filters ──────────────────────────────────
export async function getReadings(opts: HistoryQuery): Promise<Reading[]> {
  const conditions: string[]                       = []
  const values: (string | number | boolean | null)[] = []

  if (opts.device_id) {
    conditions.push('device_id = ?')
    values.push(opts.device_id)
  }
  if (opts.from) {
    conditions.push('received_at >= ?')
    values.push(opts.from)
  }
  if (opts.to) {
    conditions.push('received_at <= ?')
    values.push(opts.to)
  }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit  = Math.min(opts.limit  ?? 100, 1000)
  const offset = opts.offset ?? 0

  return query<Reading>(
    `SELECT * FROM readings
     ${where}
     ORDER BY received_at DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  )
}

// ── Chart data (single metric, time-series) ───────────────
export async function getChartData(
  deviceId: string,
  metric: string,
  fromIso: string,
): Promise<Array<{ received_at: string; value: number }>> {
  const allowed = ['ph', 'tds', 'turbidity', 'flow_lpm']
  if (!allowed.includes(metric)) throw new Error(`Invalid metric: ${metric}`)

  return query<{ received_at: string; value: number }>(
    `SELECT received_at, ${mysqlEscapeIdent(metric)} AS value
     FROM readings
     WHERE device_id = ? AND received_at >= ?
     ORDER BY received_at ASC
     LIMIT 500`,
    [deviceId, fromIso],
  )
}

// Simple identifier guard (metric name already validated above)
function mysqlEscapeIdent(s: string): string {
  return '`' + s.replace(/`/g, '') + '`'
}
