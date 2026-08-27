'use client'

import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea,
} from 'recharts'
import { useMemo } from 'react'
import type { ChartDataPoint, ChartMetric, ChartRange } from '@/types'
import { useLang } from '@/lib/i18n/context'
import RangeIndicator from './RangeIndicator'

interface RealtimeChartProps {
  data:           ChartDataPoint[]
  loading?:       boolean
  error?:         boolean
  metric:         ChartMetric
  range:          ChartRange
  onMetricChange: (m: ChartMetric) => void
  onRangeChange:  (r: ChartRange) => void
  lang?:          'id' | 'en'
}

const METRIC_CONFIG = (lang: 'id' | 'en') => [
  { key: 'ph'        as ChartMetric, label: 'pH',                                       unit: '',      color: '#2196D3', bg: '#E3F2FD' },
  { key: 'tds'       as ChartMetric, label: 'TDS',                                      unit: 'ppm',   color: '#43A047', bg: '#E8F5E9' },
  { key: 'turbidity' as ChartMetric, label: lang === 'id' ? 'Kekeruhan' : 'Turbidity',  unit: 'NTU',   color: '#D4A017', bg: '#FFFBEB' },
  { key: 'flow_lpm'  as ChartMetric, label: lang === 'id' ? 'Laju Alir' : 'Flow Rate',  unit: 'L/min', color: '#9C27B0', bg: '#F3E5F5' },
]

const RANGES: ChartRange[] = ['1H', '6H', '12H', '24H']

// Zone definitions per metric — hijau/kuning/merah
const ZONES: Record<ChartMetric, Array<{ y1: number; y2: number; fill: string; label: string }>> = {
  ph: [
    { y1: 0,   y2: 6.0, fill: '#FEE2E2', label: 'Bahaya'  },
    { y1: 6.0, y2: 6.5, fill: '#FEF9C3', label: 'Waspada' },
    { y1: 6.5, y2: 8.5, fill: '#DCFCE7', label: 'Aman'    },
    { y1: 8.5, y2: 9.0, fill: '#FEF9C3', label: 'Waspada' },
    { y1: 9.0, y2: 14,  fill: '#FEE2E2', label: 'Bahaya'  },
  ],
  tds: [
    { y1: 0,   y2: 300, fill: '#DCFCE7', label: 'Aman'    },
    { y1: 300, y2: 500, fill: '#FEF9C3', label: 'Waspada' },
    { y1: 500, y2: 2000,fill: '#FEE2E2', label: 'Bahaya'  },
  ],
  turbidity: [
    { y1: 0,   y2: 100, fill: '#DCFCE7', label: 'Aman'    },
    { y1: 100, y2: 500, fill: '#FEF9C3', label: 'Waspada' },
    { y1: 500, y2: 3000,fill: '#FEE2E2', label: 'Bahaya'  },
  ],
  flow_lpm: [
    { y1: 0,   y2: 0.1, fill: '#FEE2E2', label: 'Bahaya'  },
    { y1: 0.1, y2: 0.5, fill: '#FEF9C3', label: 'Waspada' },
    { y1: 0.5, y2: 30,  fill: '#DCFCE7', label: 'Aman'    },
  ],
}

// Warna dot berdasarkan nilai & metric
function getValueColor(value: number, metric: ChartMetric): string {
  const z = ZONES[metric]
  for (let i = z.length - 1; i >= 0; i--) {
    if (value >= z[i].y1 && value < z[i].y2) {
      if (z[i].fill === '#DCFCE7') return '#22C55E'
      if (z[i].fill === '#FEF9C3') return '#F59E0B'
      return '#EF4444'
    }
  }
  return '#94A3B8'
}

function ChartTooltip({ active, payload, label, unit, metric, lang }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  unit: string
  metric: ChartMetric
  lang: 'id' | 'en'
}) {
  if (!active || !payload?.length) return null
  const val   = payload[0].value
  const color = getValueColor(val, metric)
  const z     = ZONES[metric].find(z => val >= z.y1 && val < z.y2)
  const zoneLabelMap: Record<string, { id: string; en: string }> = {
    'Aman':    { id: '✓ Aman',     en: '✓ Safe'    },
    'Waspada': { id: '⚠ Waspada',  en: '⚠ Caution' },
    'Bahaya':  { id: '🚨 Bahaya',  en: '🚨 Danger' },
  }
  const zLabel = z ? (zoneLabelMap[z.label]?.[lang] ?? z.label) : ''

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 shadow-xl text-xs min-w-[100px]">
      <p className="text-gray-400 text-[11px] mb-1">{label}</p>
      <p className="font-black text-lg leading-none mb-1" style={{ color }}>
        {val.toFixed(2)}
        <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
      </p>
      {zLabel && (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ color, background: color + '18' }}>
          {zLabel}
        </span>
      )}
    </div>
  )
}

export default function RealtimeChart({
  data, loading = false, error = false,
  metric, range, onMetricChange, onRangeChange,
  lang = 'id',
}: RealtimeChartProps) {
  const metrics = METRIC_CONFIG(lang)
  const cfg     = metrics.find(m => m.key === metric)!
  const zones   = ZONES[metric]

  const chartData = useMemo(() => {
    if (data.length <= 100) return data
    const step = Math.ceil(data.length / 100)
    return data.filter((_, i) => i % step === 0)
  }, [data])

  const latestVal   = chartData.length > 0 ? chartData[chartData.length - 1].value : null
  const latestColor = latestVal !== null ? getValueColor(latestVal, metric) : cfg.color

  const title = lang === 'id' ? 'Grafik Sensor' : 'Sensor Chart'

  if (loading) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-5 w-28 bg-gray-100 rounded" />
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="h-7 w-10 bg-gray-100 rounded-lg" />)}
          </div>
        </div>
        <div className="h-56 bg-gray-50 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="card p-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            {latestVal !== null && (
              <>
                <span className="text-2xl font-black" style={{ color: latestColor }}>
                  {latestVal.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-gray-500">{cfg.label}</span>
                {cfg.unit && <span className="text-xs text-gray-400">{cfg.unit}</span>}
              </>
            )}
          </div>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
          {RANGES.map(r => (
            <button key={r} onClick={() => onRangeChange(r)} aria-pressed={range === r}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                range === r ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metric pills */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {metrics.map(m => (
          <button key={m.key} onClick={() => onMetricChange(m.key)} aria-pressed={metric === m.key}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              metric === m.key ? 'text-white shadow-sm' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
            }`}
            style={metric === m.key ? { background: m.color } : {}}>
            <span className="w-2 h-2 rounded-full"
              style={{ background: metric === m.key ? 'rgba(255,255,255,0.6)' : m.color }} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {error || chartData.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center rounded-xl bg-gray-50 gap-2">
          <span className="text-2xl">📊</span>
          <p className="text-sm text-gray-400">
            {error
              ? (lang === 'id' ? 'Gagal memuat data' : 'Failed to load data')
              : (lang === 'id' ? 'Belum ada data riwayat' : 'No history data yet')}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={cfg.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0}   />
              </linearGradient>
            </defs>

            {/* Color zones — hijau/kuning/merah */}
            {zones.map((z, i) => (
              <ReferenceArea key={i} y1={z.y1} y2={z.y2}
                fill={z.fill} fillOpacity={0.45} strokeOpacity={0} />
            ))}

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#CBD5E1' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#CBD5E1' }} tickLine={false} axisLine={false} width={36} />

            <Tooltip content={<ChartTooltip unit={cfg.unit} metric={metric} lang={lang} />} />

            <Area
              type="monotone"
              dataKey="value"
              stroke={cfg.color}
              strokeWidth={2.5}
              fill={`url(#grad-${metric})`}
              dot={false}
              activeDot={{ r: 5, fill: latestColor, strokeWidth: 2, stroke: 'white' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Range indicator legend */}
      <RangeIndicator metric={metric} lang={lang} />
    </div>
  )
}
