'use client'

import Link from 'next/link'
import { Map, Settings, LogOut, ChevronRight } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'

const MORE_ITEMS = [
  { label: 'Peta Lokasi',  href: '/peta',       icon: <Map      size={18} />, description: 'GPS location monitoring' },
  { label: 'Pengaturan',   href: '/pengaturan', icon: <Settings size={18} />, description: 'System configuration'    },
]

export default function MorePage() {
  return (
    <AppShell>
      <div className="px-4 md:px-6 pt-5 pb-4 space-y-4">
        <div>
          <h1 className="text-lg font-bold text-[#15324A]">More</h1>
          <p className="text-xs text-gray-400 mt-0.5">Additional features</p>
        </div>

        <div className="card divide-y divide-gray-50">
          {MORE_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#EAF8FC] text-[#1268A5] shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" />
            </Link>
          ))}

          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-500 shrink-0">
              <LogOut size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Logout</p>
              <p className="text-xs text-gray-400">Sign out of dashboard</p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
