// ─────────────────────────────────────────────────────────────
//  FILTRAZON — NextAuth v5 catch-all route handler
//  Handles: POST /api/auth/signin, GET /api/auth/session, etc.
// ─────────────────────────────────────────────────────────────

import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
