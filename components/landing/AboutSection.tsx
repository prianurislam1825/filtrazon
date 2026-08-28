'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Sun, Smartphone, Waves, Radio } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

function useReveal() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>('[data-anim]')
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const target = entry.target as HTMLElement
        const delay  = target.dataset.delay ?? '0'
        setTimeout(() => target.classList.add('anim-in'), Number(delay))
        io.unobserve(target)
      })
    }, { threshold: 0.12 })
    items.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

export default function AboutSection() {
  const { lang } = useLang()
  const ref      = useReveal()

  const T = {
    label: { id: 'Apa itu FILTRAZON?',            en: 'What is FILTRAZON?'                },
    h1:    { id: 'Alat Filtrasi Air',              en: 'Water Filtration Device'           },
    h2:    { id: 'yang Bisa Dipantau dari Ponsel', en: 'You Can Monitor from Your Phone'   },
    p1:    { id: 'FILTRAZON adalah alat penyaring air portabel yang dirancang khusus untuk membantu korban bencana mendapatkan air bersih yang aman.', en: 'FILTRAZON is a portable water purifier designed specifically to help disaster victims access safe, clean water.' },
    p2:    { id: 'Alat ini bisa menyaring air kotor menjadi air bersih, sekaligus memantau apakah airnya sudah benar-benar aman untuk diminum. Semua bisa dilihat langsung lewat ponsel atau laptop.', en: 'It filters dirty water into clean water, while monitoring whether the water is truly safe to drink. All visible directly from a phone or laptop.' },
    p3:    { id: 'Bisa dipakai di daerah tanpa listrik PLN karena menggunakan panel surya, dan tetap berfungsi meski tidak ada sinyal internet.', en: 'Works in areas without grid electricity thanks to solar panels, and still functions even without internet signal.' },
    cards: [
      { Icon: Sun,        color:'#D4A017', bg:'#FFFBEB', border:'#FDE68A', text:{ id:'Bertenaga surya',          en:'Solar powered'           } },
      { Icon: Smartphone, color:'#2196D3', bg:'#E3F2FD', border:'#90CAF9', text:{ id:'Pantau dari ponsel',       en:'Monitor from phone'      } },
      { Icon: Waves,      color:'#43A047', bg:'#E8F5E9', border:'#A5D6A7', text:{ id:'Proses air kotor jadi bersih', en:'Turns dirty water clean' } },
      { Icon: Radio,      color:'#9C27B0', bg:'#F3E5F5', border:'#CE93D8', text:{ id:'Tanpa internet sekalipun', en:'Works without internet'  } },
    ],
  }

  return (
    <>
      <style>{`
        [data-anim] { opacity:0; transition: opacity .65s ease-out, transform .65s ease-out; }
        [data-anim="left"]  { transform: translateX(-32px); }
        [data-anim="right"] { transform: translateX( 32px); }
        [data-anim="up"]    { transform: translateY( 28px); }
        [data-anim="scale"] { transform: scale(.88) translateY(16px); }
        [data-anim].anim-in { opacity:1; transform:none; }
      `}</style>

      <section id="tentang" className="py-20 bg-white" ref={ref as React.RefObject<HTMLElement>}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── LEFT: text ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#0096C7] mb-3"
                data-anim="left" data-delay="0">
                {T.label[lang]}
              </p>

              <h2 className="text-3xl sm:text-4xl font-black text-[#1C2B3A] leading-tight mb-6"
                data-anim="left" data-delay="80">
                {T.h1[lang]}
                <span className="block text-[#43A047]">{T.h2[lang]}</span>
              </h2>

              <div className="space-y-3 text-gray-600 text-sm leading-relaxed mb-8"
                data-anim="left" data-delay="160">
                <p>{T.p1[lang]}</p>
                <p>{T.p2[lang]}</p>
                <p>{T.p3[lang]}</p>
              </div>

              {/* Feature cards — stagger */}
              <div className="grid grid-cols-2 gap-3">
                {T.cards.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border
                               hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    style={{ background: c.bg, borderColor: c.border }}
                    data-anim="scale"
                    data-delay={String(240 + i * 80)}
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                      style={{ background: c.color + '20', color: c.color }}>
                      <c.Icon size={18} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{c.text[lang]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: visual ── */}
            <div className="flex items-center justify-center" data-anim="right" data-delay="100">
              <div className="relative">
                {/* Animated glow */}
                <div className="absolute inset-0 rounded-full blur-3xl opacity-25 animate-pulse"
                  style={{ background: 'radial-gradient(circle, #0096C7 40%, #43A047 80%)' }} />

                {/* Circle */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full
                                bg-gradient-to-br from-blue-50 to-cyan-50
                                border-2 border-blue-100 shadow-2xl
                                flex items-center justify-center
                                hover:scale-[1.02] transition-transform duration-500">

                  {/* Spinning orbit ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200/60"
                    style={{ animation:'spin 20s linear infinite' }} />

                  <Image
                    src="/FILTRAZON.png"
                    alt="FILTRAZON"
                    width={200}
                    height={200}
                    className="object-contain animate-float"
                  />
                </div>

                {/* Live bubble */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 text-center animate-float"
                  style={{ animationDelay:'0.4s', animationDuration:'3.5s' }}>
                  <div className="flex items-center gap-1.5 mb-1 justify-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-green-600 uppercase">Live</span>
                  </div>
                  <p className="text-xs font-bold text-gray-500">{lang === 'id' ? 'Air Aman' : 'Water Safe'}</p>
                  <p className="text-xl font-black text-[#0077B6]">pH 7.2</p>
                </div>

                {/* Processed bubble */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 text-center animate-float"
                  style={{ animationDelay:'0.8s', animationDuration:'4s' }}>
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    {lang === 'id' ? 'Sudah Diproses' : 'Processed'}
                  </p>
                  <p className="text-xl font-black text-[#43A047]">1,284 L</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
