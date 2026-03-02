"use client"

import { useEffect, useState } from "react"
import { Mail, Phone, User, Clock, Tag, MessageSquare, Loader2, Home } from "lucide-react"

interface Inquiry {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  experience: string | null
  source: "modal" | "contact-page" | "real-estate-modal" | "real-estate-contact"
  email_status: "sent" | "failed" | "skipped"
  created_at: string
}

type TabKey = "all" | "str" | "real-estate"

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "str", label: "STR" },
  { key: "real-estate", label: "Real Estate" },
]

function isRESource(source: Inquiry["source"]) {
  return source === "real-estate-modal" || source === "real-estate-contact"
}

function EmailStatusBadge({ status }: { status: Inquiry["email_status"] }) {
  const config = {
    sent: { label: "Email sent", bg: "bg-green-500/15", text: "text-green-400" },
    failed: { label: "Email failed", bg: "bg-red-500/15", text: "text-red-400" },
    skipped: { label: "Email skipped", bg: "bg-white/10", text: "text-[#ECE9E7]/40" },
  }
  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  )
}

function SourceBadge({ source }: { source: Inquiry["source"] }) {
  const config: Record<Inquiry["source"], { label: string; bg: string; text: string }> = {
    "modal": { label: "Concierge Modal", bg: "bg-[#9D5F36]/15", text: "text-[#9D5F36]" },
    "contact-page": { label: "Contact Page", bg: "bg-[#BCA28A]/15", text: "text-[#BCA28A]" },
    "real-estate-modal": { label: "RE Modal", bg: "bg-emerald-500/15", text: "text-emerald-400" },
    "real-estate-contact": { label: "RE Contact Page", bg: "bg-teal-500/15", text: "text-teal-400" },
  }
  const c = config[source]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function InquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>("all")

  useEffect(() => {
    fetch("/api/admin/inquiries")
      .then((r) => r.json())
      .then((data) => setInquiries(data.inquiries || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredInquiries = inquiries.filter((inq) => {
    if (activeTab === "all") return true
    if (activeTab === "str") return !isRESource(inq.source)
    return isRESource(inq.source)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#ECE9E7]/30" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tab strip */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {TABS.map((tab) => {
          const count = inquiries.filter((inq) => {
            if (tab.key === "all") return true
            if (tab.key === "str") return !isRESource(inq.source)
            return isRESource(inq.source)
          }).length
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab.key
                  ? "bg-white/10 text-[#ECE9E7]"
                  : "text-[#ECE9E7]/40 hover:text-[#ECE9E7]/60"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-[10px] opacity-60">{count}</span>
            </button>
          )
        })}
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Mail className="h-7 w-7 text-[#ECE9E7]/20" />
          </div>
          <h3 className="text-[#ECE9E7]/60 font-serif text-lg mb-1">No Inquiries</h3>
          <p className="text-[#ECE9E7]/30 text-sm">
            {activeTab === "all"
              ? "Contact form submissions will appear here."
              : `No ${activeTab === "str" ? "STR" : "real estate"} inquiries yet.`}
          </p>
        </div>
      ) : (
        <>
          <p className="text-[#ECE9E7]/30 text-xs uppercase tracking-wider font-bold">
            {filteredInquiries.length} {filteredInquiries.length === 1 ? "inquiry" : "inquiries"}
          </p>
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-[#232323] border border-white/5 rounded-2xl p-6 space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#9D5F36]/15 flex items-center justify-center shrink-0">
                    <User className="h-4.5 w-4.5 text-[#9D5F36]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#ECE9E7] font-medium truncate">{inq.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#ECE9E7]/50">
                      <a href={`mailto:${inq.email}`} className="inline-flex items-center gap-1.5 hover:text-[#9D5F36] transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                        {inq.email}
                      </a>
                      {inq.phone && (
                        <a href={`tel:${inq.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#9D5F36] transition-colors">
                          <Phone className="h-3.5 w-3.5" />
                          {inq.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <SourceBadge source={inq.source} />
                  <EmailStatusBadge status={inq.email_status} />
                </div>
              </div>

              {/* Experience / Property tag */}
              {inq.experience && (
                <div className="flex items-center gap-2 text-sm text-[#BCA28A]">
                  {isRESource(inq.source) ? (
                    <>
                      <Home className="h-3.5 w-3.5" />
                      <span>Property: {inq.experience}</span>
                    </>
                  ) : (
                    <>
                      <Tag className="h-3.5 w-3.5" />
                      <span>{inq.experience}</span>
                    </>
                  )}
                </div>
              )}

              {/* Message */}
              <div className="flex gap-3">
                <MessageSquare className="h-4 w-4 text-[#ECE9E7]/20 mt-0.5 shrink-0" />
                <p className="text-[#ECE9E7]/70 text-sm leading-relaxed whitespace-pre-wrap">{inq.message}</p>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-[#ECE9E7]/25 text-xs">
                <Clock className="h-3 w-3" />
                {formatDate(inq.created_at)}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
