'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Droplets, Gauge, Clock } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

// Animated counter
function Counter({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [n, setN]     = useState(0)
  const started       = useRef(false)

  useEffect(() => {
    if (!active || started.current) return
    started.current = true
    const steps = 60, ms = 1800 / steps, inc = target / steps
    let cur = 0
    const t = setInterval(() => {
      cur += inc
      if (cur >= target) { setN(target); clearInterval(t) }
      else setN(Math.floor(cur))
    }, ms)
    return () => clearInterval(t)
  }, [active, target])

  return <span className="tabular-nums">{n >= 1000 ? n.toLocaleString('id-ID') : n}{suffix}</span>
}

export default function StatsSection() {
  const { lang }    = useLang()
  const ref         = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setActive(true); io.disconnect() }
    }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const STATS = [
    { Icon: MapPin,   target: 12,    suffix: '+',    color: '#D4A017', bg: '#FFFBEB', label: { id: 'Lokasi sudah dilayani',  en: 'Locations served'         }, sub: { id: 'Di berbagai wilayah', en: 'Across regions' } },
    { Icon: Droplets, target: 85420, suffix: ' L',   color: '#2196D3', bg: '#E3F2FD', label: { id: 'Liter air dibersihkan',  en: 'Liters of water cleaned'  }, sub: { id: 'Air layak minum',     en: 'Safe drinking'  } },
    { Icon: Gauge,    target: 95,    suffix: '%',    color: '#43A047', bg: '#E8F5E9', label: { id: 'Efektivitas filtrasi',   en: 'Filtration effectiveness' }, sub: { id: 'Uji lapangan',        en: 'Field tested'   } },
    { Icon: Clock,    target: 720,   suffix: '+',    color: '#D4A017', bg: '#FFFBEB', label: { id: 'Jam beroperasi',         en: 'Hours of operation'       }, sub: { id: 'Total waktu aktif',   en: 'Total active'   } },
  ]

  return (
    <section id="stats" className="py-14 bg-white border-b border-gray-100 overflow-hidden"
      ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="text-center transition-all duration-700 ease-out"
              style={{
                opacity:   active ? 1 : 0,
                transform: active ? 'translateY(0)' : 'translateY(32px)',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {/* Icon with bounce-in */}
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4 shadow-sm transition-all duration-700"
                style={{
                  background:       s.bg,
                  color:            s.color,
                  transform:        active ? 'scale(1)' : 'scale(0.7)',
                  transitionDelay:  `${i * 100 + 150}ms`,
                  opacity:          active ? 1 : 0,
                }}
              >
                <s.Icon size={26} />
              </div>

              {/* Counter */}
              <div className="text-4xl font-black mb-1" style={{ color: s.color }}>
                <Counter target={s.target} suffix={s.suffix} active={active} />
              </div>

              <p className="text-sm font-semibold text-gray-700">{s.label[lang]}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub[lang]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
