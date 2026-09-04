'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Mail, Instagram } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

export default function LandingFooter() {
  const { lang } = useLang()
  const year = new Date().getFullYear()

  const NAV = [
    { label: { id: 'Beranda',        en: 'Home'        }, href: '/'          },
    { label: { id: 'Tentang',        en: 'About'       }, href: '#tentang'   },
    { label: { id: 'Cara Kerjanya',  en: 'How It Works'}, href: '#cara-kerja'},
    { label: { id: 'Produk',         en: 'Product'     }, href: '#produk'    },
    { label: { id: 'Tim',            en: 'Team'        }, href: '#tim'       },
    { label: { id: 'Login Dashboard',en: 'Login'       }, href: '/login'     },
  ]

  return (
    <footer style={{ background: '#0D1F2D' }} className="text-white">

      {/* Tri-color top line */}
      <div className="h-1 flex">
        <div className="flex-1" style={{ background: '#D4A017' }} />
        <div className="flex-1" style={{ background: '#0096C7' }} />
        <div className="flex-1" style={{ background: '#43A047' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div className="sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                <Image src="/FILTRAZON.png" alt="FILTRAZON" width={28} height={28} className="object-contain w-full h-full" />
              </div>
              <div>
                <p className="font-black text-sm tracking-wide leading-none">FILTRAZON</p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">
                  {lang === 'id' ? 'Alat Filtrasi Air IoT' : 'IoT Water Filtration'}
                </p>
              </div>
            </Link>
            <p className="text-xs text-white/45 leading-relaxed mb-5">
              {lang === 'id'
                ? 'Alat penyaring air portabel bertenaga surya untuk membantu korban bencana mendapatkan air bersih yang aman.'
                : 'Solar-powered portable water purifier to help disaster victims access safe, clean water.'}
            </p>
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/35">
                {lang === 'id' ? 'Sistem Aktif' : 'System Active'}
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
              {lang === 'id' ? 'Halaman' : 'Pages'}
            </p>
            <ul className="space-y-2.5">
              {NAV.map((item, i) => (
                <li key={i}>
                  <Link href={item.href}
                    className="text-xs text-white/50 hover:text-white transition-colors">
                    {item.label[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
              {lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}
            </p>
            <div className="space-y-3">
              <a href="https://wa.me/6281226615585" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-white/50 hover:text-white transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <MessageCircle size={13} className="text-green-400" />
                </div>
                <span>WhatsApp</span>
              </a>
              <a href="mailto:filtrazonofficial@gmail.com"
                className="flex items-center gap-2.5 text-xs text-white/50 hover:text-white transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                  <Mail size={13} className="text-yellow-400" />
                </div>
                <span>filtrazonofficial@gmail.com</span>
              </a>
              <a href="https://www.instagram.com/filtrazon?igsi=aHdrN2J0aTN6N214" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-white/50 hover:text-white transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                  <Instagram size={13} className="text-pink-400" />
                </div>
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25 text-center sm:text-left">
            © {year} FILTRAZON ·{' '}
            {lang === 'id' ? 'Teknologi Air Bersih untuk Bencana' : 'Clean Water Technology for Disasters'}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#D4A017' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#0096C7' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#43A047' }} />
          </div>
        </div>
      </div>
    </footer>
  )
}
