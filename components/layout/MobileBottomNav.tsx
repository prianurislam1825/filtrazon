'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, History, Cpu, Bell, Menu } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { lang } = useLang()

  const BOTTOM_NAV = [
    { href: '/dashboard',  icon: LayoutDashboard, label: { id: 'Home',      en: 'Home'    } },
    { href: '/riwayat',    icon: History,          label: { id: 'Riwayat',  en: 'History' } },
    { href: '/perangkat',  icon: Cpu,              label: { id: 'Perangkat',en: 'Devices' } },
    { href: '/alert',      icon: Bell,             label: { id: 'Alert',    en: 'Alerts'  } },
    { href: '/more',       icon: Menu,             label: { id: 'Lainnya',  en: 'More'    } },
  ]

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={lang === 'id' ? 'Navigasi utama' : 'Main navigation'}
    >
      <div className="flex items-center justify-around h-16">
        {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : pathname.startsWith(href)
          const lbl = label[lang]

          return (
            <Link key={href} href={href}
              aria-label={lbl}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 py-1 rounded-xl transition-colors">
              <span className={`flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200 ${isActive ? 'bg-[#E3F2FD]' : ''}`}>
                <Icon size={22} style={{ color: isActive ? '#1565C0' : '#9CA3AF' }} strokeWidth={isActive ? 2.5 : 1.8} />
              </span>
              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-[#1565C0]' : 'text-gray-400'}`}>
                {lbl}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
