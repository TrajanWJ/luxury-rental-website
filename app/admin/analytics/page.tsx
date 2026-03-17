"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Activity, BarChart3, Eye, MousePointerClick, RefreshCw, Users } from "lucide-react"

type RangeKey = "7d" | "30d"

interface AnalyticsSummary {
  range: RangeKey
  generatedAt: string
  totalEvents: number
  totalPageViews: number
  uniqueSessions: number
  heroScrollPastCount: number
  heroScrollPastRate: number
  popupOpenCount: number
  popupOpens: {
    booking: number
    concierge: number
    contact: number
  }
  popupTypeRows: Array<{ key: string; value: number }>
  popupRows: Array<{ popupName: string; instance: string; value: number }>
  propertyViewRows: Array<{ key: string; value: number }>
  ctaRows: Array<{ key: string; value: number; rate: number }>
  pageViewRows: Array<{ key: string; value: number }>
  comparison: {
    totalPageViews: number | null
    uniqueSessions: number | null
    heroScrollPastRate: number | null
    popupOpenCount: number | null
  }
}

function formatDelta(value: number | null, unit = "%") {
  if (value === null) return "No prior period"
  if (value === 0) return `0${unit} vs prior`
  return `${value > 0 ? "+" : ""}${value}${unit} vs prior`
}

function DeltaText({ value, unit = "%" }: { value: number | null; unit?: string }) {
  const className =
    value === null
      ? "text-[#ECE9E7]/30"
      : value > 0
        ? "text-[#C67A4B]"
        : value < 0
          ? "text-[#D67854]"
          : "text-[#ECE9E7]/45"

  return <div className={`mt-2 text-xs ${className}`}>{formatDelta(value, unit)}</div>
}

function MetricCard({
  title,
  value,
  detail,
  delta,
  icon,
}: {
  title: string
  value: string
  detail: string
  delta: number | null
  icon: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-[#171717] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.18em] text-[#ECE9E7]/45">{title}</div>
        <div className="text-[#BCA28A]">{icon}</div>
      </div>
      <div className="text-4xl font-serif text-[#F5F1EE]">{value}</div>
      <div className="mt-1 text-sm text-[#ECE9E7]/55">{detail}</div>
      <DeltaText value={delta} />
    </div>
  )
}

function DataTable({
  title,
  subtitle,
  headers,
  rows,
}: {
  title: string
  subtitle: string
  headers: string[]
  rows: Array<Array<string>>
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-[#171717] p-6">
      <div className="mb-5">
        <h2 className="text-xl font-serif text-[#F5F1EE]">{title}</h2>
        <p className="mt-1 text-sm text-[#ECE9E7]/45">{subtitle}</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/6">
        <div className="grid grid-cols-[minmax(0,1.3fr)_110px_110px] bg-white/[0.03] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-[#ECE9E7]/40">
          {headers.map((header) => (
            <div key={header}>{header}</div>
          ))}
        </div>
        {rows.length > 0 ? (
          rows.map((row) => (
            <div
              key={row.join("-")}
              className="grid grid-cols-[minmax(0,1.3fr)_110px_110px] border-t border-white/6 px-4 py-3 text-sm text-[#F5F1EE]"
            >
              <div className="truncate">{row[0]}</div>
              <div className="text-[#ECE9E7]/70">{row[1]}</div>
              <div className="text-[#BCA28A]">{row[2]}</div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-sm text-[#ECE9E7]/40">No tracked activity in this range yet.</div>
        )}
      </div>
    </div>
  )
}

function PopupCard({ summary }: { summary: AnalyticsSummary }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-[#171717] p-6 space-y-5">
      <div className="mb-5">
        <h2 className="text-xl font-serif text-[#F5F1EE]">Popup Opens</h2>
        <p className="mt-1 text-sm text-[#ECE9E7]/45">
          Totals plus the exact popup instances visitors are reaching.
        </p>
      </div>
      <div className="space-y-3">
        {summary.popupTypeRows.slice(0, 6).map((row) => (
          <div key={row.key} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
            <span className="text-sm text-[#ECE9E7]/70">{row.key}</span>
            <span className="text-lg font-serif text-[#F5F1EE]">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/6">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_72px] bg-white/[0.03] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-[#ECE9E7]/40">
          <div>Popup</div>
          <div>Instance</div>
          <div>Count</div>
        </div>
        {summary.popupRows.length > 0 ? (
          summary.popupRows.slice(0, 8).map((row) => (
            <div
              key={`${row.popupName}-${row.instance}`}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_72px] border-t border-white/6 px-4 py-3 text-sm"
            >
              <div className="truncate text-[#F5F1EE]">{row.popupName}</div>
              <div className="truncate text-[#ECE9E7]/60">{row.instance}</div>
              <div className="text-[#BCA28A]">{row.value}</div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-sm text-[#ECE9E7]/40">No popup instance data in this range yet.</div>
        )}
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("7d")
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get("range")
    if (current === "30d") setRange("30d")
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set("range", range)
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`)

    setLoading(true)
    setError(null)

    fetch(`/api/analytics/events?range=${range}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load analytics")
        return response.json()
      })
      .then((data: AnalyticsSummary) => {
        setSummary(data)
        setLoading(false)
      })
      .catch(() => {
        setSummary(null)
        setError("Analytics could not be loaded.")
        setLoading(false)
      })
  }, [range, refreshToken])

  const hasData = !!summary && (summary.totalEvents > 0 || summary.totalPageViews > 0)

  const metricCards = useMemo(() => {
    if (!summary) return []

    return [
      {
        title: "Page Views",
        value: summary.totalPageViews.toLocaleString(),
        detail: `Across the last ${range === "7d" ? "7" : "30"} days`,
        delta: summary.comparison.totalPageViews,
        icon: <Eye className="h-5 w-5" />,
      },
      {
        title: "Unique Visitors",
        value: summary.uniqueSessions.toLocaleString(),
        detail: "Distinct anonymous browser sessions",
        delta: summary.comparison.uniqueSessions,
        icon: <Users className="h-5 w-5" />,
      },
      {
        title: "Hero Scroll Rate",
        value: `${summary.heroScrollPastRate}%`,
        detail: `${summary.heroScrollPastCount} visitors moved past the hero`,
        delta: summary.comparison.heroScrollPastRate,
        icon: <Activity className="h-5 w-5" />,
      },
      {
        title: "Popup Opens",
        value: summary.popupOpenCount.toLocaleString(),
        detail: "Booking, concierge, and contact overlays",
        delta: summary.comparison.popupOpenCount,
        icon: <MousePointerClick className="h-5 w-5" />,
      },
    ]
  }, [range, summary])

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#BCA28A]">
            <BarChart3 className="h-5 w-5" />
            <span className="text-[11px] uppercase tracking-[0.2em]">Analytics</span>
          </div>
          <h1 className="text-3xl font-serif text-[#F5F1EE]">Visitor Behavior</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#ECE9E7]/45">
            Production analytics are retained from the event log already on disk. This view surfaces trends,
            popular pages, top properties, and CTA performance without seeding sample data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-xl border border-white/8 bg-[#171717] p-1">
            {(["7d", "30d"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setRange(option)}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  range === option
                    ? "bg-[#9D5F36] text-white"
                    : "text-[#ECE9E7]/45 hover:text-[#ECE9E7]/75"
                }`}
              >
                {option === "7d" ? "Last 7 Days" : "Last 30 Days"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setRefreshToken((current) => current + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[#171717] text-[#ECE9E7]/55 transition-colors hover:text-[#ECE9E7]"
            aria-label="Refresh analytics"
            title="Refresh analytics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-3xl border border-white/6 bg-[#171717]" />
          ))}
        </div>
      ) : error || !summary ? (
        <div className="rounded-3xl border border-[#D67854]/25 bg-[#171717] p-8 text-sm text-[#ECE9E7]/65">
          {error || "Analytics could not be loaded."}
        </div>
      ) : !hasData ? (
        <div className="rounded-3xl border border-white/8 bg-[#171717] p-10">
          <h2 className="text-2xl font-serif text-[#F5F1EE]">No data yet</h2>
          <p className="mt-3 max-w-xl text-sm text-[#ECE9E7]/45">
            Analytics will populate as visitors browse the site and interact with booking, contact, property, and
            media flows. Existing production history is preserved; this range just does not contain tracked events.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {metricCards.map((card) => (
              <MetricCard key={card.title} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <DataTable
              title="Top Pages"
              subtitle="Where attention is concentrating."
              headers={["Page", "Views", "Share"]}
              rows={summary.pageViewRows.slice(0, 8).map((row) => [
                row.key,
                row.value.toLocaleString(),
                summary.totalPageViews ? `${((row.value / summary.totalPageViews) * 100).toFixed(1)}%` : "0%",
              ])}
            />
            <PopupCard summary={summary} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DataTable
              title="Property Interest"
              subtitle="Property modal opens and deep-view interest."
              headers={["Property", "Views", "Share"]}
              rows={summary.propertyViewRows.slice(0, 8).map((row) => [
                row.key,
                row.value.toLocaleString(),
                summary.propertyViewRows.length
                  ? `${(
                      (row.value / summary.propertyViewRows.reduce((total, item) => total + item.value, 0)) *
                      100
                    ).toFixed(1)}%`
                  : "0%",
              ])}
            />
            <DataTable
              title="CTA Performance"
              subtitle="Which buttons are getting action."
              headers={["CTA", "Clicks", "Rate"]}
              rows={summary.ctaRows.slice(0, 8).map((row) => [
                row.key,
                row.value.toLocaleString(),
                `${row.rate.toFixed(1)}%`,
              ])}
            />
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#171717] p-6 text-sm text-[#ECE9E7]/45">
            Last refreshed from retained analytics history at{" "}
            <span className="text-[#F5F1EE]">
              {new Date(summary.generatedAt).toLocaleString()}
            </span>
            .
          </div>
        </div>
      )}
    </div>
  )
}
