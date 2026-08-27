'use client'

import LandingNav      from './LandingNav'
import HeroSection     from './HeroSection'
import StatsSection    from './StatsSection'
import AboutSection    from './AboutSection'
import FeaturesSection from './FeaturesSection'
import HowItWorks      from './HowItWorks'
import ProductSection  from './ProductSection'
import PartnersSection from './PartnersSection'
import TeamSection     from './TeamSection'
import VisionMission   from './VisionMission'
import CtaSection      from './CtaSection'
import LandingFooter   from './LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1C2B3A] antialiased overflow-x-hidden">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorks />
        <ProductSection />
        <PartnersSection />
        <TeamSection />
        <VisionMission />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
