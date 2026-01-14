import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import FullScreenHomes from "@/components/full-screen-homes"
import Experiences from "@/components/experiences"
import Testimonials from "@/components/testimonials"
import FooterCTA from "@/components/footer-cta"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <FullScreenHomes />
      <Experiences />
      <Testimonials />
      <FooterCTA />
    </main>
  )
}
