'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, History, Cpu, Bell,
  Map, Settings, LogOut, ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react'
import { useState } from 'react'
import { useLang } from '@/lib/i18n/context'
import type { AppMode } from '@/types'

export default function Sidebar({ appMode = 'local' }: { appMode?: AppMode }) {
  const pathname            = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { lang }            = useLang()

  const NAV = [
    { href: '/dashboard',  icon: LayoutDashboard,   id: { id: 'Dashboard',  en: 'Dashboard' } },
    { href: '/riwayat',    icon: History,            id: { id: 'Riwayat',   en: 'History'   } },
    { href: '/perangkat',  icon: Cpu,                id: { id: 'Perangkat', en: 'Devices'   } },
    { href: '/kontrol',    icon: SlidersHorizontal,  id: { id: 'Kontrol',   en: 'Control'   } },
    { href: '/alert',      icon: Bell,               id: { id: 'Alert',     en: 'Alerts'    } },
    { href: '/peta',       icon: Map,                id: { id: 'Peta',      en: 'Map'       } },
    { href: '/pengaturan', icon: Settings,           id: { id: 'Pengaturan',en: 'Settings'  } },
  ]

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 shrink-0 z-40 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-60'}`}
      style={{ background: 'linear-gradient(180deg, #0D1F2D 0%, #1A2B3C 100%)' }}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-white/8 min-h-[64px] ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-4`}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-white/10 p-1 shrink-0">
          <Image src="/FILTRAZON.png" alt="FILTRAZON" width={28} height={28} className="object-contain w-full h-full" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-black text-sm tracking-wide text-white leading-tight block">FILTRAZON</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest">IoT Water System</span>
          </div>
        )}
      </div>

      {/* Mode badge */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
            appMode === 'cloud'
              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
              : 'bg-green-500/15 text-green-300 border border-green-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${appMode === 'cloud' ? 'bg-blue-400' : 'bg-green-400'} animate-pulse`} />
            {appMode}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden" aria-label="Dashboard navigation">
        {NAV.map(({ href, icon: Icon, id: labels }) => {
          const label    = labels[lang]
          const isActive = href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : pathname.startsWith(href)

          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}
              className={`group flex items-center gap-3 mx-2 mb-0.5 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isActive ? 'bg-white/12 text-white' : 'text-white/55 hover:bg-white/8 hover:text-white'
              }`}>
              <Icon size={19} className={`shrink-0 transition-colors ${isActive ? 'text-[#F0C93A]' : 'text-white/40 group-hover:text-white/70'}`} />
              {!collapsed && <span className="truncate">{label}</span>}
              {isActive && !collapsed && <span className="ml-auto w-1 h-4 rounded-full bg-[#F0C93A] shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/8 p-2 space-y-1">
        <Link href="/api/auth/signout" title={collapsed ? (lang === 'id' ? 'Keluar' : 'Logout') : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/45 hover:bg-red-500/10 hover:text-red-300 transition-colors">
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>{lang === 'id' ? 'Keluar' : 'Logout'}</span>}
        </Link>
        <button onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:bg-white/8 hover:text-white/50 transition-colors">
          {collapsed
            ? <ChevronRight size={15} />
            : <><ChevronLeft size={15} /><span>{lang === 'id' ? 'Ciutkan' : 'Collapse'}</span></>}
        </button>
      </div>
    </aside>
  )
}
