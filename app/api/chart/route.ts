// GET /api/chart
// Returns time-series chart data from SQL for a specific metric + range.
// SQL is the correct source for historical chart data.
//
// Params:
//   metric   = ph | tds | turbidity | flow_lpm  (default: ph)
//   range    = 1H | 6H | 12H | 24H             (default: 1H)
//   device_id = FILTRAZON-01                   (default)

import { type NextRequest } from 'next/server'
import { isLocalMode } from '@/lib/config'
import type { ChartDataPoint, ChartMetric } from '@/types'

const ALLOWED_METRICS: ChartMetric[] = ['ph', 'tds', 'turbidity', 'flow_lpm']
const RANGE_HOURS: Record<string, number> = { '1H': 1, '6H': 6, '12H': 12, '24H': 24 }

export async function GET(request: NextRequest): Promise<Response> {
  const sp       = request.nextUrl.searchParams
  const metric   = (sp.get('metric') ?? 'ph') as ChartMetric
  const range    = sp.get('range')    ?? '1H'
  const deviceId = sp.get('device_id') ?? 'FILTRAZON-01'

  if (!ALLOWED_METRICS.includes(metric)) {
    return Response.json({ ok: false, error: `Invalid metric: ${metric}` }, { status: 400 })
  }

  const hours  = RANGE_HOURS[range] ?? 1
  const fromMs = Date.now() - hours * 3_600_000
  const fromIso = new Date(fromMs).toISOString()

  if (!isLocalMode()) {
    try {
      const { getChartData } = await import('@/lib/db/readings')
      const rows = await getChartData(deviceId, metric, fromIso)

      const points: ChartDataPoint[] = rows.map(r => {
        const ts   = new Date(r.received_at).getTime()
        const time = new Date(r.received_at).toLocaleTimeString('id-ID', {
          hour: '2-digit', minute: '2-digit',
          ...(hours <= 1 ? { second: '2-digit' } : {}),
        })
        return { time, ts, value: r.value }
      })

      return Response.json({ ok: true, data: points, source: 'db' })
    } catch (err) {
      console.error('[chart] DB query failed:', err)
      return Response.json({ ok: false, error: 'Database error' }, { status: 500 })
    }
  }

  // Local mode: generate mock chart data
  const { generateMockHistory, readingsToChartData, filterByRange } = await import('@/lib/mock/telemetry')
  const history = generateMockHistory(200, 5000)
  const filtered = filterByRange(history, range as '1H' | '6H' | '12H' | '24H')
  const points = readingsToChartData(filtered, metric)
  return Response.json({ ok: true, data: points, source: 'mock' })
}
