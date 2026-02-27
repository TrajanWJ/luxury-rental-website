"use client"

import { useState } from "react"
import RealEstateHero from "@/components/real-estate-hero"
import {
  LakeOverviewSection,
  LakeLifeSection,
  MarketSection,
  FeaturedListingSection,
} from "@/components/real-estate-sections"
import { NarrativeModals, type ModalKey } from "@/components/real-estate-modals"
import { MobileDock } from "@/components/real-estate-mobile-dock"

export default function RealEstatePage() {
  const [activeModal, setActiveModal] = useState<ModalKey>(null)

  return (
    <main>
      <RealEstateHero />

      {/* Quick-action pill bar */}
      <div className="relative z-10 container mx-auto px-4 md:px-10 -mt-6 mb-4">
        <div className="rounded-2xl border border-[#BCA28A]/35 bg-white/78 backdrop-blur-md p-3 flex flex-wrap gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          {[
            { label: "Lake Deep Dive", modal: "sml-deep-dive" as const },
            { label: "Distance + Access", modal: "distance-access" as const },
            { label: "Market Pulse", modal: "market-momentum" as const },
            { label: "Contact Guide", modal: "contact-intent" as const },
          ].map((pill) => (
            <button
              key={pill.label}
              onClick={() => setActiveModal(pill.modal)}
              className="rounded-full border border-[#9D5F36]/35 bg-[#fff8f2] px-3.5 py-2 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <FeaturedListingSection onOpenMarketModal={() => setActiveModal("market-momentum")} />
      <LakeOverviewSection />
      <LakeLifeSection />
      <MarketSection />

      <MobileDock />

      <NarrativeModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onOpen={(key) => setActiveModal(key)}
      />
    </main>
  )
}
