// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Logo component using FILTRAZON.png
// ─────────────────────────────────────────────────────────────

import Image from 'next/image'

interface FiltrazonLogoProps {
  size?:      number
  className?: string
}

export default function FiltrazonLogo({ size = 40, className = '' }: FiltrazonLogoProps) {
  return (
    <Image
      src="/FILTRAZON.png"
      alt="FILTRAZON"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  )
}

// ── Inline brand: logo + wordmark side-by-side ────────────────
export function FiltrazonBrand({
  size = 32,
  dark = false,
  className = '',
}: {
  size?:      number
  dark?:      boolean
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-white/10 border border-white/10 p-1"
        style={{ width: size + 8, height: size + 8 }}>
        <Image src="/FILTRAZON.png" alt="FILTRAZON" width={size} height={size} className="object-contain" />
      </div>
      <span className="flex flex-col leading-none">
        <span className={`font-black text-sm tracking-wide uppercase ${dark ? 'text-white' : 'text-[#1C2B3A]'}`}>
          FILTRAZON
        </span>
        <span className={`text-[9px] uppercase tracking-widest font-medium mt-0.5 ${dark ? 'text-white/40' : 'text-gray-400'}`}>
          IoT Water System
        </span>
      </span>
    </span>
  )
}
