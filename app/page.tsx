import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import FullScreenHomes from "@/components/full-screen-homes"
import Experiences from "@/components/experiences"
import ExperiencesTicker from "@/components/experiences-ticker"
import Testimonials from "@/components/testimonials"
import FooterCTA from "@/components/footer-cta"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />

      {/* Section Separator */}
      <div className="section-separator"></div>

      <FullScreenHomes />

      {/* Section Separator */}
      <div className="section-separator"></div>

      <Experiences />

      {/* New Auto-Scrolling Infinite Carousel - Additive Only */}
      <ExperiencesTicker />

      {/* Section Separator */}
      <div className="section-separator"></div>

      <Testimonials />
      <FooterCTA />
    </main>
  )
}
