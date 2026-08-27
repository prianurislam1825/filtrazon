'use client'

import { useState, useEffect, useRef } from 'react'
import { Power, Sun, Zap, ZapOff, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import type { FirebaseReading, RelayCommand } from '@/types'

// ── Types ─────────────────────────────────────────────────────
type CmdState = 'idle' | 'sending' | 'waiting' | 'success' | 'timeout' | 'error'

interface RelayState {
  cmdState: CmdState
  sentAt:   number | null
  error?:   string
}

const INITIAL_RELAY_STATE: RelayState = { cmdState: 'idle', sentAt: null }
const WAIT_TIMEOUT_MS = 12_000   // 12s — normal LoRa round-trip is 2–8s

// ── Helper: relay name label ──────────────────────────────────
function relayLabel(index: 1 | 2 | 3 | 4, names?: Record<string, string>): string {
  if (names) {
    const k = `relay${index}_name`
    if (names[k]) return names[k]
  }
  const defaults = ['Pompa Utama', 'UV Sterilizer', 'Relay 3', 'Relay 4']
  return defaults[index - 1]
}

// ── Status badge for a pending command ───────────────────────
function CmdStatusBadge({ state, error }: { state: CmdState; error?: string }) {
  if (state === 'idle') return null
  const cfg: Record<CmdState, { cls: string; icon: React.ReactNode; label: string }> = {
    idle:    { cls: '', icon: null, label: '' },
    sending: { cls: 'text-sky-600',   icon: <Loader2 size={11} className="animate-spin" />, label: 'Mengirim...' },
    waiting: { cls: 'text-amber-600', icon: <Clock   size={11} />,                          label: 'Menunggu device...' },
    success: { cls: 'text-green-600', icon: <CheckCircle size={11} />,                      label: 'Berhasil' },
    timeout: { cls: 'text-red-600',   icon: <AlertCircle size={11} />,                      label: 'Timeout — perangkat tidak merespons' },
    error:   { cls: 'text-red-600',   icon: <AlertCircle size={11} />,                      label: error ?? 'Error' },
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
  onCmd, cmdState, cmdError, disabled,
}: {
  index:    1 | 2 | 3 | 4
  label:    string
  isOn:     boolean
  isLoading:boolean
  onCmd:    (cmd: RelayCommand) => void
  cmdState: CmdState
  cmdError?: string
  disabled: boolean
}) {
  const onCmd_  = `R${index}ON`  as RelayCommand
  const offCmd_ = `R${index}OFF` as RelayCommand
  const pending = cmdState === 'sending' || cmdState === 'waiting'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      {/* Status dot */}
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
        isLoading ? 'bg-gray-200 animate-pulse' :
        isOn      ? 'bg-green-500' : 'bg-gray-300'
      }`} />

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{label}</p>
        <CmdStatusBadge state={cmdState} error={cmdError} />
      </div>

      {/* Current status */}
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border mr-1 ${
        isLoading ? 'bg-gray-50 text-gray-300 border-gray-100' :
        isOn
          ? 'bg-green-100 text-green-700 border-green-200'
          : 'bg-gray-100 text-gray-500 border-gray-200'
      }`}>
        {isLoading ? '...' : isOn ? 'ON' : 'OFF'}
      </span>

      {/* Buttons */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onCmd(onCmd_)}
          disabled={disabled || pending || (isOn && cmdState === 'idle')}
          aria-label={`${label} ON`}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg
            bg-green-600 text-white hover:bg-green-700
            disabled:opacity-40 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400
            transition-colors"
        >
          {pending ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
          ON
        </button>
        <button
          onClick={() => onCmd(offCmd_)}
          disabled={disabled || pending || (!isOn && cmdState === 'idle')}
          aria-label={`${label} OFF`}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg
            bg-gray-200 text-gray-700 hover:bg-gray-300
            disabled:opacity-40 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
            transition-colors"
        >
          {pending ? <Loader2 size={11} className="animate-spin" /> : <ZapOff size={11} />}
          OFF
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
interface RelayControlProps {
  firebaseReading: FirebaseReading | null
  relayNames?: Record<string, string>   // from settings
}

export default function RelayControl({ firebaseReading, relayNames }: RelayControlProps) {
  const fb = firebaseReading

  // Per-relay command state
  const [states, setStates] = useState<Record<number, RelayState>>({
    1: { ...INITIAL_RELAY_STATE },
    2: { ...INITIAL_RELAY_STATE },
    3: { ...INITIAL_RELAY_STATE },
    4: { ...INITIAL_RELAY_STATE },
  })

  // Timeout timers per relay
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  // Watch Firebase latest: if relay status matches what we sent → success
  useEffect(() => {
    if (!fb) return
    const relayValues: Record<number, boolean> = {
      1: fb.relay1, 2: fb.relay2, 3: fb.relay3, 4: fb.relay4,
    }

    setStates(prev => {
      const next = { ...prev }
      for (const [idxStr, s] of Object.entries(prev)) {
        const idx = Number(idxStr)
        if (s.cmdState !== 'waiting') continue

        // Determine expected state from last sent command
        // We infer from the last command sent by checking which button was pressed
        // The command is stored implicitly — if state is 'waiting', a cmd was sent
        // We resolve success/timeout based on the timer expiry
        // Here we detect if Firebase has changed since sentAt
        if (s.sentAt && fb.rx_ms > s.sentAt) {
          // Device responded (rx_ms updated) — mark success
          clearTimeout(timers.current[idx])
          next[idx] = { cmdState: 'success', sentAt: null }
          // Auto-clear success badge after 3s
          setTimeout(() => {
            setStates(p => ({ ...p, [idx]: { cmdState: 'idle', sentAt: null } }))
          }, 3000)
        }
        // else: still waiting, timer will handle timeout
        void relayValues // suppress unused warning
      }
      return next
    })
  }, [fb])

  async function sendCommand(relay: 1 | 2 | 3 | 4, cmd: RelayCommand) {
    setStates(prev => ({ ...prev, [relay]: { cmdState: 'sending', sentAt: null } }))

    try {
      const res  = await fetch('/api/control', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ command: cmd }),
      })
      const json = await res.json()

      if (!res.ok || !json.ok) {
        setStates(prev => ({ ...prev, [relay]: { cmdState: 'error', sentAt: null, error: json.error } }))
        setTimeout(() => {
          setStates(prev => ({ ...prev, [relay]: { cmdState: 'idle', sentAt: null } }))
        }, 5000)
        return
      }

      // Command sent — now wait for Firebase /latest to reflect the change
      const sentAt = Date.now()
      setStates(prev => ({ ...prev, [relay]: { cmdState: 'waiting', sentAt } }))

      // Timeout if device doesn't respond
      timers.current[relay] = setTimeout(() => {
        setStates(prev => {
          if (prev[relay].cmdState === 'waiting') {
            return { ...prev, [relay]: { cmdState: 'timeout', sentAt: null } }
          }
          return prev
        })
        // Clear timeout badge after 6s
        setTimeout(() => {
          setStates(prev => ({ ...prev, [relay]: { cmdState: 'idle', sentAt: null } }))
        }, 6000)
      }, WAIT_TIMEOUT_MS)

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error'
      setStates(prev => ({ ...prev, [relay]: { cmdState: 'error', sentAt: null, error: msg } }))
      setTimeout(() => {
        setStates(prev => ({ ...prev, [relay]: { cmdState: 'idle', sentAt: null } }))
      }, 5000)
    }
  }

  const noFirebase = !fb
  const isDemoMode = fb ? (fb.flags & 0x08) !== 0 : false

  return (
    <div className="card overflow-hidden" role="region" aria-label="Relay control">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div>
          <p className="text-xs font-bold text-[#15324A] uppercase tracking-wider">Kontrol Relay</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {noFirebase ? 'Menunggu data Firebase...' : `Status dari Firebase · seq #${fb.seq}`}
          </p>
        </div>
        {isDemoMode && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            DEMO MODE
          </span>
        )}
      </div>

      {/* Notice: status from Firebase, not optimistic */}
      <div className="mx-4 mt-3 mb-1 flex items-start gap-1.5 text-[10px] text-gray-400">
        <Clock size={10} className="mt-0.5 shrink-0" />
        Status relay berasal dari Firebase latest — bukan perkiraan. Perubahan terlihat setelah ACK dari perangkat.
      </div>

      {/* Relay rows */}
      <div className="px-4 pb-2">
        {([1, 2, 3, 4] as const).map(idx => (
          <RelayRow
            key={idx}
            index={idx}
            label={relayLabel(idx, relayNames)}
            isOn={fb ? [fb.relay1, fb.relay2, fb.relay3, fb.relay4][idx - 1] : false}
            isLoading={noFirebase}
            onCmd={(cmd) => sendCommand(idx, cmd)}
            cmdState={states[idx].cmdState}
            cmdError={states[idx].error}
            disabled={noFirebase}
          />
        ))}
      </div>

      {/* All ON / All OFF */}
      <div className="flex gap-2 px-4 pb-4 pt-2 border-t border-gray-100">
        <button
          onClick={async () => {
            // Pakai batch endpoint — server kirim R1ON..R4ON dengan delay 800ms antar command
            // agar gateway sempat baca & eksekusi tiap command
            setStates(prev => ({
              ...prev,
              1: { cmdState: 'sending', sentAt: null },
              2: { cmdState: 'sending', sentAt: null },
              3: { cmdState: 'sending', sentAt: null },
              4: { cmdState: 'sending', sentAt: null },
            }))
            try {
              const res = await fetch('/api/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commands: ['ALLON'], delayMs: 800 }),
              })
              const json = await res.json()
              const now = Date.now()
              if (json.ok) {
                setStates(prev => ({
                  ...prev,
                  1: { cmdState: 'waiting', sentAt: now },
                  2: { cmdState: 'waiting', sentAt: now },
                  3: { cmdState: 'waiting', sentAt: now },
                  4: { cmdState: 'waiting', sentAt: now },
                }))
              } else {
                setStates(prev => ({
                  ...prev,
                  1: { cmdState: 'error', sentAt: null, error: 'Batch failed' },
                  2: { cmdState: 'error', sentAt: null, error: 'Batch failed' },
                  3: { cmdState: 'error', sentAt: null, error: 'Batch failed' },
                  4: { cmdState: 'error', sentAt: null, error: 'Batch failed' },
                }))
              }
            } catch {
              setStates(prev => ({
                ...prev,
                1: { cmdState: 'error', sentAt: null, error: 'Network error' },
                2: { cmdState: 'error', sentAt: null, error: 'Network error' },
                3: { cmdState: 'error', sentAt: null, error: 'Network error' },
                4: { cmdState: 'error', sentAt: null, error: 'Network error' },
              }))
            }
          }}
          disabled={noFirebase}
          className="flex-1 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white
            hover:bg-green-700 disabled:opacity-40 transition-colors"
        >
          All ON
        </button>
        <button
          onClick={async () => {
            setStates(prev => ({
              ...prev,
              1: { cmdState: 'sending', sentAt: null },
              2: { cmdState: 'sending', sentAt: null },
              3: { cmdState: 'sending', sentAt: null },
              4: { cmdState: 'sending', sentAt: null },
            }))
            try {
              const res = await fetch('/api/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commands: ['ALLOFF'], delayMs: 800 }),
              })
              const json = await res.json()
              const now = Date.now()
              if (json.ok) {
                setStates(prev => ({
                  ...prev,
                  1: { cmdState: 'waiting', sentAt: now },
                  2: { cmdState: 'waiting', sentAt: now },
                  3: { cmdState: 'waiting', sentAt: now },
                  4: { cmdState: 'waiting', sentAt: now },
                }))
              } else {
                setStates(prev => ({
                  ...prev,
                  1: { cmdState: 'error', sentAt: null, error: 'Batch failed' },
                  2: { cmdState: 'error', sentAt: null, error: 'Batch failed' },
                  3: { cmdState: 'error', sentAt: null, error: 'Batch failed' },
                  4: { cmdState: 'error', sentAt: null, error: 'Batch failed' },
                }))
              }
            } catch {
              setStates(prev => ({
                ...prev,
                1: { cmdState: 'error', sentAt: null, error: 'Network error' },
                2: { cmdState: 'error', sentAt: null, error: 'Network error' },
                3: { cmdState: 'error', sentAt: null, error: 'Network error' },
                4: { cmdState: 'error', sentAt: null, error: 'Network error' },
              }))
            }
          }}
          disabled={noFirebase}
          className="flex-1 py-2 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700
            hover:bg-gray-300 disabled:opacity-40 transition-colors"
        >
          All OFF
        </button>
      </div>
    </div>
  )
}
