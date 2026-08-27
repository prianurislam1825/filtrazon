'use client'

import { useLang } from '@/lib/i18n/context'

export default function VisionMission() {
  const { lang } = useLang()

  const MISSIONS = [
    { id: 'Membantu korban bencana mendapat air bersih yang aman dengan cepat',              en: 'Help disaster victims access clean safe water quickly'                },
    { id: 'Memberi tahu petugas jika kualitas air bermasalah secara otomatis',               en: 'Automatically alert staff if water quality has issues'                 },
    { id: 'Tetap berfungsi meski tidak ada listrik atau sinyal internet',                    en: 'Keep working even without electricity or internet signal'              },
    { id: 'Menyimpan semua data untuk keperluan laporan dan evaluasi',                       en: 'Store all data for reporting and evaluation purposes'                  },
    { id: 'Membuat teknologi air bersih yang mudah digunakan siapa saja',                    en: 'Make clean water technology easy to use by anyone'                    },
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

          {/* Visi — dark blue card */}
          <div className="rounded-3xl p-8 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0077B6, #0096C7)' }}>
            <div className="absolute top-0 right-0 text-[120px] leading-none opacity-10 pointer-events-none" aria-hidden="true">
              💧
            </div>
            <div className="relative z-10">
              <p className="text-4xl mb-4">🌊</p>
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
                  ? 'Kami percaya setiap orang berhak mendapat air bersih yang aman — tidak peduli seberapa jauh lokasinya atau seberapa parah bencananya.'
                  : 'We believe everyone deserves safe clean water — no matter how remote the location or how severe the disaster.'}
              </p>
            </div>
          </div>

          {/* Misi */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-xs font-black uppercase tracking-widest text-[#43A047] mb-2">
              {lang === 'id' ? 'Misi' : 'Mission'}
            </p>
            <h3 className="text-xl font-black text-[#1C2B3A] leading-snug mb-5">
              {lang === 'id' ? 'Yang Kami Lakukan' : 'What We Do'}
            </h3>
            <ul className="space-y-3">
              {MISSIONS.map((m, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                  <span className="text-green-500 font-black text-base shrink-0 mt-0.5">✓</span>
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
