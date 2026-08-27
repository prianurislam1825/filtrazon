// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Server-Sent Events broadcaster (Node.js singleton)
//  Clients connect to GET /api/live and receive events pushed here
// ─────────────────────────────────────────────────────────────

import type { Reading, Alert, SSEEvent } from '@/types'

type SSEController = ReadableStreamDefaultController<Uint8Array>

interface SSEClient {
  id:         string
  controller: SSEController
  addedAt:    number
}

// Global registry — survives hot-reloads in dev via global
declare global {
  // eslint-disable-next-line no-var
  var __sseClients: Map<string, SSEClient> | undefined
}

function getClients(): Map<string, SSEClient> {
  if (!global.__sseClients) {
    global.__sseClients = new Map()
  }
  return global.__sseClients
}

const encoder = new TextEncoder()

// Format an SSE message per spec
function formatSSE(eventType: string, data: unknown): Uint8Array {
  const json    = JSON.stringify(data)
  const message = `event: ${eventType}\ndata: ${json}\n\n`
  return encoder.encode(message)
}

// ── Register a new client stream ─────────────────────────
export function registerClient(id: string, controller: SSEController): void {
  const clients = getClients()
  clients.set(id, { id, controller, addedAt: Date.now() })
  console.log(`[SSE] Client connected: ${id}. Total: ${clients.size}`)
}

// ── Remove a client ───────────────────────────────────────
export function removeClient(id: string): void {
  const clients = getClients()
  clients.delete(id)
  console.log(`[SSE] Client disconnected: ${id}. Total: ${clients.size}`)
}

// ── Broadcast a reading event ─────────────────────────────
export function broadcastReading(reading: Reading): void {
  broadcast('reading', reading)
}

// ── Broadcast an alert event ──────────────────────────────
export function broadcastAlert(alert: Alert): void {
  broadcast('alert', alert)
}

// ── Broadcast heartbeat ───────────────────────────────────
export function broadcastHeartbeat(): void {
  broadcast('heartbeat', { ts: new Date().toISOString() })
}

// ── Generic broadcast to all clients ─────────────────────
function broadcast(eventType: string, data: unknown): void {
  const clients = getClients()
  const payload = formatSSE(eventType, data)
  const dead: string[] = []

  for (const [id, client] of clients) {
    try {
      client.controller.enqueue(payload)
    } catch {
      // Client stream closed — mark for removal
      dead.push(id)
    }
  }

  for (const id of dead) {
    clients.delete(id)
    console.log(`[SSE] Removed dead client: ${id}`)
  }
}

// ── Start heartbeat timer (call once at startup / module load)
let heartbeatTimer: ReturnType<typeof setInterval> | null = null

export function startHeartbeat(intervalMs = 20_000): void {
  if (heartbeatTimer) return
  heartbeatTimer = setInterval(broadcastHeartbeat, intervalMs)
}

export function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

export function getClientCount(): number {
  return getClients().size
}
