'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { TriangleAlert, CheckCircle2, Clock, RefreshCw, Wifi, WifiOff, ShieldX, ShieldAlert } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/lib/i18n/context'
import type { Alert, AlertSeverity } from '@/types'

// ── Per-severity config ────────────────────────────────────────
const SEV: Record<AlertSeverity, {
  bg: string; border: string; bar: string
  badge: string; dotCls: string; emoji: string
  icon: React.ReactNode
}> = {
  critical: {
    bg: 'bg-red-50', border: 'border-red-200', bar: '#EF4444',
    badge: 'bg-red-100 text-red-800 border border-red-300',
    dotCls: 'bg-red-500 animate-pulse',
    emoji: '🚨',
    icon: <ShieldX size={14} className="text-red-600" />,
  },
  warning: {
    bg: 'bg-amber-50', border: 'border-amber-200', bar: '#F59E0B',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300',
    dotCls: 'bg-amber-400',
    emoji: '⚠',
    icon: <ShieldAlert size={14} className="text-amber-600" />,
  },
  info: {
    bg: 'bg-blue-50', border: 'border-blue-200', bar: '#3B82F6',
    badge: 'bg-blue-100 text-blue-800 border border-blue-300',
    dotCls: 'bg-blue-400',
    emoji: 'ℹ',
    icon: <ShieldAlert size={14} className="text-blue-500" />,
  },
}

function AlertCard({ alert, isNew, lang }: { alert: Alert; isNew?: boolean; lang: 'id' | 'en' }) {
  const cfg        = SEV[alert.severity] ?? SEV.info
  const isResolved = alert.status === 'resolved'

  return (
    <div
      className={`
        card border transition-all duration-300 overflow-hidden
        ${isResolved ? 'opacity-60' : ''}
        ${cfg.border}
        ${isNew && !isResolved ? 'ring-2 ring-sky-400 ring-offset-1' : ''}
      `}
      style={{ borderLeft: `4px solid ${isResolved ? '#CBD5E1' : cfg.bar}` }}
      role="article"
    >
      <div className="p-3.5">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            {isResolved
              ? <CheckCircle2 size={16} className="text-green-500" />
              : cfg.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Badge row */}
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${
                isResolved ? 'bg-gray-100 text-gray-400 border border-gray-200' : cfg.badge
              }`}>
                {isResolved ? '✓' : cfg.emoji} {alert.severity}
                {isNew && !isResolved && (
                  <span className="ml-1 px-1 py-0.5 rounded bg-sky-500 text-white text-[8px] font-black">NEW</span>
                )}
              </span>
              <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                <Clock size={10} />
                {new Date(alert.created_at).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Message */}
            <p className="text-sm font-semibold text-gray-800 leading-snug mb-1.5">{alert.message}</p>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              <span>{lang === 'id' ? 'Perangkat' : 'Device'}: <span className="text-gray-700 font-medium">{alert.device_id}</span></span>
              {alert.value !== undefined && (
                <span>{lang === 'id' ? 'Nilai' : 'Value'}: <span className="text-gray-700 font-medium">{alert.value}</span></span>
              )}
              {alert.threshold !== undefined && (
                <span>{lang === 'id' ? 'Batas' : 'Threshold'}: <span className="text-gray-700 font-medium">{alert.threshold}</span></span>
              )}
            </div>

            {/* Resolved info */}
            {isResolved && alert.resolved_at && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-green-600">
                <CheckCircle2 size={11} />
                {lang === 'id' ? 'Diselesaikan' : 'Resolved'}{' '}
                {new Date(alert.resolved_at).toLocaleString('id-ID')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AlertPage() {
  const { lang } = useLang()
  const [alerts,  setAlerts]  = useState<Alert[]>([])
  const [newIds,  setNewIds]  = useState<Set<number>>(new Set())
  const [filter,  setFilter]  = useState<'all' | 'active' | 'resolved'>('all')
  const [loading, setLoading] = useState(true)
  const [sseOk,   setSseOk]   = useState(false)
  const [lastPush,setLastPush]= useState<string | null>(null)

  const esRef          = useRef<EventSource | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      const res  = await fetch('/api/alerts?limit=100', { cache: 'no-store' })
      const json = await res.json()
      if (json.ok && Array.isArray(json.data)) setAlerts(json.data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  const connectSSE = useCallback(() => {
    if (esRef.current) esRef.current.close()
    const es = new EventSource('/api/live')
    esRef.current = es
    es.addEventListener('alert', (e: MessageEvent) => {
      try {
        const alert: Alert = JSON.parse(e.data)
        setLastPush(new Date().toISOString())
        setSseOk(true)
        setAlerts(prev => prev.some(a => a.id === alert.id) ? prev : [alert, ...prev])
        setNewIds(prev => new Set([...prev, alert.id]))
        setTimeout(() => setNewIds(prev => { const n = new Set(prev); n.delete(alert.id); return n }), 8000)
      } catch {}
    })
    es.addEventListener('heartbeat', () => setSseOk(true))
    es.onerror = () => {
      setSseOk(false); es.close()
      reconnectTimer.current = setTimeout(connectSSE, 3000)
    }
  }, [])

  useEffect(() => {
    connectSSE()
    return () => { esRef.current?.close(); if (reconnectTimer.current) clearTimeout(reconnectTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const critical = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length
  const warning  = alerts.filter(a => a.severity === 'warning'  && a.status === 'active').length
  const resolved = alerts.filter(a => a.status   === 'resolved').length

  const filtered = alerts.filter(a =>
    filter === 'all'      ? true :
    filter === 'active'   ? a.status === 'active' :
    a.status === 'resolved'
  )

  const T = {
    title:    { id: 'Alert',              en: 'Alerts'              },
    subtitle: { id: 'Notifikasi sistem',  en: 'System notifications' },
    critical: { id: 'Kritis',             en: 'Critical'            },
    warning:  { id: 'Peringatan',         en: 'Warning'             },
    resolved: { id: 'Selesai',            en: 'Resolved'            },
    all:      { id: 'Semua',              en: 'All'                 },
    active:   { id: 'Aktif',              en: 'Active'              },
    noAlert:  { id: 'Tidak ada alert',    en: 'No alerts'           },
    refresh:  { id: 'Refresh',            en: 'Refresh'             },
    liveNote: { id: 'Alert baru muncul otomatis via SSE', en: 'New alerts appear automatically via SSE' },
  }

  return (
    <AppShell>
      <div className="px-4 md:px-6 pt-5 pb-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-bold text-[#15324A]">{T.title[lang]}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{T.subtitle[lang]}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {sseOk
                ? <Wifi size={13} className="text-green-500" />
                : <WifiOff size={13} className="text-gray-400 animate-pulse" />}
              <span className={`text-[10px] font-black uppercase ${sseOk ? 'text-green-600' : 'text-gray-400'}`}>
                {sseOk ? 'LIVE' : 'CONNECTING'}
              </span>
            </div>
            <button onClick={fetchAlerts}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors min-h-[32px] px-2">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              {T.refresh[lang]}
            </button>
          </div>
        </div>

        {/* Critical banner most prominent */}
        {critical > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600 text-white shadow-lg"
            role="alert" aria-live="assertive">
            <span className="text-xl shrink-0">🚨</span>
            <p className="font-black text-sm">
              {critical} {lang === 'id' ? 'alert kritis aktif' : 'critical alert(s) active'} {' '}
              {lang === 'id' ? 'tindakan segera diperlukan' : 'immediate action required'}
            </p>
          </div>
        )}

        {/* Summary chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 min-h-[32px]">
            <TriangleAlert size={12} className="text-red-500" />
            <span className="text-xs font-black text-red-700">{critical} {T.critical[lang]}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 min-h-[32px]">
            <TriangleAlert size={12} className="text-amber-500" />
            <span className="text-xs font-black text-amber-700">{warning} {T.warning[lang]}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 min-h-[32px]">
            <CheckCircle2 size={12} className="text-green-500" />
            <span className="text-xs font-black text-green-700">{resolved} {T.resolved[lang]}</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(['all', 'active', 'resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
              className={`text-xs font-semibold px-3 py-2 rounded-lg capitalize transition-all min-h-[32px] ${
                filter === f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {T[f as 'all' | 'active' | 'resolved'][lang]}
              {f === 'active' && critical + warning > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black">
                  {critical + warning}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Alert list */}
        {loading ? (
          <div className="card p-8 flex items-center justify-center gap-2 text-gray-400">
            <RefreshCw size={16} className="animate-spin text-[#0096C7]" />
            <span className="text-sm">{lang === 'id' ? 'Memuat...' : 'Loading...'}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <EmptyState variant="no-data" title={T.noAlert[lang]}
              message={filter === 'active'
                ? (lang === 'id' ? 'Tidak ada alert aktif sistem berjalan normal.' : 'No active alerts system running normally.')
                : (lang === 'id' ? 'Tidak ada alert yang sesuai filter.' : 'No alerts match the selected filter.')}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(a => <AlertCard key={a.id} alert={a} isNew={newIds.has(a.id)} lang={lang} />)}
          </div>
        )}

        {/* Live note */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${sseOk ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          {T.liveNote[lang]}
          {lastPush && <span className="ml-1">· {new Date(lastPush).toLocaleTimeString('id-ID')}</span>}
        </div>
      </div>
    </AppShell>
  )
}
