// ─────────────────────────────────────────────────────────────
//  FILTRAZON — NextAuth v5 instance
//  Export: { handlers, auth, signIn, signOut }
// ─────────────────────────────────────────────────────────────

import NextAuth from 'next-auth'
import { authConfig } from './config'

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
