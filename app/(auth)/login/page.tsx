'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import { Droplets, Wifi, Shield } from 'lucide-react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">

      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-10 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0D1F2D 0%, #1A2B3C 35%, #1B4F72 65%, #1565C0 100%)' }}>

        {/* Gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-60 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,160,23,0.2) 0%, transparent 70%)' }} />
        {/* Green glow */}
        <div className="absolute bottom-0 right-0 w-60 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(67,160,71,0.15) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 p-2">
            <Image src="/FILTRAZON.png" alt="FILTRAZON" width={36} height={36} className="object-contain" />
          </div>
          <div>
            <p className="font-black text-lg tracking-wide leading-none">FILTRAZON</p>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">IoT Water System</p>
          </div>
        </div>

        {/* Center visual */}
        <div className="relative z-10 flex flex-col items-center text-center py-8">
          <div className="relative mb-8">
            {/* Glow rings */}
            <div className="absolute inset-0 rounded-full blur-2xl opacity-50"
              style={{ background: 'radial-gradient(circle, #D4A017 0%, #43A047 40%, #2196D3 80%)' }} />
            <div className="relative w-44 h-44 rounded-full border-2 border-white/10 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-white/15 flex items-center justify-center bg-white/5 backdrop-blur-sm p-5">
                <Image src="/FILTRAZON.png" alt="FILTRAZON" width={88} height={88} className="object-contain" />
              </div>
              {/* Orbit dots — tri-color */}
              {[
                { angle: 0,   color: '#F0C93A' },
                { angle: 120, color: '#81C784' },
                { angle: 240, color: '#64B5F6' },
              ].map((d, i) => {
                const rad = (d.angle - 90) * Math.PI / 180
                const r = 50, cx = 50 + r * Math.cos(rad), cy = 50 + r * Math.sin(rad)
                return (
                  <div key={i} className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white"
                    style={{ left: `${cx}%`, top: `${cy}%`, background: d.color }} />
                )
              })}
            </div>
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight mb-3">
            Emergency Water<br />
            <span style={{ color: '#F0C93A' }}>Treatment Monitor</span>
          </h1>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Monitoring kualitas air real-time untuk lokasi bencana berbasis IoT & LoRa.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: Droplets, text: 'pH · TDS · Turbiditas · Flow Rate',  color: '#64B5F6' },
            { icon: Wifi,     text: 'LoRa Long-Range Connectivity',        color: '#81C784' },
            { icon: Shield,   text: 'Secure Authenticated Dashboard',      color: '#F0C93A' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-white/65">
              <f.icon size={15} style={{ color: f.color }} className="shrink-0" />
              {f.text}
            </div>
          ))}

          {/* Tri-color bar */}
          <div className="flex gap-1 mt-4">
            <div className="h-1 flex-1 rounded-full" style={{ background: '#D4A017' }} />
            <div className="h-1 flex-1 rounded-full" style={{ background: '#2196D3' }} />
            <div className="h-1 flex-1 rounded-full" style={{ background: '#43A047' }} />
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl border border-gray-200 bg-white shadow-sm p-1.5">
              <Image src="/FILTRAZON.png" alt="FILTRAZON" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <p className="font-black text-base tracking-wide text-[#1C2B3A] leading-none">FILTRAZON</p>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">IoT Water System</p>
            </div>
          </div>

          {/* Tri-color accent bar */}
          <div className="flex gap-1 mb-6 rounded-full overflow-hidden">
            <div className="h-1 flex-1" style={{ background: '#D4A017' }} />
            <div className="h-1 flex-1" style={{ background: '#2196D3' }} />
            <div className="h-1 flex-1" style={{ background: '#43A047' }} />
          </div>

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>

          {process.env.NODE_ENV === 'development' && (
            <p className="mt-4 text-center text-[11px] text-gray-400">
              Dev: <code className="bg-gray-100 px-1 rounded">admin@filtrazon.local</code> /{' '}
              <code className="bg-gray-100 px-1 rounded">filtrazon2024</code>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="card p-7 animate-pulse space-y-4">
      <div className="h-6 w-32 bg-gray-100 rounded" />
      <div className="h-4 w-48 bg-gray-50 rounded" />
      <div className="h-10 bg-gray-100 rounded-lg" />
      <div className="h-10 bg-gray-100 rounded-lg" />
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
  )
}
