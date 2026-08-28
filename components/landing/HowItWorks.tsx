'use client'

import { useLang } from '@/lib/i18n/context'

export default function HowItWorks() {
  const { lang } = useLang()

  const STEPS = [
    {
      emoji: '🌊',
      num: '1',
      title: { id: 'Air Kotor Masuk',          en: 'Dirty Water Goes In'         },
      desc:  { id: 'Air dari sungai, sumur, atau genangan dimasukkan ke dalam alat FILTRAZON.', en: 'Water from rivers, wells, or puddles is fed into the FILTRAZON device.' },
    },
    {
      emoji: '🔬',
      num: '2',
      title: { id: 'Disaring Berlapis',         en: 'Multi-layer Filtration'      },
      desc:  { id: 'Air melewati beberapa lapisan penyaring yang membuang kotoran, kuman, dan racun.', en: 'Water passes through multiple filter layers that remove dirt, bacteria, and toxins.' },
    },
    {
      emoji: '📡',
      num: '3',
      title: { id: 'Sensor Cek Keamanan',       en: 'Sensors Check Safety'        },
      desc:  { id: 'Sensor otomatis mengecek apakah air sudah benar-benar aman: tingkat keasaman, kejernihan, dan lainnya.', en: 'Sensors automatically check if water is truly safe: acidity, clarity, and more.' },
    },
    {
      emoji: '📱',
      num: '4',
      title: { id: 'Lihat di Ponsel',           en: 'See on Your Phone'           },
      desc:  { id: 'Hasil pemantauan langsung muncul di ponsel atau laptop petugas. Ada notifikasi jika ada masalah.', en: 'Monitoring results appear instantly on staff phones or laptops. Notifications are sent if there\'s an issue.' },
    },
  ]

  return (
    <section id="cara-kerja" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0096C7] mb-3">
            {lang === 'id' ? 'Cara Kerjanya' : 'How It Works'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1C2B3A]">
            {lang === 'id' ? 'Mudah Dipahami,\nMudah Dipakai' : 'Simple to Understand,\nSimple to Use'}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STEPS.map((s, i) => (
            <div key={i} className="relative text-center">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] right-0 h-0.5 bg-gray-200" />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-100 flex flex-col items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-[10px] font-black text-[#0096C7] mt-0.5">{lang === 'id' ? `Langkah ${s.num}` : `Step ${s.num}`}</span>
                </div>
                <h3 className="font-bold text-[#1C2B3A] text-sm mb-2">{s.title[lang]}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Result banner */}
        <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #E3F2FD, #E8F5E9)' }}>
          <p className="text-2xl mb-2">✅</p>
          <p className="font-bold text-[#1C2B3A] text-base mb-1">
            {lang === 'id' ? 'Hasilnya: Air Bersih & Aman' : 'Result: Clean & Safe Water'}
          </p>
          <p className="text-gray-500 text-sm">
            {lang === 'id'
              ? 'Air yang keluar dari FILTRAZON sudah melewati uji keamanan otomatis dan siap digunakan.'
              : 'Water that comes out of FILTRAZON has passed automatic safety checks and is ready to use.'}
          </p>
        </div>
      </div>
    </section>
  )
}
