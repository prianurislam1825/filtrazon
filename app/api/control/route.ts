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
import { writeFirebaseCmd } from '@/lib/firebase/client'
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

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function POST(request: NextRequest): Promise<Response> {
  // ── 1. Auth check ─────────────────────────────────────────
  const session = await auth()
  if (!session?.user) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
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
      const result = await writeFirebaseCmd(cmd)
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

  const result = await writeFirebaseCmd(command)
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error ?? 'Firebase write failed' }, { status: 502 })
  }

  const response: RelayCommandResult = { ok: true, command, sentAt }
  return Response.json(response)
}
