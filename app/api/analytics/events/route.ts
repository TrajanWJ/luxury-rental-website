import fs from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

const DATA_DIR = process.env.PERSISTENT_DATA_DIR || path.join(process.cwd(), "data")
const EVENTS_FILE = path.join(DATA_DIR, "analytics-events.json")

interface AnalyticsEvent {
  event: string
  sessionId: string
  timestamp: string
  url: string
  [key: string]: unknown
}

function readEvents(): AnalyticsEvent[] {
  try {
    if (!fs.existsSync(EVENTS_FILE)) return []
    const data = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"))
    return data.events || []
  } catch {
    return []
  }
}

function writeEvents(events: AnalyticsEvent[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  const tmp = EVENTS_FILE + ".tmp"
  fs.writeFileSync(tmp, JSON.stringify({ events }, null, 2))
  fs.renameSync(tmp, EVENTS_FILE)
}

// POST — unauthenticated, called from public site
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const event: AnalyticsEvent = JSON.parse(body)

    const events = readEvents()
    events.push(event)

    // Prune events older than 30 days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const pruned = events.filter(
      (e) => new Date(e.timestamp) >= cutoff
    )

    writeEvents(pruned)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

// GET — for admin analytics page
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") || "7d"
  const days = range === "30d" ? 30 : 7

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const events = readEvents().filter(
    (e) => new Date(e.timestamp) >= cutoff
  )

  const totalViews = events.filter((e) => e.event === "page_view").length
  const uniqueSessions = new Set(
    events.filter((e) => e.event === "page_view").map((e) => e.sessionId)
  ).size
  const heroScrollPast = events.filter((e) => e.event === "hero_scroll_past").length

  const bookingOpens = events.filter((e) => e.event === "booking_popup_open").length
  const conciergeOpens = events.filter((e) => e.event === "concierge_modal_open").length
  const contactOpens = events.filter((e) => e.event === "contact_modal_open").length

  const propertyViews: Record<string, number> = {}
  for (const e of events.filter((ev) => ev.event === "property_view")) {
    const slug = String(e.slug || e.url || "unknown")
    propertyViews[slug] = (propertyViews[slug] || 0) + 1
  }

  const ctaClicks: Record<string, number> = {}
  for (const e of events.filter((ev) => ev.event === "cta_click")) {
    const label = String(e.label || "unknown")
    ctaClicks[label] = (ctaClicks[label] || 0) + 1
  }

  return NextResponse.json({
    totalViews,
    uniqueSessions,
    heroScrollPast,
    popupOpens: {
      booking: bookingOpens,
      concierge: conciergeOpens,
      contact: contactOpens,
    },
    propertyViews,
    ctaClicks,
  })
}
