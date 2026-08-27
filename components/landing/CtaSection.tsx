'use client'

import Image from 'next/image'
import { MessageCircle, Mail } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

export default function CtaSection() {
  const { lang } = useLang()

  const T = {
    label:   { id: 'Tertarik?',              en: 'Interested?'              },
    h1:      { id: 'Mau Tau Lebih Lanjut?',  en: 'Want to Know More?'       },
    desc:    {
      id: 'Kami siap membantu — baik untuk kemitraan, pembelian, maupun kolaborasi penelitian. Hubungi kami langsung lewat WhatsApp atau email.',
      en: 'We are ready to help — whether for partnership, purchase, or research collaboration. Contact us directly via WhatsApp or email.',
    },
    wa:    { id: 'Chat WhatsApp',   en: 'WhatsApp Chat'   },
    email: { id: 'Kirim Email',     en: 'Send Email'      },
    note:  { id: 'Respon cepat lewat WhatsApp', en: 'Quick response via WhatsApp' },
  }

  return (
    <section id="kolaborasi" className="py-20 relative overflow-hidden">
      {/* Simple blue gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg, #0077B6 0%, #0096C7 50%, #00B4D8 100%)',
      }} />
      <div className="absolute inset-0 bg-black/10" />

      {/* Gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: '#D4A017' }} aria-hidden="true" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center text-white">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2">
            <Image src="/FILTRAZON.png" alt="FILTRAZON" width={48} height={48} className="object-contain w-full h-full" />
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">{T.label[lang]}</p>
        <h2 className="text-3xl sm:text-4xl font-black mb-4">{T.h1[lang]}</h2>
        <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-10">
          {T.desc[lang]}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <a href="https://wa.me/6281226615585" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:scale-105 transition-all w-full sm:w-auto justify-center"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff' }}>
            <MessageCircle size={20} />
            {T.wa[lang]}
          </a>
          <a href="mailto:filtrazonofficial@gmail.com"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-white/15 border-2 border-white/30 text-white hover:bg-white/25 transition-colors w-full sm:w-auto justify-center">
            <Mail size={20} />
            {T.email[lang]}
          </a>
        </div>

        <p className="text-white/40 text-xs">{T.note[lang]}</p>
      </div>
    </section>
  )
}
