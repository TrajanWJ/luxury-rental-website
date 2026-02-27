import { BarChart3 } from "lucide-react"

export default function AdminAnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Analytics</h1>
        <p className="text-[#ECE9E7]/40 text-sm">Site performance and booking insights</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/5 bg-white/[0.02]">
        <BarChart3 className="h-12 w-12 text-[#ECE9E7]/15 mb-4" />
        <h2 className="text-[#ECE9E7]/40 font-serif text-xl mb-2">Coming Soon</h2>
        <p className="text-[#ECE9E7]/20 text-sm max-w-md text-center">
          Analytics dashboard with site visits, booking click-throughs, and property performance metrics.
        </p>
      </div>
    </div>
  )
}
