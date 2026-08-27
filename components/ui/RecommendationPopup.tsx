'use client'

import { useEffect, useState } from 'react'
import {
  X, ShieldX, ShieldAlert, ShieldCheck,
  Droplets, Gauge, Waves, Activity,
  Lightbulb, AlertTriangle, Info,
} from 'lucide-react'
import type { Reading } from '@/types'
import {
  evaluatePh, evaluateTds, evaluateTurbidity, evaluateFlow,
} from '@/lib/thresholds'
import type { Lang } from '@/lib/i18n/translations'

interface Recommendation {
  param:    string
  level:    'danger' | 'warning' | 'safe'
  value:    string
  what:     { id: string; en: string }   // apa yang terjadi
  why:      { id: string; en: string }   // kenapa berbahaya
  action:   { id: string; en: string }   // tindakan yang disarankan
  icon:     React.ReactNode
}

function buildRecommendations(r: Reading): Recommendation[] {
  const recs: Recommendation[] = []

  // ── pH ────────────────────────────────────────────────
  const ph = evaluatePh(r.ph)
  if (ph.status === 'danger') {
    recs.push({
      param: 'pH', level: 'danger', value: `${r.ph.toFixed(2)}`,
      icon: <Droplets size={18} />,
      what:   { id: `pH air ${r.ph.toFixed(2)} berada di luar rentang aman`, en: `Water pH ${r.ph.toFixed(2)} is outside the safe range` },
      why:    { id: r.ph < 6.0 ? 'Air terlalu asam — dapat merusak jaringan dan menyebabkan keracunan' : 'Air terlalu basa — dapat menyebabkan iritasi dan masalah pencernaan', en: r.ph < 6.0 ? 'Water is too acidic — may damage tissue and cause poisoning' : 'Water is too alkaline — may cause irritation and digestive issues' },
      action: { id: 'Hentikan distribusi air. Periksa filter dan lakukan kalibrasi sensor pH. Hubungi teknisi segera.', en: 'Stop water distribution. Check filters and calibrate the pH sensor. Contact a technician immediately.' },
    })
  } else if (ph.status === 'warning') {
    recs.push({
      param: 'pH', level: 'warning', value: `${r.ph.toFixed(2)}`,
      icon: <Droplets size={18} />,
      what:   { id: `pH air ${r.ph.toFixed(2)} mendekati batas aman`, en: `Water pH ${r.ph.toFixed(2)} is approaching safe limits` },
      why:    { id: 'pH di luar 6.5–8.5 dapat mempengaruhi kualitas dan rasa air', en: 'pH outside 6.5–8.5 may affect water quality and taste' },
      action: { id: 'Pantau secara berkala. Periksa dosis koagulan dan kondisi filter karbon.', en: 'Monitor closely. Check coagulant dosage and carbon filter condition.' },
    })
  } else {
    recs.push({
      param: 'pH', level: 'safe', value: `${r.ph.toFixed(2)}`,
      icon: <Droplets size={18} />,
      what:   { id: `pH air ${r.ph.toFixed(2)} berada dalam rentang normal`, en: `Water pH ${r.ph.toFixed(2)} is within normal range` },
      why:    { id: 'pH 6.5–8.5 menunjukkan kualitas air yang baik dan aman untuk dikonsumsi', en: 'pH 6.5–8.5 indicates good water quality, safe for consumption' },
      action: { id: 'Kondisi baik. Lanjutkan operasi normal dan pantau secara rutin.', en: 'Good condition. Continue normal operation and monitor routinely.' },
    })
  }

  // ── TDS ───────────────────────────────────────────────
  const tds = evaluateTds(r.tds)
  if (tds.status === 'danger') {
    recs.push({
      param: 'TDS', level: 'danger', value: `${r.tds.toFixed(0)} ppm`,
      icon: <Gauge size={18} />,
      what:   { id: `TDS ${r.tds.toFixed(0)} ppm — kadar zat terlarut sangat tinggi`, en: `TDS ${r.tds.toFixed(0)} ppm — dissolved solids are very high` },
      why:    { id: 'Kandungan mineral atau kontaminan berlebih berpotensi berbahaya bagi kesehatan', en: 'Excessive minerals or contaminants may pose health risks' },
      action: { id: 'Hentikan distribusi. Periksa dan ganti media filter. Cuci balik sistem filtrasi.', en: 'Stop distribution. Check and replace filter media. Backwash the filtration system.' },
    })
  } else if (tds.status === 'warning') {
    recs.push({
      param: 'TDS', level: 'warning', value: `${r.tds.toFixed(0)} ppm`,
      icon: <Gauge size={18} />,
      what:   { id: `TDS ${r.tds.toFixed(0)} ppm — agak tinggi`, en: `TDS ${r.tds.toFixed(0)} ppm — slightly elevated` },
      why:    { id: 'Zat terlarut meningkat, bisa dari kontaminasi atau filter jenuh', en: 'Dissolved solids increasing, possibly from contamination or saturated filter' },
      action: { id: 'Periksa kondisi cartridge filter. Pertimbangkan regenerasi atau penggantian.', en: 'Check filter cartridge condition. Consider regeneration or replacement.' },
    })
  }

  // ── Turbidity ─────────────────────────────────────────
  const turb = evaluateTurbidity(r.turbidity)
  if (turb.status === 'danger') {
    recs.push({
      param: 'Turbidity', level: 'danger', value: `${r.turbidity.toFixed(0)} NTU`,
      icon: <Waves size={18} />,
      what:   { id: `Kekeruhan ${r.turbidity.toFixed(0)} NTU — air sangat keruh`, en: `Turbidity ${r.turbidity.toFixed(0)} NTU — water is very turbid` },
      why:    { id: 'Air keruh mengandung partikel tersuspensi, bakteri, atau kontaminan berbahaya', en: 'Turbid water contains suspended particles, bacteria, or harmful contaminants' },
      action: { id: 'Hentikan distribusi segera. Bersihkan pre-filter dan sediment filter. Periksa sumber air masuk.', en: 'Stop distribution immediately. Clean pre-filter and sediment filter. Check the input water source.' },
    })
  } else if (turb.status === 'warning') {
    recs.push({
      param: 'Turbidity', level: 'warning', value: `${r.turbidity.toFixed(0)} NTU`,
      icon: <Waves size={18} />,
      what:   { id: `Kekeruhan ${r.turbidity.toFixed(0)} NTU — air mulai keruh`, en: `Turbidity ${r.turbidity.toFixed(0)} NTU — water becoming cloudy` },
      why:    { id: 'Kekeruhan di atas 100 NTU menandakan beban partikel tinggi pada filter', en: 'Turbidity above 100 NTU indicates high particle load on filters' },
      action: { id: 'Bersihkan atau ganti sediment filter. Tingkatkan frekuensi backwash.', en: 'Clean or replace sediment filter. Increase backwash frequency.' },
    })
  }

  // ── Flow ──────────────────────────────────────────────
  const flow = evaluateFlow(r.flow_lpm, r.pump_status)
  if (flow.status === 'danger' && r.pump_status) {
    recs.push({
      param: 'Flow', level: 'danger', value: `${r.flow_lpm.toFixed(2)} L/min`,
      icon: <Activity size={18} />,
      what:   { id: `Aliran air ${r.flow_lpm.toFixed(2)} L/min dengan pompa aktif — gagal mengalir`, en: `Flow ${r.flow_lpm.toFixed(2)} L/min with pump active — flow failure` },
      why:    { id: 'Pompa menyala tapi tidak ada aliran — bisa dari penyumbatan, kebocoran, atau pompa rusak', en: 'Pump running but no flow — possible blockage, leak, or pump failure' },
      action: { id: 'Matikan pompa. Periksa pipa dari penyumbatan dan kebocoran. Cek kondisi impeler pompa.', en: 'Turn off the pump. Check pipes for blockage and leaks. Inspect pump impeller.' },
    })
  } else if (flow.status === 'warning' && r.pump_status) {
    recs.push({
      param: 'Flow', level: 'warning', value: `${r.flow_lpm.toFixed(2)} L/min`,
      icon: <Activity size={18} />,
      what:   { id: `Laju aliran rendah ${r.flow_lpm.toFixed(2)} L/min`, en: `Low flow rate ${r.flow_lpm.toFixed(2)} L/min` },
      why:    { id: 'Aliran rendah bisa disebabkan filter tersumbat sebagian atau tekanan pompa menurun', en: 'Low flow may be caused by partially blocked filter or reduced pump pressure' },
      action: { id: 'Periksa tekanan pompa dan kondisi filter. Lakukan backwash jika diperlukan.', en: 'Check pump pressure and filter condition. Perform backwash if needed.' },
    })
  }

  return recs
}

interface PopupProps {
  reading: Reading
  lang:    Lang
  onClose: () => void
}

const LEVEL_CONFIG = {
  danger:  { bg: 'bg-red-600',   icon: <ShieldX    size={22} className="text-white" />, label: { id: 'KONDISI BAHAYA',   en: 'DANGEROUS CONDITION'   }, border: 'border-red-600'  },
  warning: { bg: 'bg-amber-500', icon: <ShieldAlert size={22} className="text-white" />, label: { id: 'PERLU PERHATIAN', en: 'NEEDS ATTENTION'        }, border: 'border-amber-500'},
  safe:    { bg: 'bg-green-600', icon: <ShieldCheck size={22} className="text-white" />, label: { id: 'KONDISI AMAN',    en: 'SAFE CONDITION'         }, border: 'border-green-600'},
}

export default function RecommendationPopup({ reading, lang, onClose }: PopupProps) {
  const recs     = buildRecommendations(reading)
  const topLevel = recs.some(r => r.level === 'danger')
    ? 'danger'
    : recs.some(r => r.level === 'warning')
    ? 'warning'
    : 'safe'
  const lc = LEVEL_CONFIG[topLevel]

  // Auto-close after 30s for safe status
  useEffect(() => {
    if (topLevel === 'safe') {
      const t = setTimeout(onClose, 8000)
      return () => clearTimeout(t)
    }
  }, [topLevel, onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label="Water quality recommendation">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={topLevel === 'safe' ? onClose : undefined} />

      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-white">

        {/* Header */}
        <div className={`${lc.bg} px-5 py-4 flex items-center justify-between gap-3 shrink-0`}>
          <div className="flex items-center gap-3">
            {lc.icon}
            <div>
              <p className="font-black text-white text-sm tracking-wide">{lc.label[lang]}</p>
              <p className="text-white/75 text-xs mt-0.5">
                {lang === 'id' ? 'Sistem Rekomendasi FILTRAZON' : 'FILTRAZON Recommendation System'}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {recs.map((rec, i) => {
            const recCfg = {
              danger:  { bg: 'bg-red-50',    border: 'border-l-4 border-red-500',    icon: <ShieldX    size={16} className="text-red-500"   />, actionBg: 'bg-red-50   border border-red-200'   },
              warning: { bg: 'bg-amber-50',  border: 'border-l-4 border-amber-400',  icon: <ShieldAlert size={16} className="text-amber-500"/>, actionBg: 'bg-amber-50 border border-amber-200' },
              safe:    { bg: 'bg-green-50',  border: 'border-l-4 border-green-400',  icon: <ShieldCheck size={16} className="text-green-500"/>, actionBg: 'bg-green-50 border border-green-200' },
            }[rec.level]

            return (
              <div key={i} className={`p-4 ${recCfg.border}`}>
                {/* Param header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${recCfg.bg}`}
                    style={{ color: rec.level === 'danger' ? '#B91C1C' : rec.level === 'warning' ? '#92400E' : '#15803D' }}>
                    {rec.icon}
                  </div>
                  <div>
                    <p className="font-black text-sm text-[#1C2B3A]">{rec.param}</p>
                    <p className="text-xs font-bold" style={{ color: rec.level === 'danger' ? '#B91C1C' : rec.level === 'warning' ? '#92400E' : '#15803D' }}>
                      {rec.value}
                    </p>
                  </div>
                  <div className="ml-auto">{recCfg.icon}</div>
                </div>

                {/* What */}
                <div className="flex items-start gap-2 mb-2">
                  <Info size={13} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-700 leading-relaxed">{rec.what[lang]}</p>
                </div>

                {/* Why */}
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle size={13} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed italic">{rec.why[lang]}</p>
                </div>

                {/* Action */}
                <div className={`flex items-start gap-2 p-2.5 rounded-xl ${recCfg.actionBg}`}>
                  <Lightbulb size={13} className="shrink-0 mt-0.5"
                    style={{ color: rec.level === 'danger' ? '#B91C1C' : rec.level === 'warning' ? '#92400E' : '#15803D' }} />
                  <p className="text-xs font-semibold leading-relaxed"
                    style={{ color: rec.level === 'danger' ? '#B91C1C' : rec.level === 'warning' ? '#92400E' : '#15803D' }}>
                    {rec.action[lang]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-gray-400">
            {lang === 'id' ? `Berdasarkan data ${new Date(reading.received_at).toLocaleTimeString('id-ID')}` : `Based on data at ${new Date(reading.received_at).toLocaleTimeString('en-US')}`}
          </p>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0077B6] text-white hover:bg-[#0096C7] transition-colors min-h-[36px]">
            {lang === 'id' ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
