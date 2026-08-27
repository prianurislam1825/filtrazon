'use client'

import {
  CheckCircle2, AlertTriangle, XCircle,
  Droplets, Gauge, Waves, Activity,
  Lightbulb, ThumbsUp,
} from 'lucide-react'
import type { StatusLevel } from '@/types'

// ── Advice definition per parameter & level ─────────────────

interface AdviceItem {
  param:      string
  unit:       string
  value:      number
  level:      StatusLevel
  icon:       React.ReactNode
  // Apa yang terjadi
  what:       { id: string; en: string }
  // Kenapa ini penting
  why:        { id: string; en: string }
  // Apa yang harus dilakukan
  action:     { id: string; en: string }
}

// ── Threshold ranges ─────────────────────────────────────────
function phAdvice(ph: number): AdviceItem {
  const base = { param: 'pH', unit: '', value: ph, icon: <Droplets size={16} /> }

  if (ph < 6.0) return { ...base, level: 'danger',
    what:   { id: `pH ${ph.toFixed(2)} — air sangat asam`, en: `pH ${ph.toFixed(2)} — water is very acidic` },
    why:    { id: 'Air terlalu asam dapat merusak pipa, iritasi kulit dan saluran pencernaan jika dikonsumsi', en: 'Very acidic water can damage pipes and cause digestive irritation if consumed' },
    action: { id: 'Hentikan distribusi segera. Periksa sumber air dan tambahkan kapur (CaCO₃) atau soda ash untuk menaikkan pH. Kalibrasi sensor pH.', en: 'Stop distribution immediately. Check water source and add lime (CaCO₃) or soda ash to raise pH. Calibrate pH sensor.' },
  }
  if (ph > 9.0) return { ...base, level: 'danger',
    what:   { id: `pH ${ph.toFixed(2)} — air sangat basa`, en: `pH ${ph.toFixed(2)} — water is very alkaline` },
    why:    { id: 'Air terlalu basa dapat menyebabkan iritasi mata, kulit, dan saluran cerna', en: 'Very alkaline water can cause eye, skin, and digestive irritation' },
    action: { id: 'Hentikan distribusi. Periksa dosis koagulan. Tambahkan asam sitrat secara terukur untuk menurunkan pH.', en: 'Stop distribution. Check coagulant dosage. Add citric acid carefully to lower pH.' },
  }
  if (ph < 6.5) return { ...base, level: 'warning',
    what:   { id: `pH ${ph.toFixed(2)} — mendekati batas asam`, en: `pH ${ph.toFixed(2)} — approaching acidic limit` },
    why:    { id: 'pH di bawah 6.5 menandakan potensi korosi dan perubahan rasa air', en: 'pH below 6.5 indicates potential corrosion and taste changes' },
    action: { id: 'Pantau lebih sering. Periksa media filter karbon aktif dan dosis koagulan. Pertimbangkan penambahan kapur dosis kecil.', en: 'Monitor more frequently. Check activated carbon filter media and coagulant dosage. Consider small lime addition.' },
  }
  if (ph > 8.5) return { ...base, level: 'warning',
    what:   { id: `pH ${ph.toFixed(2)} — mendekati batas basa`, en: `pH ${ph.toFixed(2)} — approaching alkaline limit` },
    why:    { id: 'pH di atas 8.5 dapat mengurangi efektivitas klorinasi dan memberi rasa pahit', en: 'pH above 8.5 may reduce chlorination effectiveness and give a bitter taste' },
    action: { id: 'Periksa kondisi air sumber. Monitor dekat dan kurangi dosis alkali jika ada.', en: 'Check source water condition. Monitor closely and reduce alkali dosage if any.' },
  }
  return { ...base, level: 'safe',
    what:   { id: `pH ${ph.toFixed(2)} — air netral dan aman`, en: `pH ${ph.toFixed(2)} — water is neutral and safe` },
    why:    { id: 'pH 6.5–8.5 adalah rentang ideal untuk air minum yang aman dan tidak korosif', en: 'pH 6.5–8.5 is the ideal range for safe, non-corrosive drinking water' },
    action: { id: 'Pertahankan kondisi ini. Lakukan monitoring rutin setiap shift dan catat dalam log harian.', en: 'Maintain this condition. Perform routine monitoring every shift and log daily.' },
  }
}

function tdsAdvice(tds: number): AdviceItem {
  const base = { param: 'TDS', unit: 'ppm', value: tds, icon: <Gauge size={16} /> }

  if (tds > 500) return { ...base, level: 'danger',
    what:   { id: `TDS ${tds.toFixed(0)} ppm — kandungan zat terlarut sangat tinggi`, en: `TDS ${tds.toFixed(0)} ppm — dissolved solids very high` },
    why:    { id: 'TDS tinggi menunjukkan kontaminasi mineral berlebih, logam berat, atau bahan kimia berbahaya', en: 'High TDS indicates excessive mineral contamination, heavy metals, or harmful chemicals' },
    action: { id: 'Hentikan distribusi. Ganti media filter RO atau karbon aktif. Periksa sumber pencemaran air masuk.', en: 'Stop distribution. Replace RO or activated carbon filter media. Inspect source water contamination.' },
  }
  if (tds > 300) return { ...base, level: 'warning',
    what:   { id: `TDS ${tds.toFixed(0)} ppm — kandungan mineral agak tinggi`, en: `TDS ${tds.toFixed(0)} ppm — mineral content slightly elevated` },
    why:    { id: 'TDS 300–500 ppm masih bisa dikonsumsi tapi menandakan filter mulai jenuh', en: 'TDS 300–500 ppm is still drinkable but indicates filter is becoming saturated' },
    action: { id: 'Periksa dan pertimbangkan penggantian cartridge filter. Tingkatkan frekuensi backwash.', en: 'Check and consider replacing filter cartridge. Increase backwash frequency.' },
  }
  return { ...base, level: 'safe',
    what:   { id: `TDS ${tds.toFixed(0)} ppm — mineral terlarut dalam batas aman`, en: `TDS ${tds.toFixed(0)} ppm — dissolved minerals within safe limits` },
    why:    { id: 'TDS ≤300 ppm menunjukkan filter bekerja optimal dan air aman untuk dikonsumsi', en: 'TDS ≤300 ppm indicates filter working optimally and water is safe to consume' },
    action: { id: 'Pertahankan kondisi filter. Jadwalkan penggantian media filter sesuai jam operasi.', en: 'Maintain filter condition. Schedule filter media replacement per operating hours.' },
  }
}

function turbidityAdvice(turb: number): AdviceItem {
  const base = { param: 'Turbidity', unit: 'NTU', value: turb, icon: <Waves size={16} /> }

  if (turb > 500) return { ...base, level: 'danger',
    what:   { id: `Turbiditas ${turb.toFixed(0)} NTU — air sangat keruh dan berbahaya`, en: `Turbidity ${turb.toFixed(0)} NTU — water is very turbid and dangerous` },
    why:    { id: 'Air sangat keruh mengandung partikel tersuspensi, bakteri, dan patogen yang membahayakan kesehatan', en: 'Very turbid water contains suspended particles, bacteria, and pathogens dangerous to health' },
    action: { id: 'Hentikan distribusi segera. Bersihkan atau ganti pre-filter dan sediment filter. Periksa kualitas air sumber masuk.', en: 'Stop distribution immediately. Clean or replace pre-filter and sediment filter. Check source water quality.' },
  }
  if (turb > 100) return { ...base, level: 'warning',
    what:   { id: `Turbiditas ${turb.toFixed(0)} NTU — air mulai keruh`, en: `Turbidity ${turb.toFixed(0)} NTU — water becoming cloudy` },
    why:    { id: 'Kekeruhan >100 NTU menandakan beban partikel tinggi yang dapat menurunkan efektivitas UV dan klorinasi', en: 'Turbidity >100 NTU indicates high particle load that can reduce UV and chlorination effectiveness' },
    action: { id: 'Bersihkan sediment filter. Lakukan backwash. Periksa apakah sumber air mengalami peningkatan kekeruhan akibat hujan atau banjir.', en: 'Clean sediment filter. Perform backwash. Check if source water turbidity increased due to rain or flood.' },
  }
  return { ...base, level: 'safe',
    what:   { id: `Turbiditas ${turb.toFixed(0)} NTU — air jernih`, en: `Turbidity ${turb.toFixed(0)} NTU — water is clear` },
    why:    { id: 'Turbiditas ≤100 NTU menunjukkan partikel tersuspensi minimal dan filter berfungsi baik', en: 'Turbidity ≤100 NTU indicates minimal suspended particles and filter functioning well' },
    action: { id: 'Kondisi baik. Lakukan pembersihan filter sesuai jadwal dan monitoring rutin.', en: 'Good condition. Perform scheduled filter cleaning and routine monitoring.' },
  }
}

function flowAdvice(flow: number, pumpOn: boolean): AdviceItem {
  const base = { param: 'Flow Rate', unit: 'L/min', value: flow, icon: <Activity size={16} /> }

  if (!pumpOn) return { ...base, level: 'safe',
    what:   { id: 'Pompa dalam kondisi mati — tidak ada aliran', en: 'Pump is off — no flow expected' },
    why:    { id: 'Tidak ada aliran adalah kondisi normal ketika pompa dimatikan', en: 'No flow is normal when the pump is switched off' },
    action: { id: 'Kondisi normal. Nyalakan pompa saat distribusi diperlukan.', en: 'Normal condition. Turn on the pump when distribution is needed.' },
  }
  if (flow < 0.1) return { ...base, level: 'danger',
    what:   { id: `Aliran ${flow.toFixed(2)} L/min — gagal mengalir dengan pompa aktif`, en: `Flow ${flow.toFixed(2)} L/min — flow failure with pump running` },
    why:    { id: 'Pompa menyala tapi tidak ada aliran menandakan penyumbatan, kebocoran pipa, atau kerusakan pompa', en: 'Pump running but no flow indicates blockage, pipe leak, or pump failure' },
    action: { id: 'Matikan pompa segera untuk mencegah kerusakan. Periksa pipa dari penyumbatan dan kebocoran. Cek kondisi impeler pompa.', en: 'Turn off pump immediately to prevent damage. Check pipes for blockage and leaks. Inspect pump impeller.' },
  }
  if (flow < 0.5) return { ...base, level: 'warning',
    what:   { id: `Aliran ${flow.toFixed(2)} L/min — laju aliran rendah`, en: `Flow ${flow.toFixed(2)} L/min — low flow rate` },
    why:    { id: 'Laju aliran rendah mengurangi kapasitas produksi air bersih dan menandakan filter tersumbat sebagian', en: 'Low flow reduces clean water production capacity and indicates partially blocked filter' },
    action: { id: 'Periksa tekanan pompa. Bersihkan pre-filter. Lakukan backwash jika tekanan diferensial tinggi.', en: 'Check pump pressure. Clean pre-filter. Perform backwash if differential pressure is high.' },
  }
  return { ...base, level: 'safe',
    what:   { id: `Aliran ${flow.toFixed(2)} L/min — produksi air berjalan normal`, en: `Flow ${flow.toFixed(2)} L/min — water production running normally` },
    why:    { id: 'Laju aliran ≥0.5 L/min menunjukkan pompa dan sistem pipa berfungsi dengan baik', en: 'Flow rate ≥0.5 L/min indicates pump and piping system working properly' },
    action: { id: 'Pertahankan kondisi ini. Pantau tekanan pompa secara berkala dan catat debit produksi harian.', en: 'Maintain this condition. Monitor pump pressure periodically and log daily production output.' },
  }
}

// ── Status config ────────────────────────────────────────────
const LEVEL_STYLE: Record<StatusLevel, {
  border: string; bg: string; bar: string; iconBg: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  iconCls: string; textColor: string; actionBg: string; actionBorder: string
}> = {
  danger: {
    border:'border-red-200',   bg:'bg-red-50/60',  bar:'#EF4444',
    iconBg:'bg-red-100',       Icon: XCircle,      iconCls:'text-red-600',
    textColor:'text-red-800',  actionBg:'bg-red-50', actionBorder:'border-red-200',
  },
  warning: {
    border:'border-amber-200', bg:'bg-amber-50/60', bar:'#F59E0B',
    iconBg:'bg-amber-100',     Icon: AlertTriangle, iconCls:'text-amber-600',
    textColor:'text-amber-800',actionBg:'bg-amber-50', actionBorder:'border-amber-200',
  },
  safe: {
    border:'border-green-200', bg:'bg-green-50/40', bar:'#22C55E',
    iconBg:'bg-green-100',     Icon: CheckCircle2,  iconCls:'text-green-600',
    textColor:'text-green-800',actionBg:'bg-green-50', actionBorder:'border-green-200',
  },
  offline: {
    border:'border-gray-200',  bg:'bg-gray-50',     bar:'#CBD5E1',
    iconBg:'bg-gray-100',      Icon: CheckCircle2,  iconCls:'text-gray-400',
    textColor:'text-gray-500', actionBg:'bg-gray-50', actionBorder:'border-gray-200',
  },
  unknown: {
    border:'border-gray-200',  bg:'bg-gray-50',     bar:'#CBD5E1',
    iconBg:'bg-gray-100',      Icon: CheckCircle2,  iconCls:'text-gray-400',
    textColor:'text-gray-500', actionBg:'bg-gray-50', actionBorder:'border-gray-200',
  },
}

// ── Single advice row ────────────────────────────────────────
function AdviceRow({ item, lang }: { item: AdviceItem; lang: 'id' | 'en' }) {
  const s = LEVEL_STYLE[item.level]
  const { Icon } = s

  return (
    <div className={`rounded-2xl border overflow-hidden ${s.border}`}
      style={{ borderLeft: `4px solid ${s.bar}` }}>
      <div className={`p-3.5 ${s.bg}`}>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${s.iconBg}`}>
            <span style={{ color: s.bar }}>{item.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-sm text-[#1C2B3A]">{item.param}</span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.iconBg}`}
                style={{ color: s.bar }}>
                <Icon size={9} />
                {item.value.toFixed(item.unit === 'ppm' || item.unit === 'NTU' ? 0 : 2)}
                {item.unit && <span className="font-normal opacity-70 ml-0.5">{item.unit}</span>}
              </span>
            </div>
            <p className={`text-xs font-semibold mt-0.5 ${s.textColor}`}>{item.what[lang]}</p>
          </div>
        </div>

        {/* Why */}
        <p className="text-xs text-gray-600 leading-relaxed mb-2.5 pl-0.5">
          {item.why[lang]}
        </p>

        {/* Action */}
        <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${s.actionBg} ${s.actionBorder}`}>
          <Lightbulb size={13} className="shrink-0 mt-0.5" style={{ color: s.bar }} />
          <p className="text-xs font-semibold leading-relaxed" style={{ color: s.bar }}>
            {item.action[lang]}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────
interface WaterAdviceCardProps {
  ph:         number
  tds:        number
  turbidity:  number
  flowLpm:    number
  pumpOn:     boolean
  lang?:      'id' | 'en'
}

export default function WaterAdviceCard({
  ph, tds, turbidity, flowLpm, pumpOn, lang = 'id',
}: WaterAdviceCardProps) {
  const advices = [
    phAdvice(ph),
    tdsAdvice(tds),
    turbidityAdvice(turbidity),
    flowAdvice(flowLpm, pumpOn),
  ]

  const hasDanger  = advices.some(a => a.level === 'danger')
  const hasWarning = advices.some(a => a.level === 'warning')
  const allSafe    = !hasDanger && !hasWarning

  const overallBg    = hasDanger ? 'from-red-50 to-rose-50 border-red-200' : hasWarning ? 'from-amber-50 to-yellow-50 border-amber-200' : 'from-green-50 to-emerald-50 border-green-200'
  const overallBar   = hasDanger ? '#EF4444' : hasWarning ? '#F59E0B' : '#22C55E'
  const overallLabel = hasDanger
    ? { id: 'Diperlukan Tindakan Segera', en: 'Immediate Action Required' }
    : hasWarning
    ? { id: 'Perlu Diperhatikan', en: 'Attention Needed' }
    : { id: 'Semua Parameter Aman', en: 'All Parameters Safe' }

  return (
    <div className="card overflow-hidden" role="region" aria-label="Water quality advice">

      {/* Header */}
      <div className={`px-4 py-3 bg-gradient-to-r border-b ${overallBg} flex items-center justify-between gap-3`}
        style={{ borderTop: `3px solid ${overallBar}` }}>
        <div className="flex items-center gap-2.5">
          {hasDanger
            ? <XCircle size={18} className="text-red-600 shrink-0" />
            : hasWarning
            ? <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            : <ThumbsUp size={18} className="text-green-600 shrink-0" />
          }
          <div>
            <p className="text-xs font-black text-[#1C2B3A]">
              {lang === 'id' ? 'Saran & Rekomendasi' : 'Advice & Recommendations'}
            </p>
            <p className="text-[10px] font-semibold" style={{ color: overallBar }}>
              {overallLabel[lang]}
            </p>
          </div>
        </div>
        {allSafe && (
          <CheckCircle2 size={20} className="text-green-500 shrink-0" />
        )}
      </div>

      {/* Advice rows */}
      <div className="p-3 space-y-2.5">
        {/* Sort: danger first, then warning, then safe */}
        {[...advices]
          .sort((a, b) => {
            const order = { danger: 0, warning: 1, safe: 2, offline: 3, unknown: 4 }
            return order[a.level] - order[b.level]
          })
          .map((adv, i) => (
            <AdviceRow key={i} item={adv} lang={lang} />
          ))
        }
      </div>
    </div>
  )
}
