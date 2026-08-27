'use client'

import Image from 'next/image'
import { Bell, User } from 'lucide-react'
import ConnectionBadge from '@/components/ui/ConnectionBadge'
import { useLang } from '@/lib/i18n/context'
import type { ConnectionStatus, AppMode } from '@/types'

interface TopNavbarProps {
  connectionStatus?: ConnectionStatus
  appMode?:          AppMode
  unreadAlerts?:     number
  userName?:         string
}

export default function TopNavbar({
  connectionStatus = 'connecting',
  appMode          = 'local',
  unreadAlerts     = 0,
  userName         = 'Admin',
}: TopNavbarProps) {
  const { lang, toggle } = useLang()

  return (
    <header className="sticky top-0 z-30 bg-white/96 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">

        {/* Mobile brand */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center p-1 shrink-0">
            <Image src="/FILTRAZON.png" alt="FILTRAZON" width={24} height={24} className="object-contain w-full h-full" />
          </div>
          <div>
            <span className="font-black text-sm tracking-wide leading-none text-[#1C2B3A] block">FILTRAZON</span>
            <span className="text-[9px] text-gray-400 uppercase tracking-widest leading-none">IoT Water</span>
          </div>
        </div>

        {/* Desktop context */}
        <div className="hidden lg:flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
            appMode === 'cloud'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${appMode === 'cloud' ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`} />
            {appMode} mode
          </span>
          <p className="text-xs text-gray-400 font-medium">
            {lang === 'id' ? 'Monitoring Filtrasi Air Portabel' : 'Portable Water Purification Monitoring'}
          </p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* ── Language toggle ── */}
          <button
            onClick={toggle}
            aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          >
            <span className="text-base leading-none">{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase">{lang === 'id' ? 'ID' : 'EN'}</span>
          </button>

          <ConnectionBadge status={connectionStatus} />

          {/* Bell */}
          <button aria-label={`${unreadAlerts} unread alerts`}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
            <Bell size={17} className="text-gray-500" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </span>
            )}
          </button>

          {/* Avatar */}
          <button aria-label="User menu"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] border border-blue-200">
              <User size={13} className="text-[#1565C0]" />
            </div>
            <span className="hidden sm:block text-xs font-semibold text-gray-600 max-w-[80px] truncate">{userName}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
