// ─────────────────────────────────────────────────────────────
//  Range indicator legend — hijau/kuning/merah
//  Dipakai di bawah semua chart
// ─────────────────────────────────────────────────────────────

import type { ChartMetric } from '@/types'
import type { Lang } from '@/lib/i18n/translations'

interface RangeItem {
  color: string
  label: { id: string; en: string }
  range: string
}

const RANGES: Record<ChartMetric, RangeItem[]> = {
  ph: [
    { color: '#22C55E', label: { id: 'Aman',      en: 'Safe'      }, range: '6.5 – 8.5' },
    { color: '#F59E0B', label: { id: 'Waspada',   en: 'Caution'   }, range: '6.0 – 6.5 / 8.5 – 9.0' },
    { color: '#EF4444', label: { id: 'Bahaya',    en: 'Danger'    }, range: '< 6.0 / > 9.0' },
  ],
  tds: [
    { color: '#22C55E', label: { id: 'Aman',      en: 'Safe'      }, range: '≤ 300 ppm' },
    { color: '#F59E0B', label: { id: 'Waspada',   en: 'Caution'   }, range: '300 – 500 ppm' },
    { color: '#EF4444', label: { id: 'Bahaya',    en: 'Danger'    }, range: '> 500 ppm' },
  ],
  turbidity: [
    { color: '#22C55E', label: { id: 'Jernih',    en: 'Clear'     }, range: '≤ 100 NTU' },
    { color: '#F59E0B', label: { id: 'Waspada',   en: 'Caution'   }, range: '100 – 500 NTU' },
    { color: '#EF4444', label: { id: 'Bahaya',    en: 'Danger'    }, range: '> 500 NTU' },
  ],
  flow_lpm: [
    { color: '#22C55E', label: { id: 'Normal',    en: 'Normal'    }, range: '≥ 0.5 L/min' },
    { color: '#F59E0B', label: { id: 'Rendah',    en: 'Low'       }, range: '0.1 – 0.5 L/min' },
    { color: '#EF4444', label: { id: 'Tidak Ada', en: 'No Flow'   }, range: '< 0.1 L/min' },
  ],
}

interface RangeIndicatorProps {
  metric: ChartMetric
  lang:   Lang
}

export default function RangeIndicator({ metric, lang }: RangeIndicatorProps) {
  const items = RANGES[metric]
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 pt-2 border-t border-gray-100">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
          <span className="text-[11px] font-semibold" style={{ color: item.color }}>
            {item.label[lang]}
          </span>
          <span className="text-[11px] text-gray-400">{item.range}</span>
        </div>
      ))}
    </div>
  )
}
