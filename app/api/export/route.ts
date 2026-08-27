// GET /api/export
// Returns a CSV file of historical readings

import { type NextRequest } from 'next/server'
import { isLocalMode } from '@/lib/config'
import { evaluateWaterQuality } from '@/lib/thresholds'

const CSV_HEADERS = [
  'timestamp','seq','device_id','gateway_id',
  'ph','tds','turbidity','flow_lpm','total_liters',
  'pump_status','uv_status','relay1','relay2','relay3','relay4',
  'battery','rssi','snr','status',
].join(',')

function row(r: Record<string, unknown>, status: string): string {
  return [
    r.received_at, r.seq, r.device_id, r.gateway_id,
    r.ph, r.tds, r.turbidity, r.flow_lpm, r.total_liters,
    r.pump_status ? 1 : 0, r.uv_status ? 1 : 0,
    r.relay1 ? 1 : 0, r.relay2 ? 1 : 0, r.relay3 ? 1 : 0, r.relay4 ? 1 : 0,
    r.battery, r.rssi, r.snr, status,
  ].join(',')
}

export async function GET(request: NextRequest): Promise<Response> {
  const sp       = request.nextUrl.searchParams
  const deviceId = sp.get('device_id') ?? undefined
  const from     = sp.get('from')      ?? undefined
  const to       = sp.get('to')        ?? undefined

  let readings: Record<string, unknown>[] = []

  if (!isLocalMode()) {
    try {
      const { getReadings } = await import('@/lib/db/readings')
      const raw = await getReadings({ device_id: deviceId, from, to, limit: 10000, offset: 0 })
      readings = raw as unknown as Record<string, unknown>[]
    } catch {
      return Response.json({ ok: false, error: 'Database error' }, { status: 500 })
    }
  } else {
    const { generateMockHistory } = await import('@/lib/mock/telemetry')
    let mock = generateMockHistory(500, 5000) as unknown as Record<string, unknown>[]
    if (deviceId) mock = mock.filter(r => r.device_id === deviceId)
    if (from)     mock = mock.filter(r => (r.received_at as string) >= from)
    if (to)       mock = mock.filter(r => (r.received_at as string) <= to)
    readings = mock
  }

  const lines = [
    CSV_HEADERS,
    ...readings.map(r => {
      const q = evaluateWaterQuality(
        r.ph as number, r.tds as number, r.turbidity as number,
        r.flow_lpm as number, !!r.pump_status,
      )
      return row(r, q.status)
    }),
  ]

  const csv      = lines.join('\n')
  const filename = `filtrazon-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
