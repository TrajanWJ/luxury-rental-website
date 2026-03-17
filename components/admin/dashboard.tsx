"use client"

import { useState, useEffect } from "react"
import { Loader2, X } from "lucide-react"
import { properties } from "@/lib/data"
import type { SiteConfig, PropertyOverride, ActivityLogEntry } from "@/lib/site-config-store"

/* ── Types ─────────────────────────────────────────── */

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  experience: string | null
  source: string
  email_status: string
  created_at: string
}

/* ── Helpers ───────────────────────────────────────── */

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function toKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

/* ── Quick Start Banner ────────────────────────────── */

function QuickStartBanner() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      const val = localStorage.getItem("admin-quickstart-dismissed")
      setDismissed(val === "true")
    } catch {
      setDismissed(false)
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem("admin-quickstart-dismissed", "true")
    } catch {}
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className="relative bg-[#9D5F36]/8 border border-[#9D5F36]/20 rounded-2xl p-5 mb-6">
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 text-[#ECE9E7]/40 hover:text-[#ECE9E7]/70 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="text-[#ECE9E7]/80 text-sm mb-3">Welcome back. Here&apos;s what&apos;s happening.</p>
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/properties"
          className="px-3 py-1 text-xs rounded-full bg-[#9D5F36]/20 text-[#9D5F36] border border-[#9D5F36]/30 hover:bg-[#9D5F36]/30 transition-colors"
        >
          Properties
        </a>
        <a
          href="/admin/photos"
          className="px-3 py-1 text-xs rounded-full bg-[#9D5F36]/20 text-[#9D5F36] border border-[#9D5F36]/30 hover:bg-[#9D5F36]/30 transition-colors"
        >
          Photos
        </a>
        <a
          href="/admin/concierge"
          className="px-3 py-1 text-xs rounded-full bg-[#9D5F36]/20 text-[#9D5F36] border border-[#9D5F36]/30 hover:bg-[#9D5F36]/30 transition-colors"
        >
          Concierge
        </a>
      </div>
    </div>
  )
}

/* ── Inquiries Card ────────────────────────────────── */

function InquiriesCard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/inquiries")
      .then((r) => r.json())
      .then((data) => {
        setInquiries(data.inquiries || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const newCount = inquiries.filter((inq) => {
    const t = new Date(inq.created_at).getTime()
    return now - t < oneDayMs
  }).length

  const thisMonthCount = inquiries.filter((inq) => {
    const d = new Date(inq.created_at)
    const today = new Date()
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
  }).length

  const recent = inquiries.slice(0, 3)

  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#ECE9E7] font-serif text-lg">Inquiries</h2>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-[#9D5F36]" />}
      </div>

      {!loading && (
        <>
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-[#2B2B2B] rounded-xl p-3 text-center">
              <p className="text-[#9D5F36] text-2xl font-semibold">{newCount}</p>
              <p className="text-[#ECE9E7]/40 text-xs mt-0.5">New (24h)</p>
            </div>
            <div className="flex-1 bg-[#2B2B2B] rounded-xl p-3 text-center">
              <p className="text-[#ECE9E7] text-2xl font-semibold">{thisMonthCount}</p>
              <p className="text-[#ECE9E7]/40 text-xs mt-0.5">This Month</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {recent.length === 0 && (
              <p className="text-[#ECE9E7]/30 text-sm">No inquiries yet.</p>
            )}
            {recent.map((inq) => (
              <div key={inq.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#ECE9E7]/80 text-sm truncate">{inq.name}</span>
                  <span className="text-[#ECE9E7]/30 text-xs shrink-0">{inq.source}</span>
                </div>
                <span className="text-[#ECE9E7]/30 text-xs shrink-0 ml-2">
                  {getTimeAgo(new Date(inq.created_at))}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <a
        href="/admin/inquiries"
        className="text-[#9D5F36] text-sm hover:text-[#BCA28A] transition-colors"
      >
        View All →
      </a>
    </div>
  )
}

/* ── Recent Activity Card ──────────────────────────── */

function RecentActivityCard() {
  const [log, setLog] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/site-config?section=activityLog")
      .then((r) => r.json())
      .then((data) => {
        setLog(data.activityLog || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const recent = log.slice(0, 4)

  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#ECE9E7] font-serif text-lg">Recent Activity</h2>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-[#9D5F36]" />}
      </div>

      {!loading && (
        <>
          <div className="space-y-3 mb-4">
            {recent.length === 0 && (
              <p className="text-[#ECE9E7]/30 text-sm">No activity recorded yet.</p>
            )}
            {recent.map((entry, i) => {
              const age = Date.now() - new Date(entry.timestamp).getTime()
              const isRecent = age < 60 * 60 * 1000
              return (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      isRecent ? "bg-[#9D5F36]" : "bg-[#ECE9E7]/20"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-[#ECE9E7]/80 text-sm leading-snug">{entry.action}</p>
                    <p className="text-[#ECE9E7]/30 text-xs mt-0.5">
                      {getTimeAgo(new Date(entry.timestamp))}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <a
        href="/admin/activity-log"
        className="text-[#9D5F36] text-sm hover:text-[#BCA28A] transition-colors"
      >
        Full Log →
      </a>
    </div>
  )
}

/* ── Properties at a Glance ────────────────────────── */

function PropertiesGlance() {
  const [overrides, setOverrides] = useState<Record<string, PropertyOverride>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data: SiteConfig) => {
        setOverrides(data.propertyOverrides || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#ECE9E7] font-serif text-lg">Properties at a Glance</h2>
        {loading && <Loader2 className="h-6 w-6 animate-spin text-[#9D5F36]" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((prop) => {
          const key = toKey(prop.name)
          const override = overrides[key] || {}
          const isVisible = override.showOnSite !== false
          const photoCount = prop.images.length
          const hasMatterport = override.matterportEnabled === true
          const hasVideo = override.videoEnabled === true

          return (
            <div
              key={prop.id}
              className="bg-[#2B2B2B] rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-[#ECE9E7]/90 text-sm font-medium leading-snug">{prop.name}</p>
                <span
                  className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ml-2 ${
                    isVisible ? "bg-green-500" : "bg-red-500"
                  }`}
                  title={isVisible ? "Visible" : "Hidden"}
                />
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[#ECE9E7]/40 text-xs">{photoCount} photos</span>
                {hasMatterport && (
                  <span className="text-[#ECE9E7]/40 text-xs">· 3D tour</span>
                )}
                {hasVideo && (
                  <span className="text-[#ECE9E7]/40 text-xs">· Video</span>
                )}
              </div>

              <div className="flex gap-2">
                <a
                  href="/admin/photos"
                  className="px-2.5 py-1 text-xs rounded-full bg-[#1C1C1C] text-[#ECE9E7]/60 border border-white/10 hover:text-[#ECE9E7] hover:border-white/20 transition-colors"
                >
                  Photos
                </a>
                <a
                  href="/admin/properties"
                  className="px-2.5 py-1 text-xs rounded-full bg-[#1C1C1C] text-[#ECE9E7]/60 border border-white/10 hover:text-[#ECE9E7] hover:border-white/20 transition-colors"
                >
                  Settings
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Dashboard ─────────────────────────────────────── */

export function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Dashboard</h1>
        <p className="text-[#ECE9E7]/40 text-sm">Wilson Premier Properties — Admin Overview</p>
      </div>

      <QuickStartBanner />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InquiriesCard />
        <RecentActivityCard />
      </div>

      <PropertiesGlance />
    </div>
  )
}
