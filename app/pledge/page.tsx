"use client"

import Navigation from "@/components/navigation"
import PledgeSection from "@/components/pledge-section"
import FooterCTA from "@/components/footer-cta"

export default function PledgePage() {
  return (
    <main className="min-h-screen">
      <Navigation theme="light" />
      <div className="pt-28 md:pt-32">
        <PledgeSection />
      </div>
      <FooterCTA />
    </main>
  )
}
