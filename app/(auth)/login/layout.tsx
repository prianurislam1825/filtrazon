import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in — FILTRAZON',
  description: 'Sign in to the FILTRAZON water purification monitoring dashboard',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
