import type { Metadata } from 'next'
import LandingPage from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'FILTRAZON — Sistem Filter Air Portabel IoT untuk Lokasi Bencana',
  description:
    'FILTRAZON adalah sistem filter air portabel berbasis IoT untuk lokasi bencana. Monitoring kualitas air real-time via LoRa, sensor pH, TDS, turbiditas, dan kontrol aktuator jarak jauh.',
  openGraph: {
    title: 'FILTRAZON — IoT Water Purification System',
    description: 'Portable water filtration monitoring for disaster response.',
    type: 'website',
  },
}

export default function RootPage() {
  return <LandingPage />
}
