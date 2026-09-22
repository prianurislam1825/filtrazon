'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import EmptyState from '@/components/ui/EmptyState'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { useLang } from '@/lib/i18n/context'
import {
  evaluatePh, evaluateTds, evaluateTurbidity, evaluateFlow, evaluateWaterQuality,
} from '@/lib/thresholds'
import type { TelemetryRow } from '@/types'

const PAGE_SIZE = 20

// ── Inline color badge ────────────────────────────────────────
function StatusDot({ status, lang = 'id' }: { status: 'safe' | 'warning' | 'danger' | 'offline' | 'unknown', lang?: 'id' | 'en' }) {
  const c = {
    safe:    { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: { id: 'Aman',    en: 'Safe'    } },
    warning: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: { id: 'Waspada', en: 'Warning' } },
    danger:  { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', label: { id: 'Bahaya',  en: 'Danger'  } },
    offline: { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0', label: { id: 'Offline', en: 'Offline' } },
    unknown: { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0', label: { id: 'Unknown', en: 'Unknown' } },
  }[status]
  const emoji = { safe: '✓', warning: '⚠', danger: '🚨', offline: '—', unknown: '—' }[status]

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {emoji} {c.label[lang]}
    </span>
  )
}

// ── Value with color based on threshold ───────────────────────
function ColorValue({ value, metric, pumpOn = true }: {
  value: number; metric: 'ph' | 'tds' | 'turbidity' | 'flow'; pumpOn?: boolean
}) {
  const res =
    metric === 'ph'         ? evaluatePh(value)
    : metric === 'tds'      ? evaluateTds(value)
    : metric === 'turbidity'? evaluateTurbidity(value)
    : evaluateFlow(value, pumpOn)

  const color = res.status === 'safe' ? '#15803D' : res.status === 'warning' ? '#92400E' : '#B91C1C'
  return <span className="font-semibold" style={{ color }}>{value}</span>
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

// ── Desktop table row ─────────────────────────────────────────
function DesktopRow({ row, lang }: { row: TelemetryRow; lang: 'id' | 'en' }) {
  const qual = evaluateWaterQuality(row.ph, row.tds, row.turbidity, row.flow_lpm, row.pump_status)
  const rowBg =
    qual.status === 'danger'  ? 'bg-red-50/40 hover:bg-red-50/70' :
    qual.status === 'warning' ? 'bg-amber-50/40 hover:bg-amber-50/70' :
    'hover:bg-gray-50/50'

  return (
    <tr className={`border-b border-gray-50 transition-colors ${rowBg}`}>
      <td className="px-4 py-2.5 text-xs font-mono text-gray-600 whitespace-nowrap">{formatDateTime(row.received_at)}</td>
      <td className="px-4 py-2.5 text-xs text-gray-500">#{row.seq}</td>
      <td className="px-4 py-2.5 text-xs"><ColorValue value={row.ph} metric="ph" /></td>
      <td className="px-4 py-2.5 text-xs"><ColorValue value={row.tds} metric="tds" /></td>
      <td className="px-4 py-2.5 text-xs"><ColorValue value={row.turbidity} metric="turbidity" /></td>
      <td className="px-4 py-2.5 text-xs"><ColorValue value={row.flow_lpm} metric="flow" pumpOn={row.pump_status} /></td>
      <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">{row.total_liters?.toFixed(1) ?? '—'}</td>
      <td className="px-4 py-2.5 text-xs">
        <span className={`font-bold ${row.pump_status ? 'text-green-600' : 'text-gray-400'}`}>
          {row.pump_status ? (lang === 'id' ? 'NYALA' : 'ON') : (lang === 'id' ? 'MATI' : 'OFF')}
        </span>
      </td>
      <td className="px-4 py-2.5 text-xs">
        <span className={`font-bold ${row.uv_status ? 'text-green-600' : 'text-gray-400'}`}>
          {row.uv_status ? (lang === 'id' ? 'NYALA' : 'ON') : (lang === 'id' ? 'MATI' : 'OFF')}
        </span>
      </td>
      <td className="px-4 py-2.5 text-xs font-mono text-gray-600">{row.rssi}</td>
      <td className="px-4 py-2.5 text-xs font-mono text-gray-600">{row.snr}</td>
      <td className="px-4 py-2.5"><StatusDot status={row.status} lang={lang} /></td>
    </tr>
  )
}

// ── Mobile card ───────────────────────────────────────────────
function MobileCard({ row, lang }: { row: TelemetryRow; lang: 'id' | 'en' }) {
  const qual = evaluateWaterQuality(row.ph, row.tds, row.turbidity, row.flow_lpm, row.pump_status)
  const cardBorder =
    qual.status === 'danger'  ? 'border-l-4 border-l-red-500' :
    qual.status === 'warning' ? 'border-l-4 border-l-amber-400' :
    'border-l-4 border-l-green-400'

  return (
    <div className={`p-3 border-b border-gray-50 last:border-0 ${cardBorder}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-gray-500">{formatDateTime(row.received_at)}</span>
        <StatusDot status={row.status} lang={lang} />
      </div>
      {/* Sensor grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">pH</span>
          <ColorValue value={row.ph} metric="ph" />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">TDS</span>
          <span><ColorValue value={row.tds} metric="tds" /> <span className="text-gray-400">ppm</span></span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{lang === 'id' ? 'Kekeruhan' : 'Turbidity'}</span>
          <span><ColorValue value={row.turbidity} metric="turbidity" /> <span className="text-gray-400">NTU</span></span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{lang === 'id' ? 'Laju Alir' : 'Flow Rate'}</span>
          <span><ColorValue value={row.flow_lpm} metric="flow" pumpOn={row.pump_status} /> <span className="text-gray-400">L/min</span></span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{lang === 'id' ? 'Total Air' : 'Total Water'}</span>
          <span className="font-semibold text-gray-700">{row.total_liters?.toFixed(1) ?? '—'} <span className="text-gray-400">L</span></span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{lang === 'id' ? 'Pompa' : 'Pump'}</span>
          <span className={`font-bold ${row.pump_status ? 'text-green-600' : 'text-gray-400'}`}>
            {row.pump_status ? (lang === 'id' ? 'NYALA' : 'ON') : (lang === 'id' ? 'MATI' : 'OFF')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">UV</span>
          <span className={`font-bold ${row.uv_status ? 'text-green-600' : 'text-gray-400'}`}>
            {row.uv_status ? (lang === 'id' ? 'NYALA' : 'ON') : (lang === 'id' ? 'MATI' : 'OFF')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">RSSI</span>
          <span className="font-mono text-gray-600">{row.rssi} dBm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">SNR</span>
          <span className="font-mono text-gray-600">{row.snr} dB</span>
        </div>
      </div>
    </div>
  )
}

// ── Summary card ──────────────────────────────────────────────
function SummaryCard({ label, value, unit, status }: {
  label: string; value: string; unit?: string; status?: 'safe' | 'warning' | 'danger'
}) {
  const borderColor =
    status === 'danger'  ? '#EF4444' :
    status === 'warning' ? '#F59E0B' : '#22C55E'

  return (
    <div className="card p-3 text-center" style={{ borderTop: `3px solid ${borderColor}` }}>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-black leading-tight"
        style={{ color: status === 'danger' ? '#B91C1C' : status === 'warning' ? '#92400E' : '#15803D' }}>
        {value}
        {unit && <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

export default function RiwayatPage() {
  const { lang } = useLang()
  const [rows,        setRows]        = useState<TelemetryRow[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(false)
  const [page,        setPage]        = useState(0)
  const [hasMore,     setHasMore]     = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [fromDate,    setFromDate]    = useState('')
  const [toDate,      setToDate]      = useState('')
  const [deviceId,    setDeviceId]    = useState('FILTRAZON-01')
  const [exporting,   setExporting]   = useState(false)

  const fetchData = useCallback(async (pg = 0) => {
    setLoading(true); setError(false)
    try {
      const p = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(pg * PAGE_SIZE) })
      if (fromDate) p.set('from', fromDate)
      if (toDate)   p.set('to',   toDate)
      if (deviceId) p.set('device_id', deviceId)
      const res  = await fetch(`/api/history?${p}`)
      const json = await res.json()
      if (!json.ok) throw new Error()
      setRows(json.data)
      setHasMore(json.data.length === PAGE_SIZE)
    } catch { setError(true) }
    finally  { setLoading(false) }
  }, [fromDate, toDate, deviceId])

  useEffect(() => { fetchData(0); setPage(0) }, [fetchData])

  async function handleExport() {
    setExporting(true)
    try {
      const p = new URLSearchParams()
      if (fromDate) p.set('from', fromDate)
      if (toDate)   p.set('to',   toDate)
      if (deviceId) p.set('device_id', deviceId)
      const res  = await fetch(`/api/export?${p}`)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = Object.assign(document.createElement('a'), {
        href: url, download: `filtrazon-${new Date().toISOString().slice(0,10)}.csv`,
      })
      a.click(); URL.revokeObjectURL(url)
    } finally { setExporting(false) }
  }

  // Summary stats with threshold colors
  const avgPh   = rows.length ? rows.reduce((s, r) => s + r.ph,        0) / rows.length : 0
  const avgTds  = rows.length ? rows.reduce((s, r) => s + r.tds,       0) / rows.length : 0
  const avgTurb = rows.length ? rows.reduce((s, r) => s + r.turbidity, 0) / rows.length : 0
  const avgFlow = rows.length ? rows.reduce((s, r) => s + r.flow_lpm,  0) / rows.length : 0

  const T = {
    title:    { id: 'Riwayat Sensor',        en: 'Sensor History'    },
    subtitle: { id: 'Data kualitas air historis', en: 'Historical water quality data' },
    filter:   { id: 'Filter',                en: 'Filter'            },
    export:   { id: 'Ekspor CSV',            en: 'Export CSV'        },
    exporting:{ id: 'Mengekspor...',         en: 'Exporting...'      },
    from:     { id: 'Dari',                  en: 'From'              },
    to:       { id: 'Sampai',                en: 'To'                },
    device:   { id: 'Perangkat',             en: 'Device'            },
    reset:    { id: 'Reset',                 en: 'Reset'             },
    refresh:  { id: 'Refresh',               en: 'Refresh'           },
    history:  { id: 'Riwayat Sensor',        en: 'Sensor History'    },
    page:     { id: 'Halaman',               en: 'Page'              },
    records:  { id: 'data',                  en: 'records'           },
  }

  return (
    <AppShell>
      <div className="px-4 md:px-6 pt-5 pb-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-[#15324A]">{T.title[lang]}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{T.subtitle[lang]}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors min-h-[36px]">
              <Filter size={13} /> {T.filter[lang]}
            </button>
            <button onClick={handleExport} disabled={exporting || rows.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#0077B6] text-white hover:bg-[#0096C7] disabled:opacity-50 transition-colors min-h-[36px]">
              <Download size={13} />
              {exporting ? T.exporting[lang] : T.export[lang]}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'from-date', label: T.from[lang], type: 'datetime-local', val: fromDate, set: setFromDate },
                { id: 'to-date',   label: T.to[lang],   type: 'datetime-local', val: toDate,   set: setToDate   },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                  <input id={f.id} type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0096C7] min-h-[36px]" />
                </div>
              ))}
              <div>
                <label htmlFor="device-id" className="block text-xs font-semibold text-gray-500 mb-1">{T.device[lang]}</label>
                <input id="device-id" type="text" value={deviceId} onChange={e => setDeviceId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0096C7] min-h-[36px]" />
              </div>
              <div className="flex items-end">
                <button onClick={() => { setFromDate(''); setToDate(''); setDeviceId('FILTRAZON-01') }}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors min-h-[36px]">
                  {T.reset[lang]}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary with threshold colors */}
        {rows.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SummaryCard label="Avg pH"        value={avgPh.toFixed(2)}
              status={evaluatePh(avgPh).status as 'safe' | 'warning' | 'danger'} />
            <SummaryCard label="Avg TDS"       value={avgTds.toFixed(0)} unit="ppm"
              status={evaluateTds(avgTds).status as 'safe' | 'warning' | 'danger'} />
            <SummaryCard label={lang === 'id' ? 'Avg Kekeruhan' : 'Avg Turbidity'} value={avgTurb.toFixed(0)} unit="NTU"
              status={evaluateTurbidity(avgTurb).status as 'safe' | 'warning' | 'danger'} />
            <SummaryCard label={lang === 'id' ? 'Avg Laju Alir' : 'Avg Flow Rate'} value={avgFlow.toFixed(2)} unit="L/min"
              status={evaluateFlow(avgFlow, true).status as 'safe' | 'warning' | 'danger'} />
          </div>
        )}

        {/* Table / cards */}
        {loading ? (
          <TableSkeleton rows={8} />
        ) : error ? (
          <div className="card"><EmptyState variant="error" action={{ label: T.refresh[lang], onClick: () => fetchData(page) }} /></div>
        ) : rows.length === 0 ? (
          <div className="card"><EmptyState variant="no-data" /></div>
        ) : (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{T.history[lang]}</p>
              <button onClick={() => fetchData(page)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors min-h-[32px]">
                <RefreshCw size={11} /> {T.refresh[lang]}
              </button>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    {[lang === 'id' ? 'Waktu' : 'Time', 'Seq', 'pH', 'TDS',
                      lang === 'id' ? 'Kekeruhan' : 'Turbidity',
                      lang === 'id' ? 'Laju Alir' : 'Flow Rate',
                      lang === 'id' ? 'Total Air' : 'Total Water',
                      lang === 'id' ? 'Pompa' : 'Pump', 'UV', 'RSSI', 'SNR', 'Status']
                      .map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => <DesktopRow key={`${row.id}-${row.seq}-${row.received_at || idx}`} row={row} lang={lang} />)}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {rows.map((row, idx) => <MobileCard key={`${row.id}-${row.seq}-${row.received_at || idx}`} row={row} lang={lang} />)}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30">
              <span className="text-xs text-gray-400">
                {T.page[lang]} {page + 1} · {rows.length} {T.records[lang]}
              </span>
              <div className="flex items-center gap-1">
                {[
                  { label: '<', disabled: page === 0, onClick: () => { const n = Math.max(0, page-1); setPage(n); fetchData(n) } },
                  { label: '>', disabled: !hasMore,   onClick: () => { const n = page+1; setPage(n); fetchData(n) } },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.onClick} disabled={btn.disabled}
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-bold">
                    {btn.label === '<' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
