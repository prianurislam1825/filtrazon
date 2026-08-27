'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, MessageCircle } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

export default function LandingNav() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { lang, toggle }        = useLang()

  const NAV = [
    { label: { id: 'Tentang',       en: 'About'       }, href: '#tentang'    },
    { label: { id: 'Cara Kerja',    en: 'How It Works'}, href: '#cara-kerja' },
    { label: { id: 'Produk',        en: 'Product'     }, href: '#produk'     },
    { label: { id: 'Klien',         en: 'Clients'     }, href: '#klien'      },
    { label: { id: 'Tim',           en: 'Team'        }, href: '#tim'        },
  ]

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const textCls = scrolled ? 'text-gray-600 hover:text-[#0077B6]' : 'text-white/80 hover:text-white'

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/96 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="FILTRAZON">
          <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-white/20 flex items-center justify-center p-1">
            <Image src="/FILTRAZON.png" alt="FILTRAZON" width={28} height={28}
              className="object-contain w-full h-full" priority />
          </div>
          <span className={`font-black text-base tracking-wide hidden sm:block ${scrolled ? 'text-[#0077B6]' : 'text-white'}`}>
            FILTRAZON
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main">
          {NAV.map(l => (
            <a key={l.href} href={l.href} className={`text-sm font-medium transition-colors ${textCls}`}>
              {l.label[lang]}
            </a>
          ))}
        </nav>

        {/* Right: lang + CTA */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* Language toggle */}
          <button onClick={toggle}
            aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors ${
              scrolled ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-white/25 text-white hover:bg-white/10'
            }`}>
            <span className="text-sm">{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            <span>{lang === 'id' ? 'ID' : 'EN'}</span>
          </button>

          <Link href="/login"
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              scrolled ? 'text-[#0077B6] hover:bg-blue-50' : 'text-white/80 hover:text-white'
            }`}>
            Login
          </Link>

          <a href="https://wa.me/6281226615585" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold bg-[#D4A017] text-white hover:bg-[#A87C10] transition-colors shadow-sm">
            <MessageCircle size={14} />
            {lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}
          </a>
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle language"
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-bold ${
              scrolled ? 'border-gray-200 text-gray-600' : 'border-white/25 text-white'
            }`}>
            <span className="text-sm">{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
          </button>
          <button onClick={() => setOpen(o => !o)} aria-label="Menu"
            className={`p-2 rounded-lg ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                {l.label[lang]}
              </a>
            ))}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <Link href="/login" onClick={() => setOpen(false)}
                className="flex-1 text-center py-3 rounded-xl text-sm font-semibold border border-[#0077B6] text-[#0077B6] hover:bg-blue-50">
                Login
              </Link>
              <a href="https://wa.me/6281226615585" target="_blank" rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold bg-[#D4A017] text-white hover:bg-[#A87C10]">
                <MessageCircle size={14} />
                {lang === 'id' ? 'Hubungi' : 'Contact'}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
