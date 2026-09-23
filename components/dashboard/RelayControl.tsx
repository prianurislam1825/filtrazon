'use client'

import { useState, useEffect, useRef } from 'react'
import { Zap, ZapOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { FirebaseReading, RelayCommand } from '@/types'
import { useLang } from '@/lib/i18n/context'

// ── Types ─────────────────────────────────────────────────────
type CmdState = 'idle' | 'sending' | 'success' | 'error'

interface RelayState {
  cmdState: CmdState
  error?: string
}

const INITIAL_RELAY_STATE: RelayState = { cmdState: 'idle' }

// ── Helper: relay name label ──────────────────────────────────
function relayLabel(index: 1 | 2 | 3 | 4, names?: Record<string, string>, lang: 'id' | 'en' = 'id'): string {
  if (names) {
    const k = `relay${index}_name`
    if (names[k]) return names[k]
  }
  const defaults: Record<'id' | 'en', string[]> = {
    id: ['Pompa Utama', 'UV Sterilizer', 'Relay 3', 'Relay 4'],
    en: ['Main Pump',   'UV Sterilizer', 'Relay 3', 'Relay 4'],
  }
  return defaults[lang][index - 1]
}

// ── Status badge for a pending command ───────────────────────
function CmdStatusBadge({ state, error, lang }: { state: CmdState; error?: string; lang: 'id' | 'en' }) {
  if (state === 'idle') return null
  const cfg: Record<CmdState, { cls: string; icon: React.ReactNode; label: string }> = {
    idle:    { cls: '', icon: null, label: '' },
    sending: { cls: 'text-sky-600',   icon: <Loader2 size={11} className="animate-spin" />, label: lang === 'id' ? 'Mengirim command...' : 'Sending command...' },
    success: { cls: 'text-green-600', icon: <CheckCircle size={11} />,                      label: lang === 'id' ? 'Perintah terkirim' : 'Command sent' },
    error:   { cls: 'text-red-600',   icon: <AlertCircle size={11} />,                      label: error ?? (lang === 'id' ? 'Gagal kirim' : 'Send failed') },
  }
  const c = cfg[state]
  return (
    <span className={`flex items-center gap-1 text-[10px] font-semibold ${c.cls}`}>
      {c.icon}{c.label}
    </span>
  )
}

// ── Individual relay row ──────────────────────────────────────
function RelayRow({
  index, label, isOn, isLoading,
  onCmd, cmdState, cmdError, disabled, lang,
}: {
  index:    1 | 2 | 3 | 4
  label:    string
  isOn:     boolean
  isLoading:boolean
  onCmd:    (cmd: RelayCommand) => void
  cmdState: CmdState
  cmdError?: string
  disabled: boolean
  lang: 'id' | 'en'
}) {
  const onCmd_  = `R${index}ON`  as RelayCommand
  const offCmd_ = `R${index}OFF` as RelayCommand
  const isSending = cmdState === 'sending'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      {/* Status dot */}
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${
        isLoading ? 'bg-gray-200 animate-pulse' :
        isOn      ? 'bg-green-500 shadow-sm shadow-green-300 ring-2 ring-green-200' : 'bg-gray-300'
      }`} />

      {/* Label & Status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{label}</p>
        <CmdStatusBadge state={cmdState} error={cmdError} lang={lang} />
      </div>

      {/* Current status badge */}
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border mr-1 transition-colors ${
        isLoading ? 'bg-gray-50 text-gray-300 border-gray-100' :
        isOn
          ? 'bg-green-100 text-green-700 border-green-200'
          : 'bg-gray-100 text-gray-500 border-gray-200'
      }`}>
        {isLoading ? '...' : isOn ? 'ON' : 'OFF'}
      </span>

      {/* Control Buttons */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onCmd(onCmd_)}
          disabled={disabled || isSending}
          aria-label={`${label} ON`}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${
            isOn
              ? 'bg-green-600 text-white shadow-sm ring-1 ring-green-600'
              : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 border border-gray-200'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isSending && !isOn ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
          ON
        </button>
        <button
          onClick={() => onCmd(offCmd_)}
          disabled={disabled || isSending}
          aria-label={`${label} OFF`}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
            !isOn
              ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-600'
              : 'bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-700 border border-gray-200'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isSending && isOn ? <Loader2 size={11} className="animate-spin" /> : <ZapOff size={11} />}
          OFF
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
interface RelayControlProps {
  firebaseReading: FirebaseReading | null
  relayNames?: Record<string, string>
  onRelayUpdate?: (relays: Record<number, boolean>) => void
}

export default function RelayControl({ firebaseReading, relayNames, onRelayUpdate }: RelayControlProps) {
  const { lang } = useLang()
  const fb = firebaseReading

  // Local optimistic relay states
  const [localRelays, setLocalRelays] = useState<Record<number, boolean>>({
    1: false, 2: false, 3: false, 4: false,
  })

  // Command status per relay
  const [states, setStates] = useState<Record<number, RelayState>>({
    1: { ...INITIAL_RELAY_STATE },
    2: { ...INITIAL_RELAY_STATE },
    3: { ...INITIAL_RELAY_STATE },
    4: { ...INITIAL_RELAY_STATE },
  })

  const resetTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  // Keep localRelays in sync with Firebase when no command is active
  useEffect(() => {
    if (!fb) return
    setLocalRelays(prev => ({
      1: states[1].cmdState !== 'idle' ? prev[1] : !!fb.relay1,
      2: states[2].cmdState !== 'idle' ? prev[2] : !!fb.relay2,
      3: states[3].cmdState !== 'idle' ? prev[3] : !!fb.relay3,
      4: states[4].cmdState !== 'idle' ? prev[4] : !!fb.relay4,
    }))
  }, [fb, states])

  async function sendCommand(relay: 1 | 2 | 3 | 4, cmd: RelayCommand) {
    const isTurningOn = cmd.endsWith('ON')
    const prevVal = localRelays[relay]

    setLocalRelays(prev => {
      const next = { ...prev, [relay]: isTurningOn }
      onRelayUpdate?.(next)
      return next
    })

    setStates(prev => ({ ...prev, [relay]: { cmdState: 'sending' } }))

    if (resetTimers.current[relay]) {
      clearTimeout(resetTimers.current[relay])
    }

    try {
      const res = await fetch('/api/control', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ command: cmd }),
      })
      const json = await res.json()

      if (!res.ok || !json.ok) {
        setLocalRelays(prev => {
          const next = { ...prev, [relay]: prevVal }
          onRelayUpdate?.(next)
          return next
        })
        setStates(prev => ({ ...prev, [relay]: { cmdState: 'error', error: json.error ?? (lang === 'id' ? 'Gagal' : 'Failed') } }))
        resetTimers.current[relay] = setTimeout(() => {
          setStates(prev => ({ ...prev, [relay]: { cmdState: 'idle' } }))
        }, 3000)
        return
      }

      setStates(prev => ({ ...prev, [relay]: { cmdState: 'success' } }))
      resetTimers.current[relay] = setTimeout(() => {
        setStates(prev => ({ ...prev, [relay]: { cmdState: 'idle' } }))
      }, 1500)
    } catch (err) {
      setLocalRelays(prev => {
        const next = { ...prev, [relay]: prevVal }
        onRelayUpdate?.(next)
        return next
      })
      const msg = err instanceof Error ? err.message : (lang === 'id' ? 'Koneksi error' : 'Connection error')
      setStates(prev => ({ ...prev, [relay]: { cmdState: 'error', error: msg } }))
      resetTimers.current[relay] = setTimeout(() => {
        setStates(prev => ({ ...prev, [relay]: { cmdState: 'idle' } }))
      }, 3000)
    }
  }

  async function handleBatch(cmd: 'ALLON' | 'ALLOFF') {
    const isTurningOn = cmd === 'ALLON'
    const prevValues = { ...localRelays }
    const errText = lang === 'id' ? 'Gagal' : 'Failed'
    const connErrText = lang === 'id' ? 'Koneksi error' : 'Connection error'

    const allState = { 1: isTurningOn, 2: isTurningOn, 3: isTurningOn, 4: isTurningOn }
    setLocalRelays(allState)
    onRelayUpdate?.(allState)

    setStates({
      1: { cmdState: 'sending' },
      2: { cmdState: 'sending' },
      3: { cmdState: 'sending' },
      4: { cmdState: 'sending' },
    })

    try {
      const res = await fetch('/api/control', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ command: cmd }),
      })
      const json = await res.json()

      if (!res.ok || !json.ok) {
        setLocalRelays(prevValues)
        onRelayUpdate?.(prevValues)
        setStates({
          1: { cmdState: 'error', error: errText },
          2: { cmdState: 'error', error: errText },
          3: { cmdState: 'error', error: errText },
          4: { cmdState: 'error', error: errText },
        })
        setTimeout(() => {
          setStates({
            1: { cmdState: 'idle' },
            2: { cmdState: 'idle' },
            3: { cmdState: 'idle' },
            4: { cmdState: 'idle' },
          })
        }, 3000)
        return
      }

      setStates({
        1: { cmdState: 'success' },
        2: { cmdState: 'success' },
        3: { cmdState: 'success' },
        4: { cmdState: 'success' },
      })
      setTimeout(() => {
        setStates({
          1: { cmdState: 'idle' },
          2: { cmdState: 'idle' },
          3: { cmdState: 'idle' },
          4: { cmdState: 'idle' },
        })
      }, 1500)
    } catch {
      setLocalRelays(prevValues)
      onRelayUpdate?.(prevValues)
      setStates({
        1: { cmdState: 'error', error: connErrText },
        2: { cmdState: 'error', error: connErrText },
        3: { cmdState: 'error', error: connErrText },
        4: { cmdState: 'error', error: connErrText },
      })
      setTimeout(() => {
        setStates({
          1: { cmdState: 'idle' },
          2: { cmdState: 'idle' },
          3: { cmdState: 'idle' },
          4: { cmdState: 'idle' },
        })
      }, 3000)
    }
  }

  const noFirebase = !fb
  const isDemoMode = fb ? (fb.flags & 0x08) !== 0 : false

  return (
    <div className="card overflow-hidden" role="region" aria-label="Relay control">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div>
          <p className="text-xs font-bold text-[#15324A] uppercase tracking-wider">
            {lang === 'id' ? 'Kontrol Relay' : 'Relay Control'}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {noFirebase
              ? (lang === 'id' ? 'Menunggu koneksi Firebase...' : 'Waiting for Firebase connection...')
              : `${lang === 'id' ? 'Status Realtime' : 'Realtime Status'} · seq #${fb.seq}`}
          </p>
        </div>
        {isDemoMode && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            DEMO MODE
          </span>
        )}
      </div>

      {/* Notice */}
      <div className="mx-4 mt-3 mb-1 flex items-start gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60">
        <Zap size={11} className="mt-0.5 shrink-0 text-emerald-600" />
        {lang === 'id'
          ? 'Kontrol real-time aktif — Perintah ON/OFF dieksekusi seketika ke Firebase dan perangkat IoT tanpa penundaan.'
          : 'Real-time control active — ON/OFF commands are instantly executed to Firebase and the IoT device without delay.'}
      </div>

      {/* Relay rows */}
      <div className="px-4 pb-2">
        {([1, 2, 3, 4] as const).map(idx => (
          <RelayRow
            key={idx}
            index={idx}
            label={relayLabel(idx, relayNames, lang)}
            isOn={localRelays[idx]}
            isLoading={noFirebase}
            onCmd={(cmd) => sendCommand(idx, cmd)}
            cmdState={states[idx].cmdState}
            cmdError={states[idx].error}
            disabled={noFirebase}
            lang={lang}
          />
        ))}
      </div>

      {/* All ON / All OFF */}
      <div className="flex gap-2 px-4 pb-4 pt-2 border-t border-gray-100">
        <button
          onClick={() => handleBatch('ALLON')}
          disabled={noFirebase}
          className="flex-1 py-2 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-green-200"
        >
          <Zap size={13} />
          {lang === 'id' ? 'Semua ON (All ON)' : 'All ON'}
        </button>
        <button
          onClick={() => handleBatch('ALLOFF')}
          disabled={noFirebase}
          className="flex-1 py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-rose-200"
        >
          <ZapOff size={13} />
          {lang === 'id' ? 'Semua OFF (All OFF)' : 'All OFF'}
        </button>
      </div>
    </div>
  )
}
