// ─────────────────────────────────────────────────────────────
//  FILTRAZON — In-memory rate limiter (login brute-force protection)
//  5 failures → block for 10 minutes (configurable via env)
// ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count:      number
  firstAt:    number
  blockedUntil: number | null
}

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: Map<string, RateLimitEntry> | undefined
}

function getStore(): Map<string, RateLimitEntry> {
  if (!global.__rateLimitStore) {
    global.__rateLimitStore = new Map()
  }
  return global.__rateLimitStore
}

const MAX_ATTEMPTS  = parseInt(process.env.LOGIN_RATE_LIMIT_MAX    ?? '5',       10)
const WINDOW_MS     = parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? '600000', 10) // 10 min
const BLOCK_MS      = WINDOW_MS

// ── Check & record a login attempt ───────────────────────
export interface RateLimitResult {
  allowed:      boolean
  remaining:    number
  retryAfterMs: number   // 0 if not blocked
}

export function checkLoginRateLimit(key: string): RateLimitResult {
  const store = getStore()
  const now   = Date.now()
  const entry = store.get(key)

  // No prior entries
  if (!entry) {
    store.set(key, { count: 1, firstAt: now, blockedUntil: null })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterMs: 0 }
  }

  // Currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed:      false,
      remaining:    0,
      retryAfterMs: entry.blockedUntil - now,
    }
  }

  // Window expired — reset
  if (now - entry.firstAt > WINDOW_MS) {
    store.set(key, { count: 1, firstAt: now, blockedUntil: null })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterMs: 0 }
  }

  // Within window — increment
  entry.count++

  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_MS
    store.set(key, entry)
    return {
      allowed:      false,
      remaining:    0,
      retryAfterMs: BLOCK_MS,
    }
  }

  store.set(key, entry)
  return {
    allowed:      true,
    remaining:    MAX_ATTEMPTS - entry.count,
    retryAfterMs: 0,
  }
}

// ── Clear limit after successful login ────────────────────
export function clearRateLimit(key: string): void {
  getStore().delete(key)
}

// ── Format block duration for UI message ─────────────────
export function formatBlockDuration(ms: number): string {
  const minutes = Math.ceil(ms / 60_000)
  return minutes === 1 ? '1 minute' : `${minutes} minutes`
}
