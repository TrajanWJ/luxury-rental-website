"use client"

import { useState, useEffect } from "react"

interface AnalyticsSummary {
  totalViews: number
  uniqueSessions: number
  heroScrollPast: number
  popupOpens: {
    booking: number
    concierge: number
    contact: number
  }
  propertyViews: Record<string, number>
  ctaClicks: Record<string, number>
}

interface MetricCardProps {
  title: string
  value: number | null
  subtitle: string
}

function MetricCard({ title, value, subtitle }: MetricCardProps) {
  const hasData = value !== null && value > 0
  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
      <div className="text-[#ECE9E7]/40 text-[10px] uppercase tracking-wider mb-3">{title}</div>
      <div className="text-[#ECE9E7] text-3xl font-serif">
        {value === null ? (
          <span className="animate-pulse text-[#ECE9E7]/20">—</span>
        ) : (
          value.toLocaleString()
        )}
      </div>
      <div className="text-[#ECE9E7]/20 text-xs mt-1">
        {value === null ? "Loading…" : hasData ? subtitle : "No data yet"}
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d">("7d")
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/events?range=${range}`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data)
        setLoading(false)
      })
      .catch(() => {
        setSummary(null)
        setLoading(false)
      })
  }, [range])

  const metrics: MetricCardProps[] = summary
    ? [
        { title: "Total Page Views", value: summary.totalViews, subtitle: `Last ${range === "7d" ? "7 days" : "30 days"}` },
        { title: "Unique Visitors", value: summary.uniqueSessions, subtitle: "Unique sessions" },
        { title: "Hero Scroll-Past", value: summary.heroScrollPast, subtitle: "Scrolled past hero" },
        { title: "Booking Popup Opens", value: summary.popupOpens.booking, subtitle: "Booking widget clicks" },
        { title: "Concierge Modal Opens", value: summary.popupOpens.concierge, subtitle: "Concierge interest" },
        { title: "Contact Modal Opens", value: summary.popupOpens.contact, subtitle: "Contact form opens" },
      ]
    : [
        { title: "Total Page Views", value: 0, subtitle: "" },
        { title: "Unique Visitors", value: 0, subtitle: "" },
        { title: "Hero Scroll-Past", value: 0, subtitle: "" },
        { title: "Booking Popup Opens", value: 0, subtitle: "" },
        { title: "Concierge Modal Opens", value: 0, subtitle: "" },
        { title: "Contact Modal Opens", value: 0, subtitle: "" },
      ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Analytics</h1>
          <p className="text-[#ECE9E7]/40 text-sm">Site performance and visitor insights</p>
        </div>

        {/* Range selector */}
        <div className="flex gap-1 bg-[#1C1C1C] rounded-xl border border-white/5 p-1">
          {(["7d", "30d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                range === r
                  ? "bg-[#9D5F36] text-[#ECE9E7]"
                  : "text-[#ECE9E7]/40 hover:text-[#ECE9E7]/70"
              }`}
            >
              {r === "7d" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-[#9D5F36] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {metrics.map((m) => (
            <MetricCard key={m.title} {...m} />
          ))}
        </div>
      )}
    </div>
  )
}
