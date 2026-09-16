// ─────────────────────────────────────────────────────────────
//  POST /api/control
//  Writes a relay command to Firebase /filtrazon/cmd.
//  Requires valid session.
//
//  Body single:  { command: "R1ON" }
//  Body batch:   { commands: ["R1ON","R2ON","R3ON","R4ON"], delayMs: 800 }
//
//  Flow: auth → whitelist → Firebase PUT /cmd (with delay between each)
//  Device picks up cmd, executes, updates /latest.
//  UI reads status from Firebase /latest (non-optimistic).
// ─────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFirebaseCmd, patchFirebaseLatest } from '@/lib/firebase/client'
import { broadcastReading } from '@/lib/sse/broadcaster'
import type { RelayCommand, RelayCommandResult } from '@/types'

const VALID_COMMANDS: RelayCommand[] = [
  'R1ON', 'R1OFF', 'R2ON', 'R2OFF',
  'R3ON', 'R3OFF', 'R4ON', 'R4OFF',
  'ALLON', 'ALLOFF', 'FLOWRESET',
  'DEMOON', 'DEMOOFF',
]

function isValidCommand(cmd: string): boolean {
  if (VALID_COMMANDS.includes(cmd as RelayCommand)) return true
  const parts = cmd.split(':')
  if (parts.length === 2) return VALID_COMMANDS.includes(parts[1] as RelayCommand)
  return false
}

function getRelayPatch(cmd: string): Record<string, unknown> | null {
  const normalized = cmd.includes(':') ? cmd.split(':')[1] : cmd
  switch (normalized) {
    case 'R1ON':
      return { relay1: true, pump_status: 'ON' }
    case 'R1OFF':
      return { relay1: false, pump_status: 'OFF' }
    case 'R2ON':
      return { relay2: true, uv_status: 'ON' }
    case 'R2OFF':
      return { relay2: false, uv_status: 'OFF' }
    case 'R3ON':
      return { relay3: true }
    case 'R3OFF':
      return { relay3: false }
    case 'R4ON':
      return { relay4: true }
    case 'R4OFF':
      return { relay4: false }
    case 'ALLON':
      return {
        relay1: true, relay2: true, relay3: true, relay4: true,
        pump_status: 'ON', uv_status: 'ON',
      }
    case 'ALLOFF':
      return {
        relay1: false, relay2: false, relay3: false, relay4: false,
        pump_status: 'OFF', uv_status: 'OFF',
      }
    case 'DEMOON':
      return { flags: 8 }
    case 'DEMOOFF':
      return { flags: 0 }
    case 'FLOWRESET':
      return { total_liters: 0 }
    default:
      return null
  }
}

async function applyRelayPatch(cmd: string): Promise<Record<string, unknown> | null> {
  const patch = getRelayPatch(cmd)
  if (!patch) return null

  try {
    await patchFirebaseLatest(patch)
  } catch {}

  if (global.__latestReading) {
    Object.assign(global.__latestReading, {
      ...patch,
      pump_status: patch.pump_status !== undefined ? patch.pump_status === 'ON' : global.__latestReading.pump_status,
      uv_status: patch.uv_status !== undefined ? patch.uv_status === 'ON' : global.__latestReading.uv_status,
    })
    broadcastReading(global.__latestReading)
  }

  return patch
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function POST(request: NextRequest): Promise<Response> {
  // ── 1. Auth check ─────────────────────────────────────────
  const authEnabled = process.env.AUTH_ENABLED !== 'false'
  const appMode = process.env.APP_MODE ?? 'local'
  if (authEnabled && appMode !== 'local') {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  // ── 2. Parse body ─────────────────────────────────────────
  let body: { command?: string; commands?: string[]; delayMs?: number } = {}
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const sentAt = new Date().toISOString()

  // ── 3. Batch mode ─────────────────────────────────────────
  if (Array.isArray(body.commands) && body.commands.length > 0) {
    const delayMs = Math.min(body.delayMs ?? 800, 2000)
    const results: { command: string; ok: boolean; error?: string }[] = []

    for (const rawCmd of body.commands) {
      const cmd = String(rawCmd).trim().toUpperCase()
      if (!isValidCommand(cmd)) {
        results.push({ command: cmd, ok: false, error: 'Invalid command' })
        continue
      }
      // Alternate target prefix to bypass Gateway's lastCmd cache
      const prefix = Math.random() > 0.5 ? '*:' : 'FILTRAZON-01:'
      const finalCommand = cmd.includes(':') ? cmd : `${prefix}${cmd}`
      
      const result = await writeFirebaseCmd(finalCommand)
      if (result.ok) {
        await applyRelayPatch(cmd)
      }
      results.push({ command: cmd, ok: result.ok, error: result.error })
      if (results.length < body.commands.length) {
        await sleep(delayMs)
      }
    }

    const allOk = results.every(r => r.ok)
    return Response.json({ ok: allOk, commands: results, sentAt })
  }

  // ── 4. Single command mode ────────────────────────────────
  const command = String(body.command ?? '').trim().toUpperCase()
  if (!command) {
    return Response.json({ ok: false, error: 'Missing command' }, { status: 400 })
  }
  if (!isValidCommand(command)) {
    return Response.json(
      { ok: false, error: `Invalid command: "${command}". Allowed: ${VALID_COMMANDS.join(', ')}` },
      { status: 400 },
    )
  }

  // Alternate target prefix to bypass Gateway's lastCmd cache (cmd != lastCmd)
  // The Node accepts both "*" (broadcast) and "FILTRAZON-01" as valid targets.
  const prefix = Math.random() > 0.5 ? '*:' : 'FILTRAZON-01:'
  const finalCommand = command.includes(':') ? command : `${prefix}${command}`

  const result = await writeFirebaseCmd(finalCommand)
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error ?? 'Firebase write failed' }, { status: 502 })
  }

  const patch = await applyRelayPatch(command)

  const response: RelayCommandResult & { patch?: Record<string, unknown> | null } = {
    ok: true,
    command,
    sentAt,
    patch,
  }
  return Response.json(response)
}
