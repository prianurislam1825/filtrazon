import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'FILTRAZON — Monitoring Dashboard',
  description: 'Real-time IoT water purification monitoring for disaster response',
}

// Route group layout — wraps all dashboard pages
// requireAuth() redirects to /login if no valid session
export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <>{children}</>
}
