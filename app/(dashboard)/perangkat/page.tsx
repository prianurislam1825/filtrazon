'use client'

import { useEffect, useState, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import { Cpu, RadioTower, RefreshCw, Wifi, WifiOff, Radio, Usb, Battery, Signal } from 'lucide-react'
import { evaluateBattery, evaluateRssi, evaluateSnr } from '@/lib/thresholds'
import { useLang } from '@/lib/i18n/context'
import type { Device, Gateway } from '@/types'

const POLL_MS = 5000

function fmtUptime(ms?: number): string {
  if (!ms) return '—'
  const h = Math.floor(ms / 3_600_000), m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 24 ? `${Math.floor(h/24)}d ${h%24}h` : `${h}h ${m}m`
}

function fmtAgo(iso?: string | null): string {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 5_000)    return 'Baru saja'
  if (ms < 60_000)   return `${Math.floor(ms/1000)}d lalu`
  if (ms < 3_600_000)return `${Math.floor(ms/60_000)}m lalu`
  return `${Math.floor(ms/3_600_000)}h lalu`
}

// ── Color-coded info row ──────────────────────────────────────
function InfoRow({ label, value, color }: {
  label: string; value: React.ReactNode; color?: string
}) {
  return (
    <div className="p-2.5 rounded-xl bg-gray-50 flex flex-col gap-0.5">
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold" style={{ color: color ?? '#1C2B3A' }}>{value}</p>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────
function DeviceBadge({ status }: { status: string }) {
  const cfg = {
    online:  { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', dot: '#22C55E', label: 'Online'  },
    warning: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', dot: '#F59E0B', label: 'Warning' },
    offline: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444', label: 'Offline' },
  }[status] ?? { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0', dot: '#CBD5E1', label: status }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot,
        animation: status === 'online' ? 'pulse 2s infinite' : undefined }} />
      {cfg.label}
    </span>
  )
}

// ── Connectivity pill ─────────────────────────────────────────
function ConnPill({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="p-2.5 rounded-xl flex items-center justify-between gap-2"
      style={{ background: on ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${on ? '#BBF7D0' : '#FECACA'}` }}>
      <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
      <span className={`text-xs font-black ${on ? 'text-green-700' : 'text-red-600'}`}>
        {on ? '✓ OK' : '✗ Off'}
      </span>
    </div>
  )
}

export default function PerangkatPage() {
  const { lang }    = useLang()
  const [devices,   setDevices]   = useState<Device[]>([])
  const [gateways,  setGateways]  = useState<Gateway[]>([])
  const [loading,   setLoading]   = useState(true)
  const [lastFetch, setLastFetch] = useState<string | null>(null)
  const [source,    setSource]    = useState('')

  const fetchDevices = useCallback(async () => {
    try {
      const res  = await fetch('/api/devices', { cache: 'no-store' })
      const json = await res.json()
      if (json.ok) {
        setDevices(json.data.devices   ?? [])
        setGateways(json.data.gateways ?? [])
        setSource(json.source ?? '')
        setLastFetch(new Date().toISOString())
      }
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchDevices()
    const t = setInterval(fetchDevices, POLL_MS)
    return () => clearInterval(t)
  }, [fetchDevices])

  const node    = devices[0]   ?? null
  const gateway = gateways[0]  ?? null

  const batResult  = node    ? evaluateBattery(node.battery    ?? 0) : null
  const rssiResult = gateway ? evaluateRssi(gateway.last_rssi  ?? 0) : null
  const snrResult  = gateway ? evaluateSnr(gateway.last_snr    ?? 0) : null

  const statusColor = (s: string) =>
    s === 'safe' ? '#15803D' : s === 'warning' ? '#92400E' : '#B91C1C'

  const T = {
    title:    { id: 'Perangkat',                  en: 'Devices'                    },
    subtitle: { id: 'Kesehatan dan konektivitas', en: 'Health and connectivity'    },
    updated:  { id: 'Diperbarui',                 en: 'Updated'                    },
    loading:  { id: 'Memuat data perangkat...',   en: 'Loading device data...'     },
    uptime:   { id: 'Uptime',                     en: 'Uptime'                     },
    battery:  { id: 'Baterai',                    en: 'Battery'                    },
    lastSeq:  { id: 'Seq Terakhir',               en: 'Last Seq'                   },
    lastSeen: { id: 'Terakhir Terlihat',           en: 'Last Seen'                  },
    firmware: { id: 'Firmware',                   en: 'Firmware'                   },
    backup:   { id: 'Backup SD',                  en: 'SD Backup'                  },
    active:   { id: 'Aktif',                      en: 'Active'                     },
    queued:   { id: 'Paket Antri',                en: 'Queued Pkts'                },
    lastSync: { id: 'Sinkronisasi Terakhir',      en: 'Last Sync'                  },
    signal:   { id: 'Sinyal',                     en: 'Signal'                     },
    node:     { id: 'Node Sensor',                en: 'Sensor Node'                },
    gateway:  { id: 'Gateway',                    en: 'Gateway'                    },
    liveData: { id: 'Data diperbarui setiap',     en: 'Data updated every'         },
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
            {lastFetch && (
              <span className="text-[10px] text-gray-400 hidden sm:block">
                {T.updated[lang]} {fmtAgo(lastFetch)}
              </span>
            )}
            <button onClick={fetchDevices} aria-label="Refresh"
              className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Source badge */}
        {source && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
            source.includes('firebase')
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${source.includes('firebase') ? 'bg-sky-500 animate-pulse' : 'bg-gray-400'}`} />
            {source.includes('firebase') ? 'Firebase Live' : source}
          </span>
        )}

        {loading && !node ? (
          <div className="card p-10 flex items-center justify-center gap-2 text-gray-400">
            <RefreshCw size={18} className="animate-spin text-[#0096C7]" />
            <span className="text-sm">{T.loading[lang]}</span>
          </div>
        ) : (
          <div className="space-y-4">

            {/* ── NODE CARD ─────────────────────────────────── */}
            {node && (
              <div className="card p-4"
                style={{ borderTop: `3px solid ${node.status === 'online' ? '#22C55E' : node.status === 'warning' ? '#F59E0B' : '#EF4444'}` }}>

                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: '#E3F2FD', color: '#1565C0' }}>
                      <Cpu size={22} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#15324A]">
                        {node.name ?? 'FILTRAZON NODE 01'}
                      </p>
                      <p className="text-[11px] text-gray-400">{node.id}</p>
                    </div>
                  </div>
                  <DeviceBadge status={node.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <InfoRow label={T.uptime[lang]}   value={fmtUptime(node.uptime_ms)} />
                  <InfoRow
                    label={T.battery[lang]}
                    value={
                      node.battery && node.battery > 0
                        ? <span className="flex items-center gap-1">
                            <Battery size={14} />
                            {node.battery}%
                          </span>
                        : 'N/A'
                    }
                    color={batResult ? statusColor(batResult.status) : undefined}
                  />
                  <InfoRow label={T.lastSeq[lang]}  value={node.last_seq ? `#${node.last_seq}` : '—'} />
                  <InfoRow label={T.lastSeen[lang]}  value={fmtAgo(node.last_seen)} />
                  <InfoRow label={T.firmware[lang]}  value={node.firmware ?? '—'} />
                  <InfoRow label={T.backup[lang]}
                    value={node.sd_backup ? (lang === 'id' ? 'Aktif' : 'Active') : (lang === 'id' ? 'Mati' : 'Off')}
                    color={node.sd_backup ? '#15803D' : '#92400E'} />
                </div>

                {node.status === 'online' && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    {T.liveData[lang]} {POLL_MS / 1000}s
                  </div>
                )}
              </div>
            )}

            {/* ── GATEWAY CARD ──────────────────────────────── */}
            {gateway && (
              <div className="card p-4"
                style={{ borderTop: `3px solid ${gateway.status === 'online' ? '#22C55E' : gateway.status === 'warning' ? '#F59E0B' : '#EF4444'}` }}>

                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: '#E8F5E9', color: '#43A047' }}>
                      <RadioTower size={22} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#15324A]">
                        {gateway.name ?? 'GATEWAY 01'}
                      </p>
                      <p className="text-[11px] text-gray-400">{gateway.id}</p>
                    </div>
                  </div>
                  <DeviceBadge status={gateway.status} />
                </div>

                {/* Connectivity grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <ConnPill on={gateway.lora_connected} label="LoRa" />
                  <ConnPill on={gateway.wifi_connected}  label="WiFi" />
                  <ConnPill on={gateway.usb_connected}   label="USB"  />
                </div>

                {/* Signal metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <InfoRow
                    label="RSSI"
                    value={gateway.last_rssi != null
                      ? <span className="flex items-center gap-1">
                          <Signal size={13} />
                          {gateway.last_rssi} dBm
                        </span>
                      : '—'}
                    color={rssiResult ? statusColor(rssiResult.status) : undefined}
                  />
                  <InfoRow
                    label="SNR"
                    value={gateway.last_snr != null ? `${gateway.last_snr} dB` : '—'}
                    color={snrResult ? statusColor(snrResult.status) : undefined}
                  />
                  <InfoRow label={T.queued[lang]}  value={String(gateway.queued_packets ?? 0)}
                    color={(gateway.queued_packets ?? 0) > 10 ? '#F59E0B' : '#15803D'} />
                  <InfoRow label={T.lastSync[lang]} value={fmtAgo(gateway.last_sync)} />
                </div>

                {/* Signal quality legend */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 text-[10px]">
                  {[
                    { color: '#22C55E', label: lang === 'id' ? 'Sinyal Bagus: >-90 dBm' : 'Good Signal: >-90 dBm' },
                    { color: '#F59E0B', label: lang === 'id' ? 'Lemah: -90–-110 dBm'    : 'Weak: -90–-110 dBm'    },
                    { color: '#EF4444', label: lang === 'id' ? 'Buruk: <-110 dBm'       : 'Poor: <-110 dBm'       },
                  ].map((l, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                      <span className="text-gray-500">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
