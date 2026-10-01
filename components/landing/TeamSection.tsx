'use client'

import Image from 'next/image'
import { Instagram, MessageCircle, Mail } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

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

function PhotoCard({ member, lang, large = false }: { member: Member; lang: 'id' | 'en'; large?: boolean }) {
  const { name, title, role, photo, color, wa, ig, email, leader } = member
  const cardH = large ? 'h-[520px]' : 'h-[440px]'

  return (
    <div className={`relative w-full ${cardH} rounded-2xl overflow-hidden shadow-xl group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300`}
      style={{ border: `2px solid ${color}50` }}>

      {/* Photo background */}
      {photo && (
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      )}

      {/* Title badge top-left */}
      <div className="absolute top-3 left-3 z-20">
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg"
          style={{ background: color, color: '#fff' }}>
          {title}{leader ? ` · ${lang === 'id' ? 'Ketua' : 'Leader'}` : ''}
        </span>
      </div>

      {/* Gradient */}
      <div className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to top, rgba(10,17,35,0.98) 0%, rgba(10,17,35,0.85) 38%, rgba(10,17,35,0.15) 65%, transparent 100%)' }} />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color }}>
          {role[lang]}
        </p>
        <h3 className={`font-black text-white leading-tight mb-1.5 ${large ? 'text-lg' : 'text-sm'}`}>
          {name}
        </h3>
        <p className="text-white/65 text-[11px] leading-relaxed mb-3 line-clamp-3">
          {member.desc[lang]}
        </p>
        <SocialLinks wa={wa} ig={ig} email={email} />
      </div>

      {/* Online dot leader */}
      {leader && (
        <span className="absolute top-3 right-3 z-20 w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow">
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
        </span>
      )}
    </div>
  )
}

// ── Connector SVG (org chart lines) ──────────────────────────
function OrgConnector({ memberCount }: { memberCount: number }) {
  // Responsive connector: vertical line down from CEO, horizontal line across, vertical lines up to each member
  const cols = memberCount // 4 members
  return (
    <div className="hidden lg:flex flex-col items-center w-full py-1" aria-hidden>
      {/* Vertical stem down from CEO */}
      <div className="w-0.5 h-6 bg-gradient-to-b from-[#D4A017] to-[#5BBCEB]" />
      {/* Horizontal bar */}
      <div className="relative w-full flex items-center justify-between px-[12.5%]">
        {/* The horizontal line */}
        <div className="absolute left-[12.5%] right-[12.5%] top-1/2 h-0.5 bg-gradient-to-r from-[#D4A017] via-[#5BBCEB] to-[#2196D3]" />
        {/* Dots + vertical drops for each member */}
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex flex-col items-center z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-[#5BBCEB] border-2 border-white shadow" />
            <div className="w-0.5 h-5 bg-gradient-to-b from-[#5BBCEB] to-[#2196D3]" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mobile connector ─────────────────────────────────────────
function MobileConnector() {
  return (
    <div className="flex lg:hidden flex-col items-center py-1" aria-hidden>
      <div className="w-0.5 h-8 bg-gradient-to-b from-[#D4A017] to-[#5BBCEB]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#5BBCEB] border-2 border-white shadow" />
      <div className="w-0.5 h-4 bg-gradient-to-b from-[#5BBCEB] to-[#2196D3]" />
    </div>
  )
}

export default function TeamSection() {
  const { lang } = useLang()
  const [leader, ...members] = TEAM

  return (
    <section id="tim" className="py-16 sm:py-20 bg-[#F0F4F8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A017] mb-3">
            {lang === 'id' ? 'Struktur Tim' : 'Our Team'}
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

        {/* ── CEO — centered ── */}
        <div className="flex justify-center">
          <div className="w-full max-w-[260px]">
            <PhotoCard member={leader} lang={lang} large />
          </div>
        </div>

        {/* ── Org chart connector ── */}
        <OrgConnector memberCount={members.length} />
        <MobileConnector />

        {/* ── Members grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((m, i) => (
            <PhotoCard key={i} member={m} lang={lang} />
          ))}
        </div>

        {/* ── Bottom legend ── */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {TEAM.map((m) => (
            <div key={m.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
              <span className="text-xs text-gray-500 font-semibold">{m.title} — {m.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
