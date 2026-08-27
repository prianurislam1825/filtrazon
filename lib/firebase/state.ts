// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Firebase sync state (server-side singleton)
//  Shared between /api/firebase-sync and /api/sync-status
// ─────────────────────────────────────────────────────────────

import type { FirebaseReading, SyncStatus } from '@/types'

declare global {
  // eslint-disable-next-line no-var
  var __firebaseState: {
    lastReading:        FirebaseReading | null
    lastFetchedAt:      string | null
    lastSyncedToDb:     string | null
    lastSyncedSeq:      number | null
    firebaseConnected:  boolean
    localDbConnected:   boolean
    fetchError:         string | null
  } | undefined
}

export function getFirebaseState() {
  if (!global.__firebaseState) {
    global.__firebaseState = {
      lastReading:       null,
      lastFetchedAt:     null,
      lastSyncedToDb:    null,
      lastSyncedSeq:     null,
      firebaseConnected: false,
      localDbConnected:  false,
      fetchError:        null,
    }
  }
  return global.__firebaseState
}

export function setFirebaseReading(
  reading: FirebaseReading,
  syncedToDb: boolean,
): void {
  const s = getFirebaseState()
  s.lastReading       = reading
  s.lastFetchedAt     = reading.fetched_at
  s.firebaseConnected = true
  s.fetchError        = null
  if (syncedToDb) {
    s.lastSyncedToDb  = reading.fetched_at
    s.lastSyncedSeq   = reading.seq
    s.localDbConnected = true
  }
}

export function setFirebaseError(error: string): void {
  const s = getFirebaseState()
  s.firebaseConnected = false
  s.fetchError        = error
}

export function setLocalDbStatus(connected: boolean): void {
  getFirebaseState().localDbConnected = connected
}
