'use client'

import Image from 'next/image'
import { Instagram, MessageCircle, Mail, User } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

// ── Team data ─────────────────────────────────────────────────
const TEAM = [
  {
    name:     'Haikal Adz Dzaki',
    title:    'CEO',
    role:     { id: 'Chief Executive Officer', en: 'Chief Executive Officer' },
    desc:     {
      id: 'Memimpin visi dan strategi FILTRAZON secara keseluruhan, mengorkestrasi seluruh tim serta mengarahkan inovasi dari tahap konsep hingga implementasi lapangan nyata.',
      en: 'Leads the overall vision and strategy of FILTRAZON, orchestrating the entire team and driving innovation from concept to real-world field implementation.',
    },
    photo:    '/team/haikal.jpg',
    leader:   true,
    color:    '#D4A017',
    wa:       'https://wa.me/6281226615585',
    ig:       'https://www.instagram.com/haikaladzdzaki.28',
    email:    'helixxjust@gmail.com',
  },
  {
    name:     'Kania Prima Anjani Raras',
    title:    'CRO',
    role:     { id: 'Chief Research Officer', en: 'Chief Research Officer' },
    desc:     {
      id: 'Memimpin riset dan inovasi teknologi FILTRAZON, mengeksplorasi solusi mutakhir untuk meningkatkan filtrasi dan solusi yang dibutuhkan bagi korban bencana.',
      en: 'Leads research and technology innovation at FILTRAZON, exploring cutting-edge solutions to improve filtration for disaster victims.',
    },
    photo:    '/team/kania.jpg',
    leader:   false,
    color:    '#2196D3',
    wa:       'https://wa.me/6281297011820',
    ig:       'https://www.instagram.com/kanieeah_',
    email:    'miakania1911@gmail.com',
  },
  {
    name:     'Elfira Soerakarta',
    title:    'CMO',
    role:     { id: 'Chief Marketing Officer', en: 'Chief Marketing Officer' },
    desc:     {
      id: 'Merancang dan mengeksekusi strategi pemasaran FILTRAZON, membangun brand awareness dan jejaring kolaborasi, serta memperluas jangkauan pasar secara nasional.',
      en: 'Designs and executes marketing strategy, builds brand awareness and collaboration networks, and expands national market reach.',
    },
    photo:    '/team/elfira.jpg',
    leader:   false,
    color:    '#43A047',
    wa:       'https://wa.me/628122988261',
    ig:       'https://www.instagram.com/cathrapire',
    email:    'xel.fira@gmail.com',
  },
  {
    name:     'Aisyah Rasyiiqa Wiyoto',
    title:    'CPO',
    role:     { id: 'Chief Product Officer', en: 'Chief Product Officer' },
    desc:     {
      id: 'Bertanggung jawab atas pengembangan produk secara end-to-end, memastikan FILTRAZON memenuhi standar kualitas lingkungan dan kebutuhan pengguna.',
      en: 'Responsible for end-to-end product development, ensuring FILTRAZON meets environmental quality standards and user needs.',
    },
    photo:    '/team/aisyah.jpg',
    leader:   false,
    color:    '#D4A017',
    wa:       'https://wa.me/6282324765512',
    ig:       'https://www.instagram.com/aiss.rsyq',
    email:    'aisyahrasyiqaa@gmail.com',
  },
  {
    name:     'Muhammad Fattah Yogatama',
    title:    'CTO',
    role:     { id: 'Chief Technology Officer', en: 'Chief Technology Officer' },
    desc:     {
      id: 'Memimpin pengembangan teknologi dan infrastruktur digital, termasuk sistem kontrol berbasis IoT serta arsitektur perangkat lunak FILTRAZON.',
      en: 'Leads technology development and digital infrastructure, including IoT-based control systems and FILTRAZON software architecture.',
    },
    photo:    '/team/fattah.jpg',
    leader:   false,
    color:    '#2196D3',
    wa:       'https://wa.me/6281326354819',
    ig:       'https://www.instagram.com/fattah.9393',
    email:    'fattahyogatama@gmail.com',
  },
]

// ── Photo cover with fallback ───────────────────────────────────
function PhotoCover({
  photo, name, color, height = 240,
}: {
  photo: string | null; name: string; color: string; height?: number
}) {
  if (photo) {
    return (
      <div className="w-full overflow-hidden" style={{ height }}>
        <Image
          src={photo}
          alt={name}
          width={400}
          height={height}
          className="w-full h-full object-cover object-top"
        />
      </div>
    )
  }
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ height, background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)` }}
    >
      <User size={64} style={{ color, opacity: 0.5 }} />
    </div>
  )
}

// ── Social links ───────────────────────────────────────────────
function SocialLinks({ wa, ig, email }: { wa: string; ig: string; email: string }) {
  return (
    <div className="flex items-center gap-2">
      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
        className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors">
        <MessageCircle size={15} />
      </a>
      <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
        className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-100 transition-colors">
        <Instagram size={15} />
      </a>
      <a href={`mailto:${email}`} aria-label="Email"
        className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
        <Mail size={15} />
      </a>
    </div>
  )
}

// ── Main section ───────────────────────────────────────────────
export default function TeamSection() {
  const { lang } = useLang()
  const [leader, ...members] = TEAM

  return (
    <section id="tim" className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A017] mb-3">
            {lang === 'id' ? 'Tim Kami' : 'Our Team'}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1C2B3A] leading-tight">
            {lang === 'id' ? 'Orang-orang di Balik FILTRAZON' : 'The People Behind FILTRAZON'}
          </h2>
          <p className="mt-3 text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            {lang === 'id'
              ? 'Tim muda yang berdedikasi menghadirkan solusi air bersih berbasis teknologi untuk masyarakat terdampak bencana.'
              : 'A dedicated young team delivering technology-based clean water solutions for disaster-affected communities.'}
          </p>
        </div>

        {/* ── Leader card — full-width hero style ── */}
        <div className="flex justify-center mb-8">
          <div
            className="bg-white rounded-3xl shadow-lg overflow-hidden w-full max-w-xs hover:shadow-xl transition-shadow border"
            style={{ borderColor: `${leader.color}30`, borderTop: `4px solid ${leader.color}` }}
          >
            {/* Big photo */}
            <div className="relative">
              <PhotoCover photo={leader.photo} name={leader.name} color={leader.color} height={300} />
              {/* Leader badge */}
              <span
                className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-sm"
                style={{ background: `${leader.color}ee`, color: '#fff', borderColor: `${leader.color}` }}
              >
                {leader.title} · {lang === 'id' ? 'Ketua Tim' : 'Team Leader'}
              </span>
              {/* Online dot */}
              <span className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            {/* Info */}
            <div className="p-5">
              <h3 className="font-black text-[#1C2B3A] text-lg leading-tight">
                {leader.name}
              </h3>
              <p className="text-xs font-semibold mt-0.5 mb-2" style={{ color: leader.color }}>
                {leader.role[lang]}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                {leader.desc[lang]}
              </p>
              <SocialLinks wa={leader.wa} ig={leader.ig} email={leader.email} />
            </div>
          </div>
        </div>

        {/* ── Members grid — 2-col mobile, 4-col desktop ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((m, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all border"
              style={{ borderColor: `${m.color}20`, borderTop: `3px solid ${m.color}` }}
            >
              {/* Big photo */}
              <PhotoCover photo={m.photo} name={m.name} color={m.color} height={200} />

              {/* Info */}
              <div className="p-4">
                <span
                  className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mb-2"
                  style={{ background: `${m.color}15`, color: m.color, borderColor: `${m.color}40` }}
                >
                  {m.title}
                </span>
                <h4 className="font-black text-[#1C2B3A] text-sm leading-tight">{m.name}</h4>
                <p className="text-[11px] font-semibold mt-0.5 mb-2" style={{ color: m.color }}>
                  {m.role[lang]}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">
                  {m.desc[lang]}
                </p>
                <SocialLinks wa={m.wa} ig={m.ig} email={m.email} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
