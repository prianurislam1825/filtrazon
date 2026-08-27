'use client'

import { RadioTower, Signal } from 'lucide-react'
import { evaluateRssi, evaluateSnr } from '@/lib/thresholds'
import StatusBadge from '@/components/ui/StatusBadge'

interface LoRaStatusCardProps {
  rssi:        number
  snr:         number
  gateway:     string
  packetLoss?: number
  lastPacket?: string
  lang?:       'id' | 'en'
}

function SignalBars({ rssi }: { rssi: number }) {
  const level = rssi > -70 ? 4 : rssi > -85 ? 3 : rssi > -100 ? 2 : rssi > -110 ? 1 : 0
  return (
    <div className="flex items-end gap-0.5" aria-label={`Signal: ${level}/4`}>
      {[1,2,3,4].map(bar => (
        <div key={bar}
          className={`w-2 rounded-sm transition-colors ${bar <= level
            ? level >= 3 ? 'bg-green-500' : level === 2 ? 'bg-amber-400' : 'bg-red-500'
            : 'bg-gray-200'}`}
          style={{ height: `${bar * 4 + 4}px` }} />
      ))}
    </div>
  )
}

export default function LoRaStatusCard({
  rssi, snr, gateway, packetLoss = 0, lastPacket, lang = 'id',
}: LoRaStatusCardProps) {
  const rssiResult = evaluateRssi(rssi)
  const snrResult  = evaluateSnr(snr)

  const L = {
    title:       { id: 'Koneksi LoRa',    en: 'LoRa Link'     },
    gateway:     { id: 'Gateway',         en: 'Gateway'        },
    packetLoss:  { id: 'Kehilangan Paket',en: 'Packet Loss'    },
    lastPacket:  { id: 'Paket Terakhir',  en: 'Last Packet'    },
  }
  const t = (k: keyof typeof L) => L[k][lang]

  // Translate status labels
  const statusMap: Record<string, Record<'id'|'en', string>> = {
    'Good': { id: 'Bagus', en: 'Good' },
    'Weak': { id: 'Lemah', en: 'Weak' },
    'Poor': { id: 'Buruk', en: 'Poor' },
    'Marginal': { id: 'Marginal', en: 'Marginal' },
    'OK':   { id: 'OK',    en: 'OK'   },
  }
  const tStatus = (s: string) => statusMap[s]?.[lang] ?? s

  return (
    <div className="card p-4" role="region" aria-label={t('title')}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{t('title')}</p>
        <div className="flex items-center gap-2">
          <RadioTower size={14} className="text-[#1268A5]" />
          <SignalBars rssi={rssi} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-lg bg-gray-50">
          <p className="text-[10px] text-gray-400 font-medium mb-0.5">RSSI</p>
          <p className="text-base font-bold text-gray-800">{rssi} <span className="text-xs font-normal text-gray-400">dBm</span></p>
          <StatusBadge status={rssiResult.status} label={tStatus(rssiResult.label)} size="sm" />
        </div>
        <div className="p-2.5 rounded-lg bg-gray-50">
          <p className="text-[10px] text-gray-400 font-medium mb-0.5">SNR</p>
          <p className="text-base font-bold text-gray-800">{snr} <span className="text-xs font-normal text-gray-400">dB</span></p>
          <StatusBadge status={snrResult.status} label={tStatus(snrResult.label)} size="sm" />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">{t('gateway')}</span>
          <span className="font-semibold text-gray-700 flex items-center gap-1">
            <Signal size={11} className="text-[#5BBCEB]" />
            {gateway}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">{t('packetLoss')}</span>
          <span className={`font-semibold ${packetLoss > 5 ? 'text-red-600' : packetLoss > 2 ? 'text-amber-600' : 'text-green-600'}`}>
            {packetLoss.toFixed(1)}%
          </span>
        </div>
        {lastPacket && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{t('lastPacket')}</span>
            <span className="font-medium text-gray-600">{lastPacket}</span>
          </div>
        )}
      </div>
    </div>
  )
}
