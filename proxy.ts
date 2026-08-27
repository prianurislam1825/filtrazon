// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Proxy (Next.js 16 route protection)
//
//  PUBLIC routes (no auth required):
//    /                  landing page
//    /login             auth page
//    /api/auth/*        next-auth handlers
//    /api/ingest        device ingestion (token-based)
//
//  PROTECTED routes (redirect to /login if not authed):
//    /dashboard, /riwayat, /perangkat, /alert,
//    /kontrol, /peta, /pengaturan, /more
//    /api/* (except public ones above)
// ─────────────────────────────────────────────────────────────

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/api/auth',
  '/api/ingest',
  '/manifest.json',
  '/icons',
]

function isPublicPath(pathname: string): boolean {
  // Exact match for root
  if (pathname === '/') return true
  // Prefix match for others
  return PUBLIC_PATHS.slice(1).some(
    p => pathname === p || pathname.startsWith(p + '/'),
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Local/dev mode bypass
  const authEnabled = process.env.AUTH_ENABLED !== 'false'
  const appMode     = process.env.APP_MODE ?? 'local'

  if (!authEnabled || appMode === 'local') {
    return NextResponse.next()
  }

  // Validate session
  const session = await auth()

  if (!session?.user) {
    // API routes → return 401 JSON (tidak redirect browser)
    if (pathname.startsWith('/api/')) {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    // Page routes → redirect ke /login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
}
