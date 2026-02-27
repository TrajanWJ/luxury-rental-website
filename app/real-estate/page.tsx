import RealEstateHero from "@/components/real-estate-hero"
import {
  LakeOverviewSection,
  LakeLifeSection,
  MarketSection,
  FeaturedListingSection,
} from "@/components/real-estate-sections"

export default function RealEstatePage() {
  return (
    <main>
      <RealEstateHero />
      <LakeOverviewSection />
      <LakeLifeSection />
      <MarketSection />
      <FeaturedListingSection />
    </main>
  )
}
