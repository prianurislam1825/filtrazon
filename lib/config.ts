// ─────────────────────────────────────────────────────────────
//  FILTRAZON — App runtime config (reads env, never throws)
// ─────────────────────────────────────────────────────────────

import type { AppMode, AppConfig } from '@/types'

export function getAppConfig(): AppConfig {
  const mode        = (process.env.APP_MODE ?? 'local') as AppMode
  const authEnabled = process.env.AUTH_ENABLED !== 'false'
  return { mode, authEnabled }
}

export function isCloudMode(): boolean {
  return process.env.APP_MODE === 'cloud'
}

export function isLocalMode(): boolean {
  return (process.env.APP_MODE ?? 'local') === 'local'
}

export function isAuthEnabled(): boolean {
  return process.env.AUTH_ENABLED !== 'false'
}

export function getDeviceToken(): string {
  return process.env.DEVICE_TOKEN ?? 'dev-filtrazon-token-2024'
}

// Validates X-Device-Token header against configured token
export function validateDeviceToken(token: string | null): boolean {
  if (!token) return false
  const expected = getDeviceToken()
  // Constant-time comparison to avoid timing attacks
  if (token.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return mismatch === 0
}
