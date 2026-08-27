'use client'

import { Power, Sun, AlertTriangle } from 'lucide-react'

interface TreatmentStatusProps {
  pumpOn:       boolean
  uvOn:         boolean
  flowLpm:      number
  pumpRuntime?: string
  uvRuntime?:   string
  lang?:        'id' | 'en'
}

function StatusIndicator({ on, label, icon, lang }: {
  on: boolean; label: string; icon: React.ReactNode; lang: 'id' | 'en'
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${on ? 'bg-[#EAF8FC] text-[#1268A5]' : 'bg-gray-100 text-gray-400'}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${on ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
        {on
          ? (lang === 'id' ? 'NYALA' : 'ON')
          : (lang === 'id' ? 'MATI'  : 'OFF')}
      </span>
    </div>
  )
}

export default function TreatmentStatus({
  pumpOn, uvOn, flowLpm, pumpRuntime, uvRuntime, lang = 'id',
}: TreatmentStatusProps) {
  const flowFailure = pumpOn && flowLpm <= 0
  const uvNoFlow    = uvOn   && flowLpm <= 0

  const L = {
    title:       { id: 'Sistem Pengolahan',  en: 'Treatment System'     },
    pump:        { id: 'Pompa',              en: 'Pump'                  },
    uv:          { id: 'UV Sterilizer',      en: 'UV Sterilizer'         },
    pumpRuntime: { id: 'Waktu Pompa',        en: 'Pump Runtime'          },
    uvRuntime:   { id: 'Waktu UV',           en: 'UV Runtime'            },
    currentFlow: { id: 'Aliran Saat Ini',    en: 'Current Flow'          },
    flowFail:    { id: 'Kegagalan aliran — pompa NYALA tapi tidak mengalir', en: 'Flow failure detected — pump is ON but no flow' },
    uvNoFlow:    { id: 'UV aktif tanpa aliran air', en: 'UV active without water flow' },
  }
  const t = (k: keyof typeof L) => L[k][lang]

  return (
    <div className="card p-4" role="region" aria-label={t('title')}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{t('title')}</p>

      <div className="divide-y divide-gray-50">
        <StatusIndicator on={pumpOn} label={t('pump')} icon={<Power size={16} />} lang={lang} />
        <StatusIndicator on={uvOn}   label={t('uv')}   icon={<Sun size={16} />}   lang={lang} />
      </div>

      {flowFailure && (
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700 font-medium">{t('flowFail')}</p>
        </div>
      )}
      {uvNoFlow && !flowFailure && (
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">{t('uvNoFlow')}</p>
        </div>
      )}

      {(pumpRuntime || uvRuntime) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {pumpRuntime && (
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <p className="text-[10px] text-gray-400 font-medium">{t('pumpRuntime')}</p>
              <p className="text-xs font-bold text-gray-700">{pumpRuntime}</p>
            </div>
          )}
          {uvRuntime && (
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <p className="text-[10px] text-gray-400 font-medium">{t('uvRuntime')}</p>
              <p className="text-xs font-bold text-gray-700">{uvRuntime}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400">{t('currentFlow')}</span>
        <span className={`text-xs font-bold ${flowLpm > 0 ? 'text-[#1268A5]' : 'text-red-600'}`}>
          {flowLpm.toFixed(2)} L/min
        </span>
      </div>
    </div>
  )
}
