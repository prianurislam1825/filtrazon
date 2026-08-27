'use client'

import { Wifi, WifiOff, Database, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import type { FirebaseReading, Reading, SyncStatus } from '@/types'

// ── helpers ──────────────────────────────────────────────────
function formatAgo(iso: string | null): string {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 5_000)  return 'Just now'
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`
  return `${Math.floor(ms / 3_600_000)}h ago`
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function boolLabel(v: boolean): { label: string; cls: string } {
  return v
    ? { label: 'ON',  cls: 'text-green-700 bg-green-100 border-green-200' }
    : { label: 'OFF', cls: 'text-gray-500 bg-gray-100 border-gray-200' }
}

// ── Sync state badge ─────────────────────────────────────────
function SyncBadge({ state }: { state: SyncStatus['state'] | undefined }) {
  if (!state || state === 'unknown') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
        <RefreshCw size={10} /> CHECKING
      </span>
    )
  }
  const cfg: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    synced:   { label: 'SYNCED',     cls: 'bg-green-100 text-green-700 border-green-200',  icon: <CheckCircle size={10} /> },
    syncing:  { label: 'SYNCING',    cls: 'bg-sky-100 text-sky-700 border-sky-200',         icon: <RefreshCw size={10} className="animate-spin" /> },
    diff:     { label: 'DATA DIFF',  cls: 'bg-amber-100 text-amber-700 border-amber-200',   icon: <AlertCircle size={10} /> },
    'no-local':{ label: 'NO LOCAL',  cls: 'bg-gray-100 text-gray-600 border-gray-200',       icon: <Database size={10} /> },
    error:    { label: 'ERROR',      cls: 'bg-red-100 text-red-700 border-red-200',          icon: <AlertCircle size={10} /> },
  }
  const c = cfg[state] ?? cfg.error
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  )
}

// ── Row inside a data panel ──────────────────────────────────
function DataRow({ label, firebase, local, highlight }: {
  label:     string
  firebase:  React.ReactNode
  local:     React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`grid grid-cols-3 gap-2 py-1.5 text-xs border-b border-gray-50 last:border-0 ${highlight ? 'bg-amber-50/50 -mx-2 px-2 rounded' : ''}`}>
      <span className="text-gray-400 font-medium truncate">{label}</span>
      <span className="font-semibold text-[#1268A5] text-center">{firebase}</span>
      <span className="font-semibold text-gray-700 text-center">{local}</span>
    </div>
  )
}

function RelayPill({ on }: { on: boolean }) {
  const b = boolLabel(on)
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${b.cls}`}>{b.label}</span>
  )
}

// ── Main component ────────────────────────────────────────────
interface DataSourcePanelProps {
  firebaseReading:    FirebaseReading | null
  localReading:       Reading | null
  syncStatus:         SyncStatus | null
  lastFirebaseUpdate: string | null
}

export default function DataSourcePanel({
  firebaseReading,
  localReading,
  syncStatus,
  lastFirebaseUpdate,
}: DataSourcePanelProps) {

  const fbConnected  = syncStatus?.firebaseConnected ?? false
  const dbConnected  = syncStatus?.localDbConnected  ?? false

  return (
    <div className="card overflow-hidden" role="region" aria-label="Data source comparison">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div>
          <p className="text-xs font-bold text-[#15324A] uppercase tracking-wider">Data Sources</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Firebase Realtime ↔ Local Database</p>
        </div>
        <SyncBadge state={syncStatus?.state} />
      </div>

      {/* ── Status bar ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
        {/* Firebase status */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          {fbConnected
            ? <Wifi size={14} className="text-[#1268A5] shrink-0" />
            : <WifiOff size={14} className="text-gray-400 shrink-0" />
          }
          <div>
            <p className="text-[10px] font-semibold text-gray-600">Firebase RTDB</p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              {fbConnected
                ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />LIVE · {formatAgo(lastFirebaseUpdate)}</>
                : <><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Disconnected</>
              }
            </p>
          </div>
        </div>

        {/* Local DB status */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Database size={14} className={dbConnected ? 'text-[#1268A5] shrink-0' : 'text-gray-400 shrink-0'} />
          <div>
            <p className="text-[10px] font-semibold text-gray-600">Local Database</p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              {dbConnected
                ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Connected · seq {syncStatus?.localSeq ?? '—'}</>
                : syncStatus?.state === 'no-local'
                  ? <><span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />Belum ada data lokal</>
                  : <><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Checking...</>
              }
            </p>
          </div>
        </div>
      </div>

      {/* ── No data state ──────────────────────────────────── */}
      {!firebaseReading && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
          <RefreshCw size={22} className="animate-spin text-[#5BBCEB]" />
          <p className="text-xs">Menghubungkan ke Firebase...</p>
        </div>
      )}

      {/* ── Data comparison table ──────────────────────────── */}
      {firebaseReading && (
        <div className="px-4 pb-4">

          {/* Column headers */}
          <div className="grid grid-cols-3 gap-2 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">
            <span>Parameter</span>
            <span className="text-center text-[#1268A5]">Firebase</span>
            <span className="text-center text-gray-500">Lokal</span>
          </div>

          {/* Sensor values */}
          <DataRow
            label="pH"
            firebase={firebaseReading.ph.toFixed(2)}
            local={localReading ? localReading.ph.toFixed(2) : <span className="text-gray-300">—</span>}
            highlight={localReading !== null && Math.abs(firebaseReading.ph - localReading.ph) > 0.1}
          />
          <DataRow
            label="TDS (ppm)"
            firebase={firebaseReading.tds.toFixed(0)}
            local={localReading ? localReading.tds.toFixed(0) : <span className="text-gray-300">—</span>}
            highlight={localReading !== null && Math.abs(firebaseReading.tds - localReading.tds) > 5}
          />
          <DataRow
            label="Turbidity (NTU)"
            firebase={firebaseReading.turbidity.toFixed(0)}
            local={localReading ? localReading.turbidity.toFixed(0) : <span className="text-gray-300">—</span>}
            highlight={localReading !== null && Math.abs(firebaseReading.turbidity - localReading.turbidity) > 5}
          />
          <DataRow
            label="Flow (L/min)"
            firebase={firebaseReading.flow_lpm.toFixed(2)}
            local={localReading ? localReading.flow_lpm.toFixed(2) : <span className="text-gray-300">—</span>}
            highlight={localReading !== null && Math.abs(firebaseReading.flow_lpm - localReading.flow_lpm) > 0.1}
          />
          <DataRow
            label="Total (L)"
            firebase={firebaseReading.total_liters.toFixed(1)}
            local={localReading ? localReading.total_liters.toFixed(1) : <span className="text-gray-300">—</span>}
          />
          <DataRow
            label="Battery (%)"
            firebase={firebaseReading.battery < 0 ? <span className="text-gray-400">N/A</span> : `${firebaseReading.battery}%`}
            local={localReading ? (localReading.battery < 0 ? <span className="text-gray-400">N/A</span> : `${localReading.battery}%`) : <span className="text-gray-300">—</span>}
          />
          <DataRow
            label="RSSI (dBm)"
            firebase={firebaseReading.rssi}
            local={localReading ? localReading.rssi : <span className="text-gray-300">—</span>}
          />
          <DataRow
            label="SNR (dB)"
            firebase={firebaseReading.snr}
            local={localReading ? localReading.snr : <span className="text-gray-300">—</span>}
          />
          <DataRow
            label="Gateway"
            firebase={<span className="text-[10px]">{firebaseReading.gateway}</span>}
            local={localReading ? <span className="text-[10px]">{localReading.gateway_id}</span> : <span className="text-gray-300">—</span>}
          />

          {/* Relay / status row */}
          <div className="grid grid-cols-3 gap-2 py-1.5 text-xs border-b border-gray-50">
            <span className="text-gray-400 font-medium">Pump</span>
            <span className="flex justify-center"><RelayPill on={firebaseReading.pump_status} /></span>
            <span className="flex justify-center"><RelayPill on={localReading?.pump_status ?? false} /></span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1.5 text-xs border-b border-gray-50">
            <span className="text-gray-400 font-medium">UV</span>
            <span className="flex justify-center"><RelayPill on={firebaseReading.uv_status} /></span>
            <span className="flex justify-center"><RelayPill on={localReading?.uv_status ?? false} /></span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1.5 text-xs border-b border-gray-50">
            <span className="text-gray-400 font-medium">Relay 1–4</span>
            <span className="flex justify-center gap-0.5">
              {(['relay1','relay2','relay3','relay4'] as const).map(k => (
                <RelayPill key={`fb-${k}`} on={firebaseReading[k]} />
              ))}
            </span>
            <span className="flex justify-center gap-0.5">
              {localReading
                ? (['relay1','relay2','relay3','relay4'] as const).map(k => (
                    <RelayPill key={`local-${k}`} on={localReading[k]} />
                  ))
                : <span className="text-gray-300 text-[10px]">—</span>
              }
            </span>
          </div>

          {/* Seq + timing footer */}
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-[10px] text-gray-400">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-[#5BBCEB]" />
                <span className="font-semibold text-gray-500">Last Firebase Update</span>
              </div>
              <p>{formatTime(lastFirebaseUpdate)}</p>
              <p className="text-[9px]">seq #{firebaseReading.seq}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-gray-400" />
                <span className="font-semibold text-gray-500">Last Local Sync</span>
              </div>
              <p>{syncStatus?.lastLocalSync ? formatTime(syncStatus.lastLocalSync) : 'Belum ada data lokal'}</p>
              {syncStatus?.localSeq && <p className="text-[9px]">seq #{syncStatus.localSeq}</p>}
            </div>
          </div>

          {/* Diff warning */}
          {syncStatus?.state === 'diff' && (
            <div className="mt-2 flex items-start gap-2 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-700">
                Firebase seq #{syncStatus.firebaseSeq} vs lokal seq #{syncStatus.localSeq} — data sedang disinkronkan.
              </p>
            </div>
          )}
          {syncStatus?.state === 'no-local' && (
            <div className="mt-2 flex items-start gap-2 px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <Database size={13} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-gray-500">Belum ada data lokal — data dari Firebase akan segera disimpan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
