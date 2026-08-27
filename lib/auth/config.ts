// ─────────────────────────────────────────────────────────────
//  FILTRAZON — NextAuth v5 (beta) configuration
//  Uses Credentials provider + bcrypt + MySQL user lookup
// ─────────────────────────────────────────────────────────────

import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// We import bcryptjs lazily inside the authorize function so
// this module can be imported in the Edge runtime if needed.

export const authConfig: NextAuthConfig = {
  // Trust the NEXTAUTH_URL env variable for callbacks
  trustHost: true,

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   12 * 60 * 60, // 12 hours
  },

  callbacks: {
    // Attach role + id to the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as { role?: string }).role ?? 'VIEWER'
        token.name = user.name
        token.email = user.email
      }
      return token
    },

    // Expose role in the session object
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id    = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },

    // Route guard: redirect unauthenticated users to /login
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn    = !!auth?.user
      const isPublicRoute =
        nextUrl.pathname === '/login' ||
        nextUrl.pathname.startsWith('/api/ingest') ||
        nextUrl.pathname.startsWith('/api/auth')

      if (isPublicRoute) return true
      if (isLoggedIn)    return true

      // Redirect to /login preserving callbackUrl
      return false
    },
  },

  providers: [
    Credentials({
      name: 'FILTRAZON',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email    = String(credentials.email).toLowerCase().trim()
        const password = String(credentials.password)

        // Dynamic imports keep this edge-compatible if needed
        const bcrypt = await import('bcryptjs')

        // ── Local/offline mode: check env bypass ──────────────
        const appMode     = process.env.APP_MODE    ?? 'local'
        const authEnabled = process.env.AUTH_ENABLED !== 'false'

        if (appMode === 'local' && !authEnabled) {
          // Allow any login in local dev mode
          return {
            id:    'local-user',
            name:  'Local Admin',
            email,
            role:  'ADMIN',
          }
        }

        // ── Cloud mode: look up user in MySQL ─────────────────
        try {
          const { query } = await import('@/lib/db/client')
          const rows = await query<{
            id: string; name: string; email: string
            password: string; role: string; active: number
          }>(
            'SELECT id, name, email, password, role, active FROM users WHERE email = ? LIMIT 1',
            [email],
          )

          const user = rows[0]
          if (!user || !user.active) return null

          const valid = await bcrypt.compare(password, user.password)
          if (!valid) return null

          // Update last_login (fire-and-forget)
          const { execute } = await import('@/lib/db/client')
          execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]).catch(() => {})

          return {
            id:    user.id,
            name:  user.name,
            email: user.email,
            role:  user.role,
          }
        } catch (err) {
          console.error('[auth] DB lookup failed:', err)
          return null
        }
      },
    }),
  ],
}
