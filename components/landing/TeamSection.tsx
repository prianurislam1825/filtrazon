'use client'

import Image from 'next/image'
import { Instagram, MessageCircle, Mail } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

// ── Team data ─────────────────────────────────────────────────
const TEAM = [
  {
    name:   'Haikal Adz Dzaki',
    title:  'CEO',
    role:   { id: 'Chief Executive Officer', en: 'Chief Executive Officer' },
    desc:   {
      id: 'Memimpin visi dan strategi FILTRAZON secara keseluruhan, mengorkestrasi seluruh tim serta mengarahkan inovasi dari tahap konsep hingga implementasi lapangan nyata.',
      en: 'Leads the overall vision and strategy of FILTRAZON, orchestrating the entire team and driving innovation from concept to real-world field implementation.',
    },
    photo:  '/team/haikal.jpg',
    leader: true,
    color:  '#D4A017',
    wa:     'https://wa.me/6281226615585',
    ig:     'https://www.instagram.com/haikaladzdzaki.28',
    email:  'helixxjust@gmail.com',
  },
  {
    name:   'Kania Prima Anjani Raras',
    title:  'CRO',
    role:   { id: 'Chief Research Officer', en: 'Chief Research Officer' },
    desc:   {
      id: 'Memimpin riset dan inovasi teknologi FILTRAZON, mengeksplorasi solusi mutakhir untuk meningkatkan filtrasi dan solusi yang dibutuhkan bagi korban bencana.',
      en: 'Leads research and technology innovation at FILTRAZON, exploring cutting-edge solutions to improve filtration for disaster victims.',
    },
    photo:  '/team/kania.jpg',
    leader: false,
    color:  '#2196D3',
    wa:     'https://wa.me/6281297011820',
    ig:     'https://www.instagram.com/kanieeah_',
    email:  'miakania1911@gmail.com',
  },
  {
    name:   'Elfira Soerakarta',
    title:  'CMO',
    role:   { id: 'Chief Marketing Officer', en: 'Chief Marketing Officer' },
    desc:   {
      id: 'Merancang dan mengeksekusi strategi pemasaran FILTRAZON, membangun brand awareness dan jejaring kolaborasi, serta memperluas jangkauan pasar secara nasional.',
      en: 'Designs and executes marketing strategy, builds brand awareness and collaboration networks, and expands national market reach.',
    },
    photo:  '/team/elfira.jpg',
    leader: false,
    color:  '#43A047',
    wa:     'https://wa.me/628122988261',
    ig:     'https://www.instagram.com/cathrapire',
    email:  'xel.fira@gmail.com',
  },
  {
    name:   'Aisyah Rasyiiqa Wiyoto',
    title:  'CPO',
    role:   { id: 'Chief Product Officer', en: 'Chief Product Officer' },
    desc:   {
      id: 'Bertanggung jawab atas pengembangan produk secara end-to-end, memastikan FILTRAZON memenuhi standar kualitas lingkungan dan kebutuhan pengguna.',
      en: 'Responsible for end-to-end product development, ensuring FILTRAZON meets environmental quality standards and user needs.',
    },
    photo:  '/team/aisyah.jpg',
    leader: false,
    color:  '#D4A017',
    wa:     'https://wa.me/6282324765512',
    ig:     'https://www.instagram.com/aiss.rsyq',
    email:  'aisyahrasyiqaa@gmail.com',
  },
  {
    name:   'Muhammad Fattah Yogatama',
    title:  'CTO',
    role:   { id: 'Chief Technology Officer', en: 'Chief Technology Officer' },
    desc:   {
      id: 'Memimpin pengembangan teknologi dan infrastruktur digital, termasuk sistem kontrol berbasis IoT serta arsitektur perangkat lunak FILTRAZON.',
      en: 'Leads technology development and digital infrastructure, including IoT-based control systems and FILTRAZON software architecture.',
    },
    photo:  '/team/fattah.jpg',
    leader: false,
    color:  '#2196D3',
    wa:     'https://wa.me/6281326354819',
    ig:     'https://www.instagram.com/fattah.9393',
    email:  'fattahyogatama@gmail.com',
  },
]

type Member = typeof TEAM[number]

// ── Social links ───────────────────────────────────────────────
function SocialLinks({ wa, ig, email }: { wa: string; ig: string; email: string }) {
  return (
    <div className="flex items-center gap-2">
      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
        className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors">
        <MessageCircle size={14} />
      </a>
      <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
        className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors">
        <Instagram size={14} />
      </a>
      <a href={`mailto:${email}`} aria-label="Email"
        className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors">
        <Mail size={14} />
      </a>
    </div>
  )
}

// ── Photo Card (foto = background, info overlay bawah) ─────────
function PhotoCard({
  member, lang, large = false,
}: {
  member: Member; lang: 'id' | 'en'; large?: boolean
}) {
  const { name, title, role, photo, color, wa, ig, email, leader } = member
  const height = large ? 'h-[480px]' : 'h-[380px]'

  return (
    <div className={`relative w-full ${height} rounded-3xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-300`}>

      {/* Photo — fills entire card */}
      {photo ? (
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${color}30, ${color}60)` }}
        />
      )}

      {/* Top badge */}
      <div className="absolute top-3 left-3 z-10">
        <span
          className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: color, color: '#fff' }}
        >
          {title}{leader ? ` · ${lang === 'id' ? 'Ketua Tim' : 'Leader'}` : ''}
        </span>
      </div>

      {/* Gradient overlay — bottom half */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.7) 35%, rgba(15,23,42,0.1) 60%, transparent 100%)',
        }}
      />

      {/* Info overlay — bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
        <p className="text-[11px] font-semibold mb-0.5" style={{ color }}>
          {role[lang]}
        </p>
        <h3 className={`font-black text-white leading-tight mb-3 ${large ? 'text-xl' : 'text-base'}`}>
          {name}
        </h3>
        <SocialLinks wa={wa} ig={ig} email={email} />
      </div>

      {/* Online dot for leader */}
      {leader && (
        <span className="absolute bottom-4 right-4 z-20 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </span>
      )}
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

        {/* ── Leader — centered, taller ── */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-xs">
            <PhotoCard member={leader} lang={lang} large />
          </div>
        </div>

        {/* ── Members grid — 2 col mobile, 4 col desktop ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((m, i) => (
            <PhotoCard key={i} member={m} lang={lang} />
          ))}
        </div>

      </div>
    </section>
  )
}
