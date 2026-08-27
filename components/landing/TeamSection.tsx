'use client'

import Image from 'next/image'
import { Instagram, MessageCircle, Mail, User } from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

// ── Team data ─────────────────────────────────────────────────
// Untuk menambah foto: simpan file ke /public/team/nama-file.jpg
// lalu isi field `photo` dengan '/team/nama-file.jpg'
const TEAM = [
  {
    name:   'Haikal Adz Dzaki',
    title:  'CEO',
    role:   { id: 'Chief Executive Officer', en: 'Chief Executive Officer' },
    desc:   {
      id: 'Memimpin visi dan strategi FILTRAZON secara keseluruhan, mengorkestrasi seluruh tim serta mengarahkan inovasi dari tahap konsep hingga implementasi lapangan nyata.',
      en: 'Leads the overall vision and strategy of FILTRAZON, orchestrating the entire team and driving innovation from concept to real-world field implementation.',
    },
    photo:  null as string | null,  // ganti dengan '/team/haikal.jpg' setelah foto ditambah
    leader: true,
    color:  '#D4A017',
    wa:     'https://wa.me/6281226615585',
    ig:     'https://www.instagram.com/haikaladzdzaki.28',
    igHandle: '@haikaladzdzaki.28',
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
    photo:  null as string | null,
    leader: false,
    color:  '#2196D3',
    wa:     'https://wa.me/6281297011820',
    ig:     'https://www.instagram.com/kanieeah_',
    igHandle: '@kanieeah',
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
    photo:  null as string | null,
    leader: false,
    color:  '#43A047',
    wa:     'https://wa.me/628122988261',
    ig:     'https://www.instagram.com/cathrapire',
    igHandle: '@cathrapire',
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
    photo:  null as string | null,
    leader: false,
    color:  '#D4A017',
    wa:     'https://wa.me/6282324765512',
    ig:     'https://www.instagram.com/aiss.rsyq',
    igHandle: '@aiss.rsyq',
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
    photo:  null as string | null,
    leader: false,
    color:  '#2196D3',
    wa:     'https://wa.me/6281326354819',
    ig:     'https://www.instagram.com/fattah.9393',
    igHandle: '@fattah.9393',
    email:  'fattahyogatama@gmail.com',
  },
]

// ── Avatar component — foto atau placeholder ───────────────────
function Avatar({
  photo, name, color, size = 80,
}: {
  photo: string | null; name: string; color: string; size?: number
}) {
  if (photo) {
    return (
      <div
        className="rounded-2xl overflow-hidden shrink-0 border-2"
        style={{ width: size, height: size, borderColor: `${color}40` }}
      >
        <Image
          src={photo}
          alt={name}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl flex items-center justify-center shrink-0 border-2"
      style={{
        width:       size,
        height:      size,
        background:  `linear-gradient(135deg, ${color}18 0%, ${color}30 100%)`,
        borderColor: `${color}40`,
      }}
    >
      <User size={Math.floor(size * 0.44)} style={{ color }} />
    </div>
  )
}

// ── Social links ───────────────────────────────────────────────
function SocialLinks({
  wa, ig, email, size = 'md',
}: {
  wa: string; ig: string; email: string; size?: 'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
  const ico = size === 'sm' ? 12 : 14

  return (
    <div className="flex items-center gap-1.5">
      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
        className={`${dim} rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors`}>
        <MessageCircle size={ico} />
      </a>
      <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
        className={`${dim} rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500 hover:bg-pink-100 transition-colors`}>
        <Instagram size={ico} />
      </a>
      <a href={`mailto:${email}`} aria-label="Email"
        className={`${dim} rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors`}>
        <Mail size={ico} />
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

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
          {/* Photo hint */}
          <p className="mt-2 text-[11px] text-gray-400 italic">
            {lang === 'id'
              ? '* Foto tim akan ditampilkan setelah file diunggah ke /public/team/'
              : '* Team photos will appear after files are uploaded to /public/team/'}
          </p>
        </div>

        {/* ── Leader card — centered, prominent ── */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div
            className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 w-full max-w-sm hover:shadow-xl transition-shadow border-2"
            style={{ borderColor: `${leader.color}40`, borderTop: `4px solid ${leader.color}` }}
          >
            <div className="flex flex-col items-center text-center">

              {/* Avatar */}
              <div className="relative mb-4">
                <Avatar photo={leader.photo} name={leader.name} color={leader.color} size={88} />
                {/* Online dot */}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              {/* Title badge */}
              <span
                className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-3"
                style={{ background: `${leader.color}15`, color: leader.color, borderColor: `${leader.color}40` }}
              >
                {leader.title} · {lang === 'id' ? 'Ketua Tim' : 'Team Leader'}
              </span>

              {/* Name */}
              <h3 className="font-black text-[#1C2B3A] text-lg leading-tight mb-0.5">
                {leader.name}
              </h3>

              {/* Role */}
              <p className="text-xs font-semibold mb-3" style={{ color: leader.color }}>
                {leader.role[lang]}
              </p>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                {leader.desc[lang]}
              </p>

              {/* Socials */}
              <SocialLinks wa={leader.wa} ig={leader.ig} email={leader.email} size="md" />
            </div>
          </div>
        </div>

        {/* ── Members grid — 1-col mobile, 2-col tablet+ ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((m, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all"
              style={{ borderTop: `3px solid ${m.color}` }}
            >
              {/* Mobile: stack vertically for better readability */}
              <div className="flex items-start gap-4">

                <Avatar photo={m.photo} name={m.name} color={m.color} size={60} />

                <div className="flex-1 min-w-0">
                  {/* Title badge */}
                  <span
                    className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1.5"
                    style={{ background: `${m.color}15`, color: m.color, borderColor: `${m.color}40` }}
                  >
                    {m.title}
                  </span>

                  <h4 className="font-black text-[#1C2B3A] text-sm leading-tight">{m.name}</h4>
                  <p className="text-[11px] font-semibold mt-0.5 mb-2" style={{ color: m.color }}>
                    {m.role[lang]}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    {m.desc[lang]}
                  </p>
                  <SocialLinks wa={m.wa} ig={m.ig} email={m.email} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Photo upload guide ── */}
      </div>
    </section>
  )
}
