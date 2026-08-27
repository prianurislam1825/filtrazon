'use client'

import Image from 'next/image'
import { PlayCircle, ChevronDown, Droplets, Gauge, Waves, Activity } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

// Sensor bubble data — floating around logo
const SENSOR_BUBBLES = [
  { icon: <Droplets size={12} />, label: 'pH', value: '7.2', color: '#42A5F5', top: '18%', left: '8%',  delay: '0s',    dur: '4s'   },
  { icon: <Gauge    size={12} />, label: 'TDS', value: '245 ppm', color: '#81C784', top: '65%', left: '5%',  delay: '0.8s',  dur: '5s'   },
  { icon: <Waves    size={12} />, label: 'Turb.', value: '82 NTU', color: '#FFD54F', top: '20%', right:'7%',  delay: '0.4s',  dur: '4.5s' },
  { icon: <Activity size={12} />, label: 'Flow', value: '2.8 L/min', color: '#F48FB1', top: '70%', right:'6%',  delay: '1.2s',  dur: '5.5s' },
]

export default function HeroSection() {
  const { lang } = useLang()

  const T = {
    badge:  { id: 'Teknologi Air Bersih untuk Bencana', en: 'Clean Water Technology for Disasters' },
    line1:  { id: 'Air Bersih',    en: 'Clean Water'  },
    line2:  { id: 'di Mana Saja', en: 'Anywhere'     },
    sub:    { id: 'Alat filtrasi air portabel yang bisa dipantau dari ponsel — bahkan di lokasi bencana tanpa sinyal internet.', en: 'A portable water filtration device you can monitor from your phone — even in disaster areas without internet.' },
    cta1:   { id: 'Hubungi Kami',          en: 'Contact Us'        },
    cta2:   { id: 'Pelajari Cara Kerjanya',en: 'See How It Works'  },
    scroll: { id: 'Scroll ke bawah',       en: 'Scroll down'       },
    live:   { id: 'Sistem Aktif',          en: 'System Active'     },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero">

      {/* ── Background gradient ── */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg, #004E92 0%, #0077B6 35%, #0096C7 65%, #00B4D8 100%)',
      }} />
      <div className="absolute inset-0 bg-black/10" />

      {/* ── Animated wave SVG at bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="animate-wave-x flex" style={{ width:'200%' }}>
          <svg viewBox="0 0 1440 80" className="w-1/2 shrink-0 fill-white/10" preserveAspectRatio="none">
            <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1350,20 1440,40 L1440,80 L0,80 Z" />
          </svg>
          <svg viewBox="0 0 1440 80" className="w-1/2 shrink-0 fill-white/10" preserveAspectRatio="none">
            <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1350,20 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
        <div className="animate-wave-x flex" style={{ width:'200%', animationDuration:'26s', animationDirection:'reverse', marginTop:'-48px' }}>
          <svg viewBox="0 0 1440 80" className="w-1/2 shrink-0 fill-white/7" preserveAspectRatio="none">
            <path d="M0,30 C200,70 400,10 600,50 C800,90 1000,10 1200,50 C1300,70 1380,30 1440,40 L1440,80 L0,80 Z" />
          </svg>
          <svg viewBox="0 0 1440 80" className="w-1/2 shrink-0 fill-white/7" preserveAspectRatio="none">
            <path d="M0,30 C200,70 400,10 600,50 C800,90 1000,10 1200,50 C1300,70 1380,30 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </div>

      {/* ── Gold glow top ── */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[220px] rounded-full blur-[90px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #D4A017 0%, transparent 70%)' }} aria-hidden="true" />

      {/* ── Animated rings behind logo ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        {[220, 320, 420].map((size, i) => (
          <div key={i}
            className="absolute rounded-full border border-white/8"
            style={{
              width: size, height: size,
              animation: `ping ${3 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }} />
        ))}
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[
          { s:5, t:'12%', l:'6%',  c:'rgba(212,160,23,0.6)',  d:'0s'  },
          { s:4, t:'72%', l:'8%',  c:'rgba(129,199,132,0.6)', d:'0.7s'},
          { s:6, t:'18%', r:'7%',  c:'rgba(66,165,245,0.5)',  d:'0.3s'},
          { s:7, t:'75%', r:'5%',  c:'rgba(212,160,23,0.45)', d:'1.1s'},
          { s:3, t:'45%', l:'3%',  c:'rgba(129,199,132,0.4)', d:'1.5s'},
          { s:4, t:'50%', r:'3%',  c:'rgba(66,165,245,0.45)', d:'2s'  },
          { s:5, t:'30%', l:'15%', c:'rgba(212,160,23,0.3)',  d:'0.9s'},
          { s:3, t:'62%', r:'14%', c:'rgba(129,199,132,0.35)',d:'1.8s'},
        ].map((p, i) => (
          <span key={i} className="absolute rounded-full animate-pulse"
            style={{ top:p.t, left:(p as {l?:string}).l, right:(p as {r?:string}).r,
              width:p.s, height:p.s, background:p.c, animationDelay:p.d }} />
        ))}
      </div>

      {/* ── Floating sensor bubbles ── */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block" aria-hidden="true">
        {SENSOR_BUBBLES.map((b, i) => (
          <div key={i}
            className="absolute animate-float"
            style={{
              top: b.top, left: (b as {left?:string}).left, right: (b as {right?:string}).right,
              animationDelay: b.delay, animationDuration: b.dur,
            }}>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm">
              <span style={{ color: b.color }}>{b.icon}</span>
              <div>
                <p className="text-[9px] text-white/60 leading-none">{b.label}</p>
                <p className="text-[11px] font-black text-white leading-none">{b.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-20 text-center text-white">

        {/* Badge — fade up */}
        <div className="animate-fade-up anim-delay-100">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F0C93A] animate-pulse shrink-0" />
            {T.badge[lang]}
          </div>
        </div>

        {/* Logo — scale in + glow */}
        <div className="flex justify-center mb-7 animate-scale-in anim-delay-200">
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute -inset-3 rounded-3xl opacity-60 animate-glow"
              style={{ background: 'conic-gradient(from 180deg, #D4A017, #2196D3, #43A047, #D4A017)', borderRadius:'1.5rem', filter:'blur(8px)' }} />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-3">
              <Image src="/FILTRAZON.png" alt="FILTRAZON" width={96} height={96}
                className="object-contain w-full h-full animate-float" priority />
            </div>
            {/* Live badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500 border-2 border-white shadow-md whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-wide">{T.live[lang]}</span>
            </div>
          </div>
        </div>

        {/* Title lines — staggered fade up */}
        <h1 className="font-black tracking-tight leading-tight mb-4">
          <span className="block text-5xl sm:text-6xl animate-fade-up anim-delay-300">
            {T.line1[lang]}
          </span>
          <span className="block text-5xl sm:text-6xl animate-fade-up anim-delay-400"
            style={{ color: '#F0C93A' }}>
            {T.line2[lang]}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto leading-relaxed mb-10 animate-fade-up anim-delay-500">
          {T.sub[lang]}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up anim-delay-600">
          <a href="https://wa.me/6281226615585" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,160,23,0.6)] active:scale-95"
            style={{ background: 'linear-gradient(135deg,#F0C93A,#D4A017)', color:'#1C2B3A' }}>
            <PlayCircle size={17} />
            {T.cta1[lang]}
          </a>
          <a href="#cara-kerja"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-all duration-200 hover:scale-105 active:scale-95">
            {T.cta2[lang]}
          </a>
        </div>

        {/* Mini stats row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-up anim-delay-700">
          {[
            { val: '12+',  label: { id:'Lokasi', en:'Locations'   }, color:'#F0C93A' },
            { val: '95%',  label: { id:'Efisiensi', en:'Efficiency'}, color:'#81C784' },
            { val: '720h', label: { id:'Operasi', en:'Operation'  }, color:'#90CAF9' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[11px] text-white/50 mt-0.5">{s.label[lang]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#stats" aria-label={T.scroll[lang]}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70 transition-colors animate-bounce">
        <ChevronDown size={28} />
      </a>
    </section>
  )
}
