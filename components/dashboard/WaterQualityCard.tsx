'use client'

import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff } from 'lucide-react'
import type { StatusLevel } from '@/types'

interface QualityItem { label: string; status: StatusLevel }

interface WaterQualityCardProps {
  status:   StatusLevel
  label:    string
  message?: string
  items?:   QualityItem[]
  lang?:    'id' | 'en'
}

const CONFIG: Record<StatusLevel, {
  Icon:       React.ComponentType<{ size?: number; className?: string }>
  iconClass:  string
  bg:         string; border: string; bar: string
  titleColor: string; badgeCls: string
  headline:   { id: string; en: string }
}> = {
  safe: {
    Icon: ShieldCheck, iconClass: 'text-green-600',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50', border: 'border-green-200', bar: '#22C55E',
    titleColor: 'text-green-700', badgeCls: 'bg-green-100 text-green-800 border border-green-300',
    headline: { id: 'Air Aman', en: 'Water Safe' },
  },
  warning: {
    Icon: ShieldAlert, iconClass: 'text-amber-500',
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50', border: 'border-amber-200', bar: '#F59E0B',
    titleColor: 'text-amber-700', badgeCls: 'bg-amber-100 text-amber-800 border border-amber-300',
    headline: { id: 'Perlu Perhatian', en: 'Needs Attention' },
  },
  danger: {
    Icon: ShieldX, iconClass: 'text-red-600',
    bg: 'bg-gradient-to-br from-red-50 to-rose-50', border: 'border-red-300', bar: '#EF4444',
    titleColor: 'text-red-700', badgeCls: 'bg-red-100 text-red-800 border border-red-300',
    headline: { id: 'Kondisi Bahaya', en: 'Dangerous Condition' },
  },
  offline: {
    Icon: ShieldOff, iconClass: 'text-gray-400',
    bg: 'bg-gradient-to-br from-gray-50 to-slate-50', border: 'border-gray-200', bar: '#CBD5E1',
    titleColor: 'text-gray-500', badgeCls: 'bg-gray-100 text-gray-500 border border-gray-200',
    headline: { id: 'Tidak Online', en: 'Offline' },
  },
  unknown: {
    Icon: ShieldOff, iconClass: 'text-gray-400',
    bg: 'bg-gradient-to-br from-gray-50 to-slate-50', border: 'border-gray-200', bar: '#CBD5E1',
    titleColor: 'text-gray-500', badgeCls: 'bg-gray-100 text-gray-500 border border-gray-200',
    headline: { id: 'Tidak Diketahui', en: 'Unknown' },
  },
}

// Item badge color per status
const ITEM_CLS: Record<StatusLevel, string> = {
  safe:    'bg-green-50  text-green-700  border border-green-200',
  warning: 'bg-amber-50  text-amber-700  border border-amber-200',
  danger:  'bg-red-50    text-red-700    border border-red-200',
  offline: 'bg-gray-100  text-gray-500   border border-gray-200',
  unknown: 'bg-gray-100  text-gray-500   border border-gray-200',
}

const ITEM_ICON: Record<StatusLevel, React.ComponentType<{ size?: number; className?: string }>> = {
  safe:    ShieldCheck,
  warning: ShieldAlert,
  danger:  ShieldX,
  offline: ShieldOff,
  unknown: ShieldOff,
}

export default function WaterQualityCard({ status, label, message, items = [], lang = 'id' }: WaterQualityCardProps) {
  const c  = CONFIG[status] ?? CONFIG.offline
  const { Icon } = c

  return (
    <div className={`card p-4 border-2 ${c.bg} ${c.border}`}
      style={{ borderTop: `4px solid ${c.bar}` }}
      role="region" aria-label={`Water quality: ${label}`}>

      {/* Section label */}
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
        {lang === 'id' ? 'Kualitas Air' : 'Water Quality'}
      </p>

      {/* Main status row */}
      <div className="flex items-center gap-3 mb-3">
        <Icon size={38} className={c.iconClass} aria-hidden="true" />
        <div>
          <p className={`text-xl font-black tracking-tight leading-none mb-1 ${c.titleColor}`}>
            {c.headline[lang]}
          </p>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${c.badgeCls}`}>
            <Icon size={10} />
            {label}
          </span>
          {message && (
            <p className="text-xs text-gray-500 leading-snug mt-1.5 max-w-xs">{message}</p>
          )}
        </div>
      </div>

      {/* Parameter pills */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100/60">
          {items.map(item => {
            const ItemIcon = ITEM_ICON[item.status]
            return (
              <span key={item.label}
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${ITEM_CLS[item.status]}`}>
                <ItemIcon size={9} />
                {item.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
