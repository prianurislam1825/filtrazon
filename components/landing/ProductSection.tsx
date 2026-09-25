'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, MessageCircle, Sun, Smartphone, WifiOff, Bell, BarChart2, FileText, HelpCircle, ChevronLeft, ChevronRight, Tag } from 'lucide-react'
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
        const t     = entry.target as HTMLElement
        const delay = Number(t.dataset.delay ?? 0)
        setTimeout(() => t.classList.add('anim-in'), delay)
        io.unobserve(t)
      })
    }, { threshold: 0.1 })
    items.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])
  return ref
}

// Map tiap fitur ke icon Lucide
const FEATURE_ICONS = [
  CheckCircle2, Smartphone, Sun, WifiOff,
  Bell, BarChart2, FileText, HelpCircle,
]

// Slide images for the product carousel
const SLIDES = [
  {
    src: '/ProdukAsli.jpg',
    alt: 'FILTRAZON - Box Terbuka',
    caption: { id: 'Sistem Filter Aktif', en: 'Active Filter System' },
  },
  {
    src: '/ProdukTertutup.jpg',
    alt: 'FILTRAZON - Box Tertutup',
    caption: { id: 'Mode Portabel', en: 'Portable Mode' },
  },
]

export default function ProductSection() {
  const { lang } = useLang()
  const ref      = useReveal()
  const [slide, setSlide] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-slide every 4 seconds
  useEffect(() => {
    function next() {
      setFading(true)
      setTimeout(() => {
        setSlide(s => (s + 1) % SLIDES.length)
        setFading(false)
      }, 350)
    }
    timerRef.current = setInterval(next, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function goTo(idx: number) {
    if (idx === slide) return
    if (timerRef.current) clearInterval(timerRef.current)
    setFading(true)
    setTimeout(() => {
      setSlide(idx)
      setFading(false)
      // Restart auto-slide
      timerRef.current = setInterval(() => {
        setFading(true)
        setTimeout(() => {
          setSlide(s => (s + 1) % SLIDES.length)
          setFading(false)
        }, 350)
      }, 4000)
    }, 350)
  }

  const T = {
    label:   { id: 'Produk Kami',             en: 'Our Product'        },
    h1:      { id: 'FILTRAZON Water System',  en: 'FILTRAZON Water System' },
    sub:     { id: 'Portable · Tenaga Surya · Pantau Jarak Jauh', en: 'Portable · Solar Powered · Remote Monitoring' },
    desc:    {
      id: 'Satu alat lengkap untuk menyaring air dan memastikan keamanannya. Bisa dibawa ke mana saja, dipakai di daerah tanpa listrik, dan dipantau dari ponsel.',
      en: 'One complete device to filter water and ensure its safety. Portable, works without grid power, and monitored from your phone.',
    },
    included: [
      { id: 'Saring air kotor jadi bersih',     en: 'Filters dirty water clean'     },
      { id: 'Pantau kondisi air dari ponsel',    en: 'Monitor water from phone'       },
      { id: 'Nyala pakai panel surya',           en: 'Powered by solar panel'         },
      { id: 'Tetap jalan tanpa internet',        en: 'Works without internet'         },
      { id: 'Kirim notifikasi jika ada masalah', en: 'Sends alert if problem occurs'  },
      { id: 'Simpan data otomatis',              en: 'Saves data automatically'       },
      { id: 'Bisa laporan CSV',                  en: 'CSV report export'              },
      { id: 'Setup & panduan gratis',            en: 'Free setup & guide'             },
    ],
    cloudLabel: { id: 'Mode Online',  en: 'Online Mode'  },
    cloudDesc:  { id: 'Pantau dari mana saja lewat internet', en: 'Monitor from anywhere via internet' },
    localLabel: { id: 'Mode Offline', en: 'Offline Mode' },
    localDesc:  { id: 'Tetap berfungsi tanpa internet sama sekali', en: 'Works fully without any internet' },
    order:   { id: 'Pesan Sekarang', en: 'Order Now'    },
    phLabel: { id: 'pH Air',         en: 'Water pH'     },
    safe:    { id: 'Aman',           en: 'Safe'         },
    liters:  { id: 'Sudah Diproses', en: 'Processed'    },
    priceOri:{ id: 'Harga Normal',   en: 'Regular Price' },
    priceNow:{ id: 'Harga Spesial',  en: 'Special Price' },
    perUnit: { id: '/unit',          en: '/unit'         },
    discount:{ id: 'Hemat 11%',      en: 'Save 11%'      },
  }

  return (
    <>
      <style>{`
        [data-anim] {
          opacity: 0;
          transition: opacity .6s ease-out, transform .6s ease-out;
        }
        [data-anim="up"]    { transform: translateY(28px); }
        [data-anim="left"]  { transform: translateX(-28px); }
        [data-anim="right"] { transform: translateX(28px); }
        [data-anim="scale"] { transform: scale(0.88) translateY(16px); }
        [data-anim].anim-in { opacity: 1; transform: none; }

        /* CTA pulse ring */
        @keyframes cta-ring {
          0%   { box-shadow: 0 0 0 0   rgba(37,211,102,0.5); }
          70%  { box-shadow: 0 0 0 12px rgba(37,211,102,0);   }
          100% { box-shadow: 0 0 0 0   rgba(37,211,102,0);   }
        }
        .cta-pulse { animation: cta-ring 2s ease-out infinite; }

        /* Floating sensor card */
        @keyframes float-alt {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-10px); }
        }
        .float-a { animation: float-alt 3.5s ease-in-out infinite; }
        .float-b { animation: float-alt 4s   ease-in-out infinite; animation-delay:.8s; }

        /* Carousel gradient border */
        .product-card-border {
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #0096C7, #43A047, #1268A5) border-box;
          border: 3px solid transparent;
        }

        /* Price badge wobble */
        @keyframes badge-in {
          0%   { transform: rotate(-8deg) scale(0.8); opacity: 0; }
          60%  { transform: rotate(4deg)  scale(1.08); opacity: 1; }
          100% { transform: rotate(-4deg) scale(1); opacity: 1; }
        }
        .price-badge { animation: badge-in 0.6s ease-out both; animation-delay: 0.8s; }

        /* Starburst */
        .starburst {
          clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
        }

        /* Slide fade */
        .slide-fade {
          transition: opacity 0.35s ease;
        }
        .slide-fade.fading {
          opacity: 0;
        }
      `}</style>

      <section id="produk" className="py-20 bg-white" ref={ref as React.RefObject<HTMLElement>}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Heading */}
          <div className="text-center mb-14" data-anim="up" data-delay="0">
            <p className="text-xs font-bold uppercase tracking-widest text-[#43A047] mb-3">
              {T.label[lang]}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1C2B3A]">{T.h1[lang]}</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── LEFT: image carousel ── */}
            <div className="relative flex items-center justify-center order-2 lg:order-1"
              data-anim="left" data-delay="80">

              {/* Glow background */}
              <div className="absolute inset-0 rounded-3xl blur-3xl opacity-15 pointer-events-none"
                style={{ background:'radial-gradient(circle, #0096C7 30%, #43A047 70%)' }} />

              {/* Main card with gradient border */}
              <div className="relative w-full max-w-sm product-card-border rounded-3xl shadow-2xl bg-white flex flex-col items-center justify-center p-6 hover:scale-[1.02] transition-transform duration-500 overflow-visible">

                {/* Spinning dashed ring */}
                <div className="absolute inset-6 rounded-full border-2 border-dashed border-blue-200/50 pointer-events-none"
                  style={{ animation:'spin 25s linear infinite' }} />

                {/* Image slide */}
                <div className={`slide-fade w-full aspect-square flex items-center justify-center ${fading ? 'fading' : ''}`}>
                  <Image
                    src={SLIDES[slide].src}
                    alt={SLIDES[slide].alt}
                    width={400}
                    height={400}
                    className="object-contain w-full h-full rounded-2xl drop-shadow-xl"
                  />
                </div>

                {/* Slide caption */}
                <p className="text-[11px] font-semibold text-gray-400 mt-2 tracking-wide">
                  {SLIDES[slide].caption[lang]}
                </p>

                {/* Dot indicators */}
                <div className="flex gap-2 mt-3">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        slide === i
                          ? 'bg-[#1268A5] w-5'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Prev / Next arrows */}
                <button
                  onClick={() => goTo((slide - 1 + SLIDES.length) % SLIDES.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow flex items-center justify-center text-gray-500 hover:text-[#1268A5] hover:border-[#1268A5] transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => goTo((slide + 1) % SLIDES.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow flex items-center justify-center text-gray-500 hover:text-[#1268A5] hover:border-[#1268A5] transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight size={15} />
                </button>

                {/* ── PRICE BADGE (starburst) ── */}
                <div className="price-badge absolute -top-5 -right-5 z-20">
                  {/* Outer starburst */}
                  <div
                    className="starburst w-[110px] h-[110px] flex flex-col items-center justify-center shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #F5A623, #E8820C)' }}
                  >
                    {/* Crossed-out original price */}
                    <span className="text-[11px] font-bold text-red-200 line-through leading-none">
                      $840 USD
                    </span>
                    {/* New price */}
                    <span className="text-[20px] font-black text-white leading-tight">
                      $750
                    </span>
                    <span className="text-[11px] font-bold text-yellow-100 leading-none">
                      USD{T.perUnit[lang]}
                    </span>
                  </div>
                  {/* Discount ribbon */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md flex items-center gap-1">
                    <Tag size={8} />
                    {T.discount[lang]}
                  </div>
                </div>
              </div>

              {/* Floating sensor card — pH */}
              <div className="absolute -right-2 sm:-right-6 top-1/4 bg-white rounded-2xl shadow-xl border border-blue-100 p-3 text-center float-a">
                <p className="text-[10px] text-gray-400 font-medium mb-0.5">{T.phLabel[lang]}</p>
                <p className="font-black text-[#0077B6] text-xl leading-none">7.2</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full mt-1">
                  <CheckCircle2 size={9} />
                  {T.safe[lang]}
                </span>
              </div>

              {/* Floating sensor card — liters */}
              <div className="absolute -left-2 sm:-left-6 bottom-1/4 bg-white rounded-2xl shadow-xl border border-green-100 p-3 text-center float-b">
                <p className="text-[10px] text-gray-400 font-medium mb-0.5">{T.liters[lang]}</p>
                <p className="font-black text-[#43A047] text-xl leading-none">1,284 L</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] text-green-600 font-bold">LIVE</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: info ── */}
            <div className="order-1 lg:order-2">

              {/* Tagline + desc */}
              <div data-anim="right" data-delay="0">
                <p className="font-bold text-[#D4A017] text-sm mb-1">{T.sub[lang]}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{T.desc[lang]}</p>
              </div>

              {/* Feature list — stagger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7">
                {T.included.map((item, i) => {
                  const Icon = FEATURE_ICONS[i] ?? CheckCircle2
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 text-sm text-gray-700
                                 p-2.5 rounded-xl border border-gray-100 bg-gray-50/60
                                 hover:bg-white hover:border-green-200 hover:shadow-sm
                                 transition-all duration-200"
                      data-anim="scale"
                      data-delay={String(80 + i * 50)}
                    >
                      <Icon size={15} className="shrink-0 text-[#43A047]" />
                      {item[lang]}
                    </div>
                  )
                })}
              </div>

              {/* Mode badges */}
              <div className="grid grid-cols-2 gap-3 mb-7" data-anim="right" data-delay="520">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center
                                hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-sm font-black text-[#0077B6]">{T.cloudLabel[lang]}</p>
                  </div>
                  <p className="text-xs text-gray-500">{T.cloudDesc[lang]}</p>
                </div>
                <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-center
                                hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <WifiOff size={13} className="text-[#43A047]" />
                    <p className="text-sm font-black text-[#43A047]">{T.localLabel[lang]}</p>
                  </div>
                  <p className="text-xs text-gray-500">{T.localDesc[lang]}</p>
                </div>
              </div>

              {/* CTA — pulse ring */}
              <div data-anim="up" data-delay="600">
                <a
                  href="https://wa.me/6281226615585"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white
                             shadow-lg hover:opacity-90 hover:scale-105 active:scale-95
                             transition-all duration-200 cta-pulse"
                  style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}
                >
                  <MessageCircle size={17} />
                  {T.order[lang]}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
