'use client'

import { useEffect, useRef } from 'react'
import { useLang } from '@/lib/i18n/context'

const PARTNERS = [
  { name:'SMAN 1 Surakarta',        logo:'/logo-smansa.png',   label:{ id:'SMAN 1 Surakarta',            en:'SMAN 1 Surakarta'             }, dark:false },
  { name:'SMA Muhammadiyah PK',     logo:'/logo-smamuhpk.png', label:{ id:'SMA Muhammadiyah PK Surakarta',en:'SMA Muhammadiyah PK Surakarta'}, dark:false },
  { name:'SMA Negeri 4 Surakarta',  logo:'/logo-sma4.png',     label:{ id:'SMA Negeri 4 Surakarta',       en:'SMA Negeri 4 Surakarta'       }, dark:false },
  { name:'Solvia',                  logo:'/logo-solvia.png',   label:{ id:'Solvia',                       en:'Solvia'                       }, dark:true  },
]

// Scroll-reveal hook
function useRevealItems() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const items = container.querySelectorAll<HTMLElement>('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el   = entry.target as HTMLElement
            const delay = el.dataset.delay ?? '0'
            el.style.transitionDelay = `${delay}ms`
            el.classList.add('revealed')
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.15 },
    )
    items.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

export default function PartnersSection() {
  const { lang } = useLang()
  const ref      = useRevealItems()

  return (
    <>
      {/* Inline CSS for reveal animations */}
      <style>{`
        [data-reveal] {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        [data-reveal].revealed {
          opacity: 1;
          transform: translateY(0);
        }
        [data-reveal="scale"] {
          transform: scale(0.85) translateY(16px);
        }
        [data-reveal="scale"].revealed {
          transform: scale(1) translateY(0);
        }
      `}</style>

      <section
        id="klien"
        className="py-16 bg-white border-y border-gray-100"
        aria-label={lang === 'id' ? 'Klien dan Mitra' : 'Clients & Partners'}
      >
        <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Heading */}
          <div className="text-center mb-12" data-reveal="fade" data-delay="0">
            <p className="section-label text-[#43A047] mb-3">
              {lang === 'id' ? 'Klien & Mitra Kolaborasi' : 'Clients & Collaboration Partners'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C2B3A]">
              {lang === 'id' ? 'Dipercaya oleh ' : 'Trusted by '}
              <span className="text-[#2196D3]">
                {lang === 'id' ? '' : ''}
              </span>
            </h2>
          </div>

          {/* 4 logos — responsive grid, no marquee */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {PARTNERS.map((p, i) => (
              <div
                key={i}
                className="group flex flex-col items-center gap-3"
                data-reveal="scale"
                data-delay={String(i * 100)}
              >
                {/* Logo card */}
                <div
                  className="w-full aspect-square max-w-[130px] mx-auto rounded-2xl bg-white
                              border border-gray-100 shadow-sm
                              flex items-center justify-center p-3
                              group-hover:shadow-xl group-hover:-translate-y-2 group-hover:border-[#90CAF9]
                              transition-all duration-300 ease-out"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.logo}
                    alt={p.name}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'contain', display: 'block',
                      mixBlendMode: p.dark ? 'multiply' : 'normal',
                    }}
                  />
                </div>

                {/* Label */}
                <p className="text-[11px] font-semibold text-gray-500 text-center leading-tight">
                  {p.label[lang]}
                </p>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div className="text-center mt-10" data-reveal="fade" data-delay="400">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="block h-px w-12 bg-gray-200" />
              <span className="flex gap-1">
                {['#D4A017','#2196D3','#43A047'].map((c, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                ))}
              </span>
              <span className="block h-px w-12 bg-gray-200" />
            </div>
            <p className="text-xs text-gray-400">
              {lang === 'id'
                ? 'Bersama membangun solusi air bersih untuk ketahanan bencana Indonesia'
                : "Together building clean water solutions for Indonesia's disaster resilience"}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
