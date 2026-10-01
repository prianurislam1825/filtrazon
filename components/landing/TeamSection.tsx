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

function Socials({ wa, ig, email }: { wa: string; ig: string; email: string }) {
  const btn = 'w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white/80 hover:bg-white/30 hover:text-white transition-all'
  return (
    <div className="flex gap-2">
      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WA" className={btn}><MessageCircle size={13} /></a>
      <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="IG" className={btn}><Instagram size={13} /></a>
      <a href={`mailto:${email}`} aria-label="Email" className={btn}><Mail size={13} /></a>
    </div>
  )
}

// ── Large featured card (CEO) ─────────────────────────────────
function LeaderCard({ m, lang }: { m: Member; lang: 'id' | 'en' }) {
  return (
    <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden group">
      {m.photo && (
        <Image src={m.photo} alt={m.name} fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 40vw" priority />
      )}
      {/* gradient */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, transparent 30%, rgba(10,15,30,0.97) 100%)' }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: m.color }} />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {/* Badge */}
        <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4"
          style={{ background: `${m.color}25`, color: m.color, border: `1px solid ${m.color}50` }}>
          {m.title} &nbsp;·&nbsp; {lang === 'id' ? 'Ketua Tim' : 'Team Leader'}
        </span>
        <h3 className="text-2xl font-black text-white leading-tight mb-1">{m.name}</h3>
        <p className="text-sm font-semibold mb-3" style={{ color: m.color }}>{m.role[lang]}</p>
        <p className="text-white/60 text-xs leading-relaxed mb-5">{m.desc[lang]}</p>
        <Socials wa={m.wa} ig={m.ig} email={m.email} />
      </div>
    </div>
  )
}

// ── Small member card ─────────────────────────────────────────
function MemberCard({ m, lang }: { m: Member; lang: 'id' | 'en' }) {
  return (
    <div className="relative rounded-2xl overflow-hidden group h-[240px]">
      {m.photo && (
        <Image src={m.photo} alt={m.name} fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 50vw, 30vw" />
      )}
      {/* gradient */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.95) 0%, rgba(10,15,30,0.6) 45%, transparent 75%)' }} />

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: m.color }} />

      {/* Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
          style={{ background: m.color, color: '#fff' }}>{m.title}</span>
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: m.color }}>
          {m.role[lang]}
        </p>
        <p className="text-white text-xs font-black leading-tight mb-2">{m.name}</p>
        <Socials wa={m.wa} ig={m.ig} email={m.email} />
      </div>
    </div>
  )
}

export default function TeamSection() {
  const { lang } = useLang()
  const [leader, ...members] = TEAM

  return (
    <section id="tim" className="py-20 bg-[#0C1220]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A017] mb-3">
            {lang === 'id' ? 'Tim Kami' : 'Our Team'}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight max-w-sm">
              {lang === 'id' ? 'Orang-orang di Balik FILTRAZON' : 'The People Behind FILTRAZON'}
            </h2>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed">
              {lang === 'id'
                ? 'Tim muda yang berdedikasi menghadirkan solusi air bersih berbasis teknologi.'
                : 'A dedicated young team delivering technology-based clean water solutions.'}
            </p>
          </div>
          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <div className="flex gap-1.5">
              {TEAM.map((m) => (
                <div key={m.title} className="w-2 h-2 rounded-full" style={{ background: m.color }} />
              ))}
            </div>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </div>

        {/* ── Main layout: CEO left tall + 2×2 grid right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* CEO — spans 2 cols, full height */}
          <div className="lg:col-span-2 lg:row-span-2">
            <LeaderCard m={leader} lang={lang} />
          </div>

          {/* 4 members — 2 cols × 2 rows */}
          {members.map((m, i) => (
            <div key={i} className="lg:col-span-3" style={{ gridColumn: 'span 1' }}>
              <MemberCard m={m} lang={lang} />
            </div>
          ))}
        </div>

        {/* Member count */}
        <p className="mt-8 text-center text-white/30 text-xs tracking-widest uppercase">
          {TEAM.length} {lang === 'id' ? 'Anggota Tim · FILTRAZON 2025' : 'Team Members · FILTRAZON 2025'}
        </p>

      </div>
    </section>
  )
}
