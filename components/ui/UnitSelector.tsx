'use client'

import { useState, useEffect } from 'react'
import { Cpu, RadioTower, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useUnit, type UnitDevice } from '@/lib/unit/context'
import { useLang } from '@/lib/i18n/context'
import Image from 'next/image'

export default function UnitSelector() {
  const { setSelectedUnit } = useUnit()
  const { lang }            = useLang()
  const [devices,   setDevices]   = useState<UnitDevice[]>([])
  const [loading,   setLoading]   = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDevices() {
      try {
        const res  = await fetch('/api/devices', { cache: 'no-store' })
        const json = await res.json()
        if (json.ok) {
          const nodes    = (json.data.devices   ?? []) as UnitDevice[]
          const gateways = (json.data.gateways  ?? []) as UnitDevice[]
          setDevices([...nodes, ...gateways])
        }
      } catch {}
      finally { setLoading(false) }
    }
    fetchDevices()
  }, [])

  function handleSelect(device: UnitDevice) {
    setSelecting(device.id)
    setTimeout(() => {
      setSelectedUnit(device)
      setSelecting(null)
    }, 400)
  }

  const T = {
    title:    { id: 'Pilih Unit',               en: 'Select Unit'               },
    subtitle: { id: 'Pilih perangkat yang ingin dipantau untuk memulai monitoring.', en: 'Select a device to start monitoring.' },
    loading:  { id: 'Memuat daftar perangkat...', en: 'Loading devices...'      },
    empty:    { id: 'Tidak ada perangkat terdaftar.', en: 'No devices registered.' },
    node:     { id: 'Node Sensor',              en: 'Sensor Node'               },
    gateway:  { id: 'Gateway',                  en: 'Gateway'                   },
    select:   { id: 'Pilih Unit Ini',           en: 'Select This Unit'          },
    selecting:{ id: 'Memilih...',               en: 'Selecting...'              },
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F7FF] px-4 py-12">

      {/* Branding */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2">
          <Image src="/FILTRAZON.png" alt="FILTRAZON" width={48} height={48} className="object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-[#1C2B3A]">{T.title[lang]}</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xs text-center leading-relaxed">
            {T.subtitle[lang]}
          </p>
        </div>
      </div>

      {/* Device list */}
      <div className="w-full max-w-sm space-y-3">
        {loading ? (
          <div className="card p-8 flex items-center justify-center gap-2 text-gray-400">
            <RefreshCw size={16} className="animate-spin text-[#0096C7]" />
            <span className="text-sm">{T.loading[lang]}</span>
          </div>
        ) : devices.length === 0 ? (
          <div className="card p-8 text-center text-sm text-gray-400">{T.empty[lang]}</div>
        ) : (
          devices.map(device => {
            const isNode       = device.type === 'node'
            const isSel        = selecting === device.id
            return (
              <button
                key={device.id}
                onClick={() => handleSelect(device)}
                disabled={!!selecting}
                className="w-full card p-4 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0096C7]"
                style={{ borderLeft: `4px solid ${isNode ? '#2196D3' : '#43A047'}` }}
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0"
                  style={{ background: isNode ? '#E3F2FD' : '#E8F5E9', color: isNode ? '#1565C0' : '#2E7D32' }}>
                  {isNode ? <Cpu size={22} /> : <RadioTower size={22} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-[#1C2B3A] truncate">{device.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{device.id}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                    style={{
                      background: isNode ? '#E3F2FD' : '#E8F5E9',
                      color:      isNode ? '#1565C0' : '#2E7D32',
                    }}>
                    {isNode ? <Cpu size={9} /> : <RadioTower size={9} />}
                    {isNode ? T.node[lang] : T.gateway[lang]}
                  </span>
                </div>

                {/* Action */}
                <div className="shrink-0 flex items-center gap-1 text-xs font-semibold"
                  style={{ color: isNode ? '#1565C0' : '#2E7D32' }}>
                  {isSel
                    ? <><RefreshCw size={14} className="animate-spin" /> {T.selecting[lang]}</>
                    : <><span className="hidden sm:inline">{T.select[lang]}</span><ChevronRight size={16} /></>
                  }
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Tip */}
      <p className="text-[11px] text-gray-400 mt-8 text-center flex items-center gap-1.5">
        <CheckCircle2 size={12} className="text-green-400" />
        {lang === 'id'
          ? 'Pilihan unit disimpan untuk sesi ini'
          : 'Unit selection is saved for this session'}
      </p>
    </div>
  )
}
