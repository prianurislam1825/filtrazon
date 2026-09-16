'use client'

import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from 'lucide-react'
import type { StatusLevel } from '@/types'

const S: Record<StatusLevel, {
  bar: string; text: string; bg: string; border: string; shadow: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}> = {
  safe:    { bar:'#22C55E', text:'#15803D', bg:'#F0FDF4', border:'#BBF7D0', shadow:'0 4px 14px rgba(34,197,94,0.18)',  Icon: CheckCircle2  },
  warning: { bar:'#F59E0B', text:'#92400E', bg:'#FFFBEB', border:'#FDE68A', shadow:'0 4px 14px rgba(245,158,11,0.18)', Icon: AlertTriangle  },
  danger:  { bar:'#EF4444', text:'#B91C1C', bg:'#FEF2F2', border:'#FECACA', shadow:'0 4px 14px rgba(239,68,68,0.20)',  Icon: XCircle        },
  offline: { bar:'#CBD5E1', text:'#64748B', bg:'#F8FAFC', border:'#E2E8F0', shadow:'none',                             Icon: MinusCircle    },
  unknown: { bar:'#CBD5E1', text:'#64748B', bg:'#F8FAFC', border:'#E2E8F0', shadow:'none',                             Icon: MinusCircle    },
}

const RANGES: Record<string, Array<{ color: string; label: { id: string; en: string }; range: string }>> = {
  ph: [
    { color:'#22C55E', label:{ id:'Aman',    en:'Safe'    }, range:'6.5 – 8.5'           },
    { color:'#F59E0B', label:{ id:'Waspada', en:'Caution' }, range:'6.0–6.5 / 8.5–9.0'  },
    { color:'#EF4444', label:{ id:'Bahaya',  en:'Danger'  }, range:'<6.0 / >9.0'        },
  ],
  tds: [
    { color:'#22C55E', label:{ id:'Aman',    en:'Safe'    }, range:'≤300 ppm'   },
    { color:'#F59E0B', label:{ id:'Waspada', en:'Caution' }, range:'301–500 ppm'},
    { color:'#EF4444', label:{ id:'Bahaya',  en:'Danger'  }, range:'>500 ppm'   },
  ],
  turbidity: [
    { color:'#22C55E', label:{ id:'Jernih',  en:'Clear'   }, range:'≤100 NTU'   },
    { color:'#F59E0B', label:{ id:'Waspada', en:'Caution' }, range:'101–500 NTU'},
    { color:'#EF4444', label:{ id:'Bahaya',  en:'Danger'  }, range:'>500 NTU'   },
  ],
  flow_lpm: [
    { color:'#22C55E', label:{ id:'Normal',   en:'Normal'  }, range:'≥0.5 L/min'    },
    { color:'#F59E0B', label:{ id:'Rendah',   en:'Low'     }, range:'0.1–0.5 L/min'},
    { color:'#EF4444', label:{ id:'Tidak Ada',en:'No Flow' }, range:'<0.1 L/min'   },
  ],
}

interface MetricCardProps {
  label:        string
  value:        string | number
  unit?:        string
  icon:         React.ReactNode
  status:       StatusLevel
  statusLabel?: string
  lastUpdate?:  string
  compact?:     boolean
  metric?:      string
  lang?:        'id' | 'en'
}

export default function MetricCard({
  label, value, unit, icon, status,
  statusLabel, lastUpdate, compact = false,
  metric, lang = 'id',
}: MetricCardProps) {
  const s      = S[status] ?? S.offline
  const ranges = metric ? RANGES[metric] : undefined
  const { Icon } = s

  return (
    <div
      className="card relative overflow-hidden flex flex-col hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
      style={{
        borderTop: `3px solid ${s.bar}`,
        boxShadow: s.shadow,
        padding: compact ? '12px' : '14px 14px 12px',
      }}
    >
      {/* Top: label + status icon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-none">
          {label}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ color: s.text, background: s.bg, border: `1px solid ${s.border}` }}>
          <Icon size={9} />
          {statusLabel ?? status}
        </span>
      </div>

        {/* Center: large sensor icon + value side by side */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
          {/* Icon — responsive size, prominent, rounded square with shadow */}
          <div
            className={`flex items-center justify-center rounded-2xl shrink-0 ${compact ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-12 h-12 sm:w-14 sm:h-14'}`}
            style={{
              background: s.bg,
              color:      s.bar,
              border:     `1.5px solid ${s.border}`,
              boxShadow:  `0 2px 8px ${s.bar}25`,
            }}
          >
            {/* Clone icon with larger size */}
            <span style={{ display:'contents' }}>
              {icon}
            </span>
          </div>
  
          {/* Value */}
          <div className="flex flex-col min-w-0">
            <span
              className={`font-black tracking-tight leading-none truncate ${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-[1.8rem] lg:text-3xl'}`}
              style={{ color: s.text }}
            >
              {typeof value === 'number'
                ? value.toLocaleString('id-ID', { maximumFractionDigits: 2 })
                : value}
            </span>
          {unit && (
            <span className="text-xs text-gray-400 font-medium mt-0.5">{unit}</span>
          )}
          {lastUpdate && (
            <span className="text-[10px] text-gray-400 mt-1">{lastUpdate}</span>
          )}
        </div>
      </div>

      {/* Range indicator */}
      {ranges && !compact && (
        <div className="flex flex-wrap gap-x-2 gap-y-1 pt-2 border-t border-gray-100">
          {ranges.map((r, i) => (
            <div key={i} className="flex items-center gap-1 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.color }} />
              <span className="text-[10px] font-semibold shrink-0" style={{ color: r.color }}>
                {r.label[lang]}
              </span>
              <span className="text-[10px] text-gray-400 truncate">{r.range}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
