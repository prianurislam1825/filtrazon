'use client'

import Sidebar from './Sidebar'
import MobileBottomNav from './MobileBottomNav'
import TopNavbar from './TopNavbar'
import type { ConnectionStatus, AppMode } from '@/types'

interface AppShellProps {
  children:          React.ReactNode
  connectionStatus?: ConnectionStatus
  appMode?:          AppMode
  unreadAlerts?:     number
  userName?:         string
}

export default function AppShell({
  children,
  connectionStatus = 'connecting',
  appMode          = 'local',
  unreadAlerts     = 0,
  userName         = 'Admin',
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f7ff]">
      {/* Desktop sidebar */}
      <Sidebar appMode={appMode} />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          connectionStatus={connectionStatus}
          appMode={appMode}
          unreadAlerts={unreadAlerts}
          userName={userName}
        />

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden pb-safe-nav lg:pb-6"
          id="main-content"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  )
}
