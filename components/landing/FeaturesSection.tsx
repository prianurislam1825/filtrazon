'use client'

import { useLang } from '@/lib/i18n/context'

export default function FeaturesSection() {
  const { lang } = useLang()

  const FEATURES = [
    {
      emoji: '🌞',
      title: { id: 'Pakai Energi Surya',           en: 'Solar Powered'               },
      desc:  { id: 'Tidak butuh listrik PLN. Bisa dipakai di mana saja, termasuk daerah terpencil.', en: 'No need for grid power. Works anywhere, including remote areas.' },
    },
    {
      emoji: '💧',
      title: { id: 'Saring Air Kotor',              en: 'Filters Dirty Water'         },
      desc:  { id: 'Air kotor disaring melalui beberapa lapisan hingga bersih dan aman untuk diminum.', en: 'Dirty water is filtered through multiple layers until clean and safe to drink.' },
    },
    {
      emoji: '📱',
      title: { id: 'Pantau Lewat Ponsel',           en: 'Monitor via Phone'           },
      desc:  { id: 'Lihat kondisi air dan alat secara langsung dari ponsel atau komputer kapan saja.', en: 'See water and device conditions live from your phone or computer anytime.' },
    },
    {
      emoji: '🔔',
      title: { id: 'Notifikasi Otomatis',           en: 'Automatic Alerts'            },
      desc:  { id: 'Langsung dapat pemberitahuan jika air tidak aman atau ada masalah pada alat.', en: 'Get instant notifications if water is unsafe or there is a problem with the device.' },
    },
    {
      emoji: '📡',
      title: { id: 'Tanpa Internet Sekalipun',      en: 'Works Without Internet'      },
      desc:  { id: 'Menggunakan teknologi radio jarak jauh (LoRa) sehingga tetap terhubung meski tidak ada sinyal internet.', en: 'Uses long-range radio technology (LoRa) so it stays connected even without internet.' },
    },
    {
      emoji: '📊',
      title: { id: 'Simpan Data Otomatis',          en: 'Auto-saves Data'             },
      desc:  { id: 'Semua data kondisi air tersimpan otomatis dan bisa dilihat kembali kapan saja untuk laporan.', en: 'All water condition data is saved automatically and can be reviewed anytime for reports.' },
    },
  ]

  return (
    <section id="fitur" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0096C7] mb-3">
            {lang === 'id' ? 'Yang Bisa Dilakukan FILTRAZON' : 'What FILTRAZON Can Do'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1C2B3A]">
            {lang === 'id' ? 'Semua dalam Satu Alat' : 'All in One Device'}
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm">
            {lang === 'id'
              ? 'Tidak perlu peralatan banyak. FILTRAZON mengurus semuanya, dari menyaring air hingga memantau keamanannya.'
              : 'No need for multiple tools. FILTRAZON handles everything, from filtering water to monitoring its safety.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-[#1C2B3A] text-base mb-2">{f.title[lang]}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc[lang]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
