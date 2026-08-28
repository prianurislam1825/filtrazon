'use client'

import { Droplets, Target, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

export default function VisionMission() {
  const { lang } = useLang()

  const MISSIONS = [
    {
      id: 'Menyediakan filtrasi air portabel yang cepat dan aman di lokasi bencana.',
      en: 'Provide fast and safe portable water filtration at disaster sites.',
    },
    {
      id: 'Memanfaatkan energi surya untuk operasional mandiri di wilayah minim listrik.',
      en: 'Utilize solar energy for independent operation in areas with limited electricity.',
    },
    {
      id: 'Menghadirkan filtrasi dan monitoring pintar untuk menjamin kualitas air.',
      en: 'Deliver smart filtration and monitoring to ensure water quality.',
    },
    {
      id: 'Mendukung pemulihan pascabencana melalui akses air bersih yang berkelanjutan.',
      en: 'Support post-disaster recovery through sustainable access to clean water.',
    },
    {
      id: 'Mendorong inovasi praktis dan berkelanjutan yang berdampak luas bagi masyarakat.',
      en: 'Drive practical and sustainable innovation with broad societal impact.',
    },
  ]

  return (
    <section id="visi-misi" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#43A047] mb-3">
            {lang === 'id' ? 'Visi & Misi' : 'Vision & Mission'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1C2B3A]">
            {lang === 'id' ? 'Untuk Apa Kami Ada?' : 'Why Do We Exist?'}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Visi */}
          <div className="rounded-3xl p-8 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0077B6, #0096C7)' }}>
            <div className="absolute -top-6 -right-6 opacity-10 pointer-events-none" aria-hidden="true">
              <Droplets size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                <Droplets size={24} className="text-white" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">
                {lang === 'id' ? 'Visi' : 'Vision'}
              </p>
              <h3 className="text-xl font-black leading-snug mb-4">
                {lang === 'id'
                  ? 'Air Bersih untuk Semua, Kapan pun dan di Mana pun'
                  : 'Clean Water for Everyone, Anytime and Anywhere'}
              </h3>
              <p className="text-sm text-white/75 leading-relaxed">
                {lang === 'id'
                  ? 'Kami percaya setiap orang berhak mendapat air bersih yang aman, tidak peduli seberapa jauh lokasinya atau seberapa parah bencananya.'
                  : 'We believe everyone deserves safe clean water, no matter how remote the location or how severe the disaster.'}
              </p>
            </div>
          </div>

          {/* Misi */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-5">
              <Target size={24} className="text-[#43A047]" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-[#43A047] mb-2">
              {lang === 'id' ? 'Misi' : 'Mission'}
            </p>
            <h3 className="text-xl font-black text-[#1C2B3A] leading-snug mb-5">
              {lang === 'id' ? 'Yang Kami Lakukan' : 'What We Do'}
            </h3>
            <ul className="space-y-3">
              {MISSIONS.map((m, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                  {m[lang]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
