'use client'

import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceArea,
} from 'recharts'
import { useMemo } from 'react'
import { useLang } from '@/lib/i18n/context'
import type { ChartDataPoint } from '@/types'
import RangeIndicator from './RangeIndicator'

interface PhChartProps {
  data:     ChartDataPoint[]
  loading?: boolean
  height?:  number
}

function getPhColor(ph: number): string {
  if (ph < 6.0 || ph > 9.0) return '#EF4444'   // merah
  if (ph < 6.5 || ph > 8.5) return '#F59E0B'   // kuning
  return '#22C55E'                               // hijau
}

function getPhLabel(ph: number, lang: 'id' | 'en'): string {
  if (ph < 6.0 || ph > 9.0) return lang === 'id' ? '🚨 Bahaya' : '🚨 Danger'
  if (ph < 6.5 || ph > 8.5) return lang === 'id' ? '⚠ Waspada' : '⚠ Caution'
  return lang === 'id' ? '✓ Aman' : '✓ Safe'
}

function PhTooltip({ active, payload, label, lang }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string; lang: 'id' | 'en'
}) {
  if (!active || !payload?.length) return null
  const ph    = payload[0].value
  const color = getPhColor(ph)
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
      <p className="text-gray-400 text-[11px] mb-1">{label}</p>
      <p className="font-black text-xl leading-none mb-1" style={{ color }}>
        {ph.toFixed(2)} <span className="text-xs font-normal text-gray-400">pH</span>
      </p>
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{ color, background: color + '18' }}>
        {getPhLabel(ph, lang)}
      </span>
    </div>
  )
}

export default function PhChart({ data, loading = false, height = 220 }: PhChartProps) {
  const { lang } = useLang()

  const chartData = useMemo(() => {
    if (data.length <= 100) return data
    const step = Math.ceil(data.length / 100)
    return data.filter((_, i) => i % step === 0)
  }, [data])

  const latestPh    = chartData.length > 0 ? chartData[chartData.length - 1].value : null
  const latestColor = latestPh !== null ? getPhColor(latestPh) : '#94A3B8'

  if (loading) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="h-5 w-40 bg-gray-100 rounded mb-4" />
        <div className="h-48 bg-gray-50 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="card p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            {lang === 'id' ? 'Tingkat Keasaman Air (pH)' : 'Water Acidity Level (pH)'}
          </p>
          {latestPh !== null ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black" style={{ color: latestColor }}>
                {latestPh.toFixed(2)}
              </span>
              <span className="text-sm font-bold px-2.5 py-1 rounded-full"
                style={{ color: latestColor, background: latestColor + '18' }}>
                {getPhLabel(latestPh, lang)}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 gap-2" style={{ height }}>
          <span className="text-2xl">💧</span>
          <p className="text-sm text-gray-400">
            {lang === 'id' ? 'Belum ada data pH' : 'No pH data yet'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ph-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2196D3" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2196D3" stopOpacity={0}    />
              </linearGradient>
            </defs>

            {/* Zone warna — merah/kuning/hijau/kuning/merah */}
            <ReferenceArea y1={0}   y2={6.0} fill="#FEE2E2" fillOpacity={0.5} strokeOpacity={0} />
            <ReferenceArea y1={6.0} y2={6.5} fill="#FEF9C3" fillOpacity={0.5} strokeOpacity={0} />
            <ReferenceArea y1={6.5} y2={8.5} fill="#DCFCE7" fillOpacity={0.5} strokeOpacity={0} />
            <ReferenceArea y1={8.5} y2={9.0} fill="#FEF9C3" fillOpacity={0.5} strokeOpacity={0} />
            <ReferenceArea y1={9.0} y2={14}  fill="#FEE2E2" fillOpacity={0.5} strokeOpacity={0} />

            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#CBD5E1' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              domain={[4, 10]}
              ticks={[4, 5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10]}
              tick={{ fontSize: 10, fill: '#CBD5E1' }}
              tickLine={false} axisLine={false} width={32}
            />
            <Tooltip content={<PhTooltip lang={lang} />} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#2196D3"
              strokeWidth={2.5}
              fill="url(#ph-grad)"
              dot={false}
              activeDot={{ r: 5, fill: latestColor, strokeWidth: 2, stroke: 'white' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Range legend */}
      <RangeIndicator metric="ph" lang={lang} />
    </div>
  )
}
