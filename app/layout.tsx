import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { LangProvider } from '@/lib/i18n/context'
import { UnitProvider } from '@/lib/unit/context'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title:       'FILTRAZON — Smart Water Filtration System',
  description: 'Real-time IoT monitoring for portable water purification systems',
  icons: {
    icon:    [{ url: '/icons/favicon-desktop.svg', type: 'image/svg+xml' }],
    apple:   [{ url: '/icons/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }],
    shortcut: '/icons/favicon-desktop.svg',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 5, themeColor: '#0B3B66',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full antialiased">
        <SessionProvider>
          <LangProvider>
            <UnitProvider>
              {children}
            </UnitProvider>
          </LangProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
