// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Session helpers for Server Components / Route Handlers
// ─────────────────────────────────────────────────────────────

import { auth } from './index'
import type { UserRole } from '@/types'

export interface SessionUser {
  id:    string
  name:  string | null | undefined
  email: string | null | undefined
  role:  UserRole
}

// Get current session user — returns null if not authenticated
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user) return null

  return {
    id:    (session.user as { id?: string }).id    ?? '',
    name:  session.user.name,
    email: session.user.email,
    role:  ((session.user as { role?: string }).role ?? 'VIEWER') as UserRole,
  }
}

// Require auth — throws redirect if not logged in (use in Server Components)
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    const { redirect } = await import('next/navigation')
    redirect('/login')
    // redirect() throws internally — this line is unreachable but satisfies TS
  }
  return user as SessionUser
}

// Require admin role
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    const { redirect } = await import('next/navigation')
    redirect('/dashboard')
  }
  return user
}

// Check if auth is enabled at all
export function isAuthEnabled(): boolean {
  const appMode     = process.env.APP_MODE    ?? 'local'
  const authEnabled = process.env.AUTH_ENABLED !== 'false'
  return appMode === 'cloud' || authEnabled
}
