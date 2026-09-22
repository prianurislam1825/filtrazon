'use client'

import type { StatusLevel } from '@/types'

interface StatusBadgeProps {
  status:    StatusLevel
  label?:    string
  size?:     'sm' | 'md' | 'lg'
  className?: string
  lang?:     'id' | 'en'
}

const LABEL_MAP: Record<StatusLevel, Record<'id' | 'en', string>> = {
  safe:    { id: 'Aman',    en: 'Safe' },
  warning: { id: 'Waspada', en: 'Warning' },
  danger:  { id: 'Bahaya',  en: 'Danger' },
  offline: { id: 'Offline', en: 'Offline' },
  unknown: { id: 'Unknown', en: 'Unknown' },
}

const SIZE_MAP = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-3 py-1',
}

export default function StatusBadge({
  status,
  label,
  size = 'md',
  className = '',
  lang = 'id',
}: StatusBadgeProps) {
  const displayLabel = label ?? LABEL_MAP[status]?.[lang] ?? status

  return (
    <span
      role="status"
      aria-label={`Status: ${displayLabel}`}
      className={`
        inline-flex items-center gap-1 font-semibold rounded-full
        ${SIZE_MAP[size]} status-${status} ${className}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" aria-hidden="true" />
      {displayLabel}
    </span>
  )
}
