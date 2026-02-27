import RealEstateNavigation from "@/components/real-estate-navigation"
import RealEstateFooter from "@/components/real-estate-footer"

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f2ece3] text-[#2B2B2B]">
      <RealEstateNavigation />
      {children}
      <RealEstateFooter />
    </div>
  )
}
