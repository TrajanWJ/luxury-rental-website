import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import FullScreenHomes from "@/components/full-screen-homes"
import SocialStrip from "@/components/social-strip"
import PledgeSection from "@/components/pledge-section"
import Experiences from "@/components/experiences"

import FooterCTA from "@/components/footer-cta"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />

      {/* Section Separator */}
      <div className="section-separator"></div>

      <FullScreenHomes />

      <SocialStrip />

      <PledgeSection />

      {/* Section Separator */}
      <div className="section-separator"></div>

      <Experiences />

      <FooterCTA />
    </main>
  )
}
