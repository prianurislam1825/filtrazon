'use client'

import type { ConnectionStatus } from '@/types'

interface ConnectionBadgeProps {
  status: ConnectionStatus
  showLabel?: boolean
  className?: string
}

const CONFIG = {
  live:       { dot: 'bg-green-500 animate-pulse', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'LIVE'       },
  stale:      { dot: 'bg-amber-400',               text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'STALE'      },
  offline:    { dot: 'bg-gray-400',                text: 'text-gray-500',  bg: 'bg-gray-50',  border: 'border-gray-200',  label: 'OFFLINE'    },
  connecting: { dot: 'bg-sky-400 animate-pulse',   text: 'text-sky-700',  bg: 'bg-sky-50',   border: 'border-sky-200',   label: 'CONNECTING' },
}

export default function ConnectionBadge({
  status,
  showLabel = true,
  className = '',
}: ConnectionBadgeProps) {
  const c = CONFIG[status]

  return (
    <span
      role="status"
      aria-label={`Connection status: ${c.label}`}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        border ${c.bg} ${c.border} ${c.text} ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} aria-hidden="true" />
      {showLabel && c.label}
    </span>
  )
}
