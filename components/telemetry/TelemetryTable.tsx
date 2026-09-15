'use client'

import StatusBadge from '@/components/ui/StatusBadge'
import type { TelemetryRow } from '@/types'

interface TelemetryTableProps {
  rows:     TelemetryRow[]
  loading?: boolean
  lang?:    'id' | 'en'
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
}

function DesktopTable({ rows, lang }: { rows: TelemetryRow[]; lang: 'id'|'en' }) {
  const cols = lang === 'id'
    ? ['Waktu','Seq','pH','TDS','Kekeruhan','Laju Alir','RSSI','Status']
    : ['Time', 'Seq','pH','TDS','Turbidity', 'Flow',     'RSSI','Status']
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            {cols.map(col => (
              <th key={col} className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px] whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row, idx) => (
            <tr key={`${row.id}-${row.seq}-${row.received_at || idx}`} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-2.5 font-mono text-gray-600 whitespace-nowrap">{formatTime(row.received_at)}</td>
              <td className="px-4 py-2.5 text-gray-500">#{row.seq}</td>
              <td className="px-4 py-2.5 font-medium text-gray-800">{row.ph.toFixed(1)}</td>
              <td className="px-4 py-2.5 font-medium text-gray-800">{row.tds.toFixed(0)} <span className="text-gray-400 font-normal">ppm</span></td>
              <td className="px-4 py-2.5 font-medium text-gray-800">{row.turbidity.toFixed(0)} <span className="text-gray-400 font-normal">NTU</span></td>
              <td className="px-4 py-2.5 font-medium text-gray-800">{row.flow_lpm.toFixed(2)} <span className="text-gray-400 font-normal">L/min</span></td>
              <td className="px-4 py-2.5 font-mono text-gray-600">{row.rssi} dBm</td>
              <td className="px-4 py-2.5"><StatusBadge status={row.status} size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MobileCard({ row, lang }: { row: TelemetryRow; lang: 'id'|'en' }) {
  const L = {
    turbidity: lang === 'id' ? 'Kekeruhan' : 'Turbidity',
    flow:      lang === 'id' ? 'Laju Alir' : 'Flow',
  }
  return (
    <div className="p-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-gray-600">{formatTime(row.received_at)}</span>
        <span className="text-xs text-gray-400">#{row.seq}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
        <div className="flex justify-between">
          <span className="text-[10px] text-gray-400">pH</span>
          <span className="text-xs font-semibold text-gray-800">{row.ph.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-gray-400">TDS</span>
          <span className="text-xs font-semibold text-gray-800">{row.tds.toFixed(0)} ppm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-gray-400">{L.turbidity}</span>
          <span className="text-xs font-semibold text-gray-800">{row.turbidity.toFixed(0)} NTU</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-gray-400">{L.flow}</span>
          <span className="text-xs font-semibold text-gray-800">{row.flow_lpm.toFixed(2)} L/min</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-400">{row.rssi} dBm</span>
        <StatusBadge status={row.status} size="sm" />
      </div>
    </div>
  )
}

export default function TelemetryTable({ rows, loading, lang = 'id' }: TelemetryTableProps) {
  const title   = lang === 'id' ? 'Telemetri Terbaru' : 'Recent Telemetry'
  const packets = lang === 'id' ? 'paket' : 'packets'
  const noData  = lang === 'id' ? 'Belum ada data telemetri.' : 'No telemetry data yet.'

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="p-4 border-b border-gray-100"><div className="h-4 w-40 bg-gray-100 rounded" /></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-50">
            {[...Array(6)].map((_, j) => <div key={j} className="h-3 flex-1 bg-gray-50 rounded" />)}
          </div>
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-gray-400">{noData}</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</p>
        <span className="text-[10px] text-gray-400">{rows.length} {packets}</span>
      </div>
      <div className="hidden md:block">
        <DesktopTable rows={rows} lang={lang} />
      </div>
      <div className="md:hidden divide-y divide-gray-50">
        {rows.map((row, idx) => <MobileCard key={`${row.id}-${row.seq}-${row.received_at || idx}`} row={row} lang={lang} />)}
      </div>
    </div>
  )
}
