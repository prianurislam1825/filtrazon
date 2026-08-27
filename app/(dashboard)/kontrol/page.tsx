'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import RelayControl from '@/components/dashboard/RelayControl'
import ConnectionBadge from '@/components/ui/ConnectionBadge'
import { evaluateConnectionStatus } from '@/lib/thresholds'
import { RefreshCw, Zap } from 'lucide-react'
import type { FirebaseReading, ConnectionStatus } from '@/types'

const POLL_MS = 5000

function formatAgo(iso: string | null): string {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 5_000)  return 'Just now'
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`
  return `${Math.floor(ms / 60_000)}m ago`
}

export default function KontrolPage() {
  const [fbReading,   setFbReading]   = useState<FirebaseReading | null>(null)
  const [connStatus,  setConnStatus]  = useState<ConnectionStatus>('connecting')
  const [lastUpdate,  setLastUpdate]  = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async () => {
    try {
      const res  = await fetch('/api/firebase-sync', { cache: 'no-store' })
      const json = await res.json()
      if (json.ok && json.firebase) {
        const fb: FirebaseReading = json.firebase
        setFbReading(fb)
        setLastUpdate(fb.fetched_at)
        setConnStatus(evaluateConnectionStatus(fb.fetched_at))
      } else {
        setConnStatus('offline')
      }
    } catch {
      setConnStatus('offline')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    poll()
    pollRef.current = setInterval(poll, POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [poll])

  return (
    <AppShell connectionStatus={connStatus}>
      <div className="px-4 md:px-6 pt-5 pb-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-[#15324A] flex items-center gap-2">
              <Zap size={18} className="text-[#1268A5]" />
              Kontrol Relay
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Command dikirim ke Firebase /filtrazon/cmd → Gateway → LoRa → Node
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ConnectionBadge status={connStatus} />
            <button
              onClick={poll}
              aria-label="Refresh"
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Last update info */}
        {lastUpdate && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className={`w-1.5 h-1.5 rounded-full ${connStatus === 'live' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            Firebase diperbarui {formatAgo(lastUpdate)}
            {fbReading && <span className="ml-1">· seq #{fbReading.seq}</span>}
          </div>
        )}

        {/* Relay control panel */}
        {loading ? (
          <div className="card p-8 flex items-center justify-center gap-2 text-gray-400">
            <RefreshCw size={16} className="animate-spin text-[#5BBCEB]" />
            <span className="text-sm">Menghubungkan ke Firebase...</span>
          </div>
        ) : (
          <RelayControl firebaseReading={fbReading} />
        )}

        {/* Current status table */}
        {fbReading && (
          <div className="card p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Status Saat Ini (dari Firebase)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                [
                  { label: 'Pompa', value: fbReading.pump_status },
                  { label: 'UV',    value: fbReading.uv_status   },
                  { label: 'Relay 3', value: fbReading.relay3    },
                  { label: 'Relay 4', value: fbReading.relay4    },
                ] as { label: string; value: boolean }[]
              ).map(item => (
                <div key={item.label} className="p-2.5 rounded-lg bg-gray-50 text-center">
                  <p className="text-[10px] text-gray-400 font-medium mb-1">{item.label}</p>
                  <span className={`text-sm font-bold ${item.value ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.value ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>

            {/* Sensor quick view */}
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500">
              <div><span className="text-gray-400">pH: </span><strong>{fbReading.ph.toFixed(2)}</strong></div>
              <div><span className="text-gray-400">Flow: </span><strong>{fbReading.flow_lpm.toFixed(2)} L/min</strong></div>
              <div><span className="text-gray-400">RSSI: </span><strong>{fbReading.rssi} dBm</strong></div>
              <div><span className="text-gray-400">Battery: </span>
                <strong>{fbReading.battery < 0 ? 'N/A' : `${fbReading.battery}%`}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Command guide */}
        <div className="card p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Protokol Command
          </p>
          <div className="text-[11px] text-gray-400 space-y-1 font-mono">
            <p>Web → POST /api/control → Firebase /filtrazon/cmd</p>
            <p>Gateway ← polling Firebase /cmd</p>
            <p>Gateway → LoRa → Node (ESP32)</p>
            <p>Node → ACK → Gateway → Firebase /latest</p>
            <p>Dashboard membaca /latest → status diperbarui</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['R1ON','R1OFF','R2ON','R2OFF','R3ON','R3OFF','R4ON','R4OFF','ALLON','ALLOFF','FLOWRESET'].map(cmd => (
              <span key={cmd} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                {cmd}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
