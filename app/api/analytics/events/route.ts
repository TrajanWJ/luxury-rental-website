import fs from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth"

const DATA_DIR = process.env.PERSISTENT_DATA_DIR || path.join(process.cwd(), "data")
const EVENTS_FILE = path.join(DATA_DIR, "analytics-events.json")
const ALLOWED_EVENTS = new Set([
  "page_view",
  "hero_scroll_past",
  "popup_open",
  "property_view",
  "cta_click",
  "booking_popup_open",
  "concierge_modal_open",
  "contact_modal_open",
])

type RangeKey = "7d" | "30d"

interface AnalyticsEvent {
  event: string
  sessionId: string
  timestamp: string
  url: string
  popupType?: string
  popupName?: string
  ctaName?: string
  propertyName?: string
  propertySlug?: string
  scrollDepth?: number
  context?: string
  label?: string
  slug?: string
  [key: string]: unknown
}

function readEvents(): AnalyticsEvent[] {
  try {
    if (!fs.existsSync(EVENTS_FILE)) return []
    const data = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"))
    return Array.isArray(data?.events) ? data.events : []
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

function isValidTimestamp(value: string) {
  return !Number.isNaN(Date.parse(value))
}

function daysForRange(range: string | null): number {
  return range === "30d" ? 30 : 7
}

function parseRange(range: string | null): RangeKey {
  return range === "30d" ? "30d" : "7d"
}

function normalizeEvent(input: unknown): AnalyticsEvent | null {
  if (!input || typeof input !== "object") return null

  const event = input as Record<string, unknown>
  const rawEventName = String(event.event || "")
  const eventName =
    rawEventName === "booking_popup_open" || rawEventName === "concierge_modal_open" || rawEventName === "contact_modal_open"
      ? "popup_open"
      : rawEventName
  const sessionId = String(event.sessionId || "")
  const timestamp = String(event.timestamp || "")
  const url = String(event.url || "")

  if (!ALLOWED_EVENTS.has(eventName)) return null
  if (!sessionId || !timestamp || !url || !isValidTimestamp(timestamp)) return null

  const popupType =
    rawEventName === "booking_popup_open"
      ? "booking"
      : rawEventName === "concierge_modal_open"
        ? "concierge"
        : rawEventName === "contact_modal_open"
          ? "contact"
          : typeof event.popupType === "string"
            ? event.popupType
            : undefined
  const popupName = typeof event.popupName === "string" ? event.popupName : undefined
  const ctaName = typeof event.ctaName === "string" ? event.ctaName : undefined
  const propertyName = typeof event.propertyName === "string" ? event.propertyName : undefined
  const propertySlug =
    typeof event.propertySlug === "string"
      ? event.propertySlug
      : typeof event.slug === "string"
        ? event.slug
        : undefined

  const normalized: AnalyticsEvent = {
    event: eventName,
    sessionId,
    timestamp: new Date(timestamp).toISOString(),
    url,
  }

  if (popupType) normalized.popupType = popupType
  if (popupName) normalized.popupName = popupName
  if (ctaName) normalized.ctaName = ctaName
  if (propertyName) normalized.propertyName = propertyName
  if (propertySlug) normalized.propertySlug = propertySlug
  if (typeof event.context === "string") normalized.context = event.context
  if (typeof event.scrollDepth === "number") normalized.scrollDepth = event.scrollDepth

  // Backwards compatibility with the earlier flat event format.
  if (typeof event.label === "string" && !normalized.ctaName) normalized.ctaName = event.label
  if (eventName === "popup_open" && !normalized.popupType && typeof event.popupType === "string") {
    normalized.popupType = event.popupType as AnalyticsEvent["popupType"]
  }

  return normalized
}

function withinRange(event: AnalyticsEvent, start: number, end: number) {
  const time = new Date(event.timestamp).getTime()
  return time >= start && time < end
}

function percentage(part: number, whole: number) {
  if (!whole) return 0
  return Number(((part / whole) * 100).toFixed(1))
}

function changePercent(current: number, previous: number) {
  if (!previous) return current > 0 ? null : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function mapToSortedEntries(record: Record<string, number>) {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, value]) => ({ key, value }))
}

function buildSummary(events: AnalyticsEvent[], range: RangeKey) {
  const now = Date.now()
  const days = daysForRange(range)
  const currentStart = now - days * 24 * 60 * 60 * 1000
  const previousStart = currentStart - days * 24 * 60 * 60 * 1000

  const currentEvents = events.filter((event) => withinRange(event, currentStart, now))
  const previousEvents = events.filter((event) => withinRange(event, previousStart, currentStart))

  const summarizePeriod = (periodEvents: AnalyticsEvent[]) => {
    const totalPageViews = periodEvents.filter((event) => event.event === "page_view").length
    const uniqueSessions = new Set(
      periodEvents.filter((event) => event.event === "page_view").map((event) => event.sessionId)
    ).size
    const heroScrollPastCount = periodEvents.filter((event) => event.event === "hero_scroll_past").length
    const popupOpens = { booking: 0, concierge: 0, contact: 0 }
    const popupTypes: Record<string, number> = {}
    const propertyViews: Record<string, number> = {}
    const ctaClicks: Record<string, number> = {}
    const pageViews: Record<string, number> = {}

    for (const event of periodEvents) {
      if (event.event === "popup_open" && event.popupType) {
        popupTypes[event.popupType] = (popupTypes[event.popupType] || 0) + 1
        if (event.popupType === "booking" || event.popupType === "concierge" || event.popupType === "contact") {
          popupOpens[event.popupType] += 1
        }
      }

      if (event.event === "property_view") {
        const propertyKey = event.propertyName || event.propertySlug || event.url || "Unknown"
        propertyViews[propertyKey] = (propertyViews[propertyKey] || 0) + 1
      }

      if (event.event === "cta_click") {
        const ctaKey = event.ctaName || "unknown"
        ctaClicks[ctaKey] = (ctaClicks[ctaKey] || 0) + 1
      }

      if (event.event === "page_view") {
        const pageKey = event.url || "/"
        pageViews[pageKey] = (pageViews[pageKey] || 0) + 1
      }
    }

    const popupOpenCount = Object.values(popupTypes).reduce((total, value) => total + value, 0)
    const popupInstances: Record<string, number> = {}
    for (const event of periodEvents.filter((item) => item.event === "popup_open")) {
      const popupKey = event.popupName || event.popupType || "unknown"
      const instanceKey = event.context || event.propertyName || event.url || "general"
      const compositeKey = `${popupKey}__${instanceKey}`
      popupInstances[compositeKey] = (popupInstances[compositeKey] || 0) + 1
    }
    const ctaClickRates = Object.fromEntries(
      Object.entries(ctaClicks).map(([key, value]) => [key, percentage(value, totalPageViews)])
    )

    return {
      totalPageViews,
      uniqueSessions,
      heroScrollPastCount,
      heroScrollPastRate: percentage(heroScrollPastCount, totalPageViews),
      popupOpenCount,
      popupOpens,
      popupTypes,
      popupInstances,
      propertyViews,
      ctaClicks,
      ctaClickRates,
      pageViews,
    }
  }

  const current = summarizePeriod(currentEvents)
  const previous = summarizePeriod(previousEvents)

  return {
    range,
    generatedAt: new Date(now).toISOString(),
    totalEvents: currentEvents.length,
    totalPageViews: current.totalPageViews,
    uniqueSessions: current.uniqueSessions,
    heroScrollPastCount: current.heroScrollPastCount,
    heroScrollPastRate: current.heroScrollPastRate,
    popupOpenCount: current.popupOpenCount,
    popupOpens: current.popupOpens,
    popupTypeRows: mapToSortedEntries(current.popupTypes),
    popupRows: mapToSortedEntries(current.popupInstances).map(({ key, value }) => {
      const [popupName, instance] = key.split("__")
      return {
        popupName,
        instance,
        value,
      }
    }),
    propertyViews: current.propertyViews,
    propertyViewRows: mapToSortedEntries(current.propertyViews),
    ctaClicks: current.ctaClicks,
    ctaClickRates: current.ctaClickRates,
    ctaRows: mapToSortedEntries(current.ctaClicks).map(({ key, value }) => ({
      key,
      value,
      rate: current.ctaClickRates[key] || 0,
    })),
    pageViews: current.pageViews,
    pageViewRows: mapToSortedEntries(current.pageViews),
    comparison: {
      totalPageViews: changePercent(current.totalPageViews, previous.totalPageViews),
      uniqueSessions: changePercent(current.uniqueSessions, previous.uniqueSessions),
      heroScrollPastRate: changePercent(current.heroScrollPastRate, previous.heroScrollPastRate),
      popupOpenCount: changePercent(current.popupOpenCount, previous.popupOpenCount),
    },
  }
}

async function isAdminRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifySessionToken(token)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const event = normalizeEvent(body)

    if (!event) {
      return NextResponse.json({ ok: false, error: "Invalid analytics event" }, { status: 400 })
    }

    const events = readEvents()
    events.push(event)

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    writeEvents(events.filter((item) => new Date(item.timestamp).getTime() >= cutoff))

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed analytics payload" }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const range = parseRange(searchParams.get("range"))
  const summary = buildSummary(readEvents(), range)

  return NextResponse.json(summary)
}
