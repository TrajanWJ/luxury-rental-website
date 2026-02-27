import RealEstateNavigation from "@/components/real-estate-navigation"
import RealEstateFooter from "@/components/real-estate-footer"

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f2ece3] text-[#2B2B2B] relative overflow-x-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-20 left-[-140px] h-[360px] w-[360px] rounded-full bg-[#9D5F36]/[0.07] blur-[100px]" />
        <div className="absolute top-[320px] right-[-120px] h-[320px] w-[320px] rounded-full bg-[#2B2B2B]/[0.04] blur-[95px]" />
        <div className="absolute bottom-[200px] left-[10%] h-[280px] w-[280px] rounded-full bg-[#9D5F36]/[0.05] blur-[110px]" />
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #2B2B2B 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      <div className="relative z-10">
        <RealEstateNavigation />
        {children}
        <RealEstateFooter />
      </div>
    </div>
  )
}
