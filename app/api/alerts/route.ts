// GET /api/alerts

import { type NextRequest } from 'next/server'
import { isLocalMode } from '@/lib/config'
import type { Alert } from '@/types'

export async function GET(request: NextRequest): Promise<Response> {
  const sp     = request.nextUrl.searchParams
  const status = sp.get('status') ?? undefined   // 'active' | 'resolved'
  const limit  = Math.min(parseInt(sp.get('limit') ?? '50', 10), 200)

  if (!isLocalMode()) {
    try {
      const { query } = await import('@/lib/db/client')
      const conditions: string[]  = []
      const values: (string | number | boolean | null)[] = []

      if (status) { conditions.push('status = ?'); values.push(status) }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
      const rows  = await query<Alert>(
        `SELECT * FROM alerts ${where} ORDER BY created_at DESC LIMIT ?`,
        [...values, limit],
      )
      return Response.json({ ok: true, data: rows })
    } catch {
      return Response.json({ ok: false, error: 'Database error' }, { status: 500 })
    }
  }

  const { generateMockAlerts } = await import('@/lib/mock/telemetry')
  const alerts = generateMockAlerts()
  const filtered = status ? alerts.filter(a => a.status === status) : alerts
  return Response.json({ ok: true, data: filtered.slice(0, limit), mock: true })
}
