// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Firebase Realtime Database REST client
//  No SDK needed — data is publicly readable via HTTP
//  Server-side only (never exposed to browser)
// ─────────────────────────────────────────────────────────────

export const FIREBASE_BASE_URL =
  process.env.FIREBASE_RTDB_URL ??
  'https://filtrazon-e4ab3-default-rtdb.asia-southeast1.firebasedatabase.app'

export const FIREBASE_DEVICE_PATH =
  process.env.FIREBASE_DEVICE_PATH ??
  '/filtrazon/devices/FILTRAZON-01/latest'

// Raw shape as stored in Firebase (pump_status / uv_status are strings)
export interface FirebaseRawReading {
  device_id:   string
  gateway:     string
  seq:         number
  uptime_ms:   number
  ph:          number
  tds:         number
  turbidity:   number
  flow_lpm:    number
  total_liters: number
  pump_status: string | boolean  // "ON"/"OFF" or true/false
  uv_status:   string | boolean
  relay1:      boolean
  relay2:      boolean
  relay3:      boolean
  relay4:      boolean
  flags:       number            // bitmask: bit3 = demo mode
  battery:     number
  rssi:        number
  snr:         number
  rx_ms:       number
}

export interface FirebaseFetchResult {
  ok:        boolean
  data:      FirebaseRawReading | null
  fetchedAt: string   // ISO timestamp of when we fetched
  error?:    string
}

/**
 * Fetch the latest reading from Firebase RTDB via REST.
 * Throws only on network/parse errors — caller should handle.
 */
export async function fetchFirebaseLatest(): Promise<FirebaseFetchResult> {
  const url = `${FIREBASE_BASE_URL}${FIREBASE_DEVICE_PATH}.json`
  const fetchedAt = new Date().toISOString()

  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },   // always fresh, no Next.js cache
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return { ok: false, data: null, fetchedAt, error: `HTTP ${res.status}` }
    }

    const raw = await res.json() as FirebaseRawReading | null

    if (!raw || typeof raw !== 'object') {
      return { ok: false, data: null, fetchedAt, error: 'Empty or null data' }
    }

    return { ok: true, data: raw, fetchedAt }
  } catch (err) {
    return {
      ok:        false,
      data:      null,
      fetchedAt,
      error:     err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/** Normalize "ON"/"OFF" or true/false → boolean */
export function normalizeBool(v: string | boolean | undefined): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string')  return v.toUpperCase() === 'ON'
  return false
}

export const FIREBASE_CMD_PATH =
  process.env.FIREBASE_CMD_PATH ?? '/filtrazon/cmd'

/** Write a relay command to Firebase /filtrazon/cmd via REST (PUT).
 *  Requires FIREBASE_AUTH_TOKEN env for authenticated writes.
 *  In dev with open rules, token is optional.
 */
export async function writeFirebaseCmd(command: string): Promise<{ ok: boolean; error?: string }> {
  const url   = `${FIREBASE_BASE_URL}${FIREBASE_CMD_PATH}.json`
  const token = process.env.FIREBASE_AUTH_TOKEN

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const fetchUrl = token ? `${url}?auth=${token}` : url

  try {
    const res = await fetch(fetchUrl, {
      method:  'PUT',
      headers,
      body:    JSON.stringify(command),
      signal:  AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, error: `Firebase PUT ${res.status}: ${body}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
