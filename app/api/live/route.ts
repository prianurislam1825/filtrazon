// GET /api/live
// Server-Sent Events endpoint — streams reading, alert, heartbeat events to browser

import { type NextRequest } from 'next/server'
import { registerClient, removeClient, startHeartbeat } from '@/lib/sse/broadcaster'

// Ensure heartbeat is running
startHeartbeat()

export async function GET(_request: NextRequest): Promise<Response> {
  const clientId = `sse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      registerClient(clientId, controller)

      // Send an immediate comment to confirm connection (keeps proxies alive)
      const encoder = new TextEncoder()
      try {
        controller.enqueue(encoder.encode(': connected\n\n'))
      } catch {}
    },

    cancel() {
      removeClient(clientId)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':                'text/event-stream',
      'Cache-Control':               'no-cache, no-transform',
      'Connection':                  'keep-alive',
      'X-Accel-Buffering':           'no',       // disable nginx buffering
      'Access-Control-Allow-Origin': 'same-origin',
    },
  })
}

// SSE is GET-only; reject other methods cleanly
export async function POST(): Promise<Response> {
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
