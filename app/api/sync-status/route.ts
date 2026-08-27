// GET /api/sync-status
// Returns Firebase connection status, local DB status, last sync info,
// and whether Firebase and local data are in sync.

import { type NextRequest } from 'next/server'
import { getFirebaseState } from '@/lib/firebase/state'
import { isLocalMode } from '@/lib/config'
import type { SyncStatus, SyncState } from '@/types'

export async function GET(_request: NextRequest): Promise<Response> {
  const fb = getFirebaseState()

  // ── Derive sync state ─────────────────────────────────────
  let state: SyncState = 'unknown'
  let localSeq: number | null = null

  if (!fb.firebaseConnected) {
    state = 'error'
  } else if (fb.lastReading === null) {
    state = 'no-local'
  } else {
    // Try to get local latest seq from DB
    if (!isLocalMode()) {
      try {
        const { getLatestReading } = await import('@/lib/db/readings')
        const local = await getLatestReading()
        if (local) {
          localSeq = local.seq
          if (local.seq === fb.lastReading.seq) {
            state = 'synced'
          } else if (Math.abs(local.seq - fb.lastReading.seq) <= 3) {
            state = 'syncing'
          } else {
            state = 'diff'
          }
        } else {
          state = 'no-local'
        }
      } catch {
        state = 'error'
      }
    } else {
      // Local mode: use in-memory cache seq as "local"
      localSeq = global.__latestReading?.seq ?? null
      if (localSeq !== null && localSeq === fb.lastReading.seq) {
        state = 'synced'
      } else if (localSeq !== null) {
        state = 'syncing'
      } else {
        state = 'no-local'
      }
    }
  }

  const status: SyncStatus = {
    state,
    lastFirebaseUpdate: fb.lastFetchedAt,
    lastLocalSync:      fb.lastSyncedToDb,
    firebaseConnected:  fb.firebaseConnected,
    localDbConnected:   fb.localDbConnected,
    firebaseSeq:        fb.lastReading?.seq ?? null,
    localSeq,
    error:              fb.fetchError ?? undefined,
  }

  return Response.json({ ok: true, data: status })
}
