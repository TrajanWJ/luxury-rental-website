"use client"

const ENDPOINT = "/api/analytics/events"
const PAGE_VIEW_DEDUPE_WINDOW_MS = 1500

export type PopupType = "booking" | "concierge" | "contact"

interface AnalyticsPayload {
  event: string
  sessionId: string
  timestamp: string
  url: string
  popupType?: PopupType | string
  popupName?: string
  ctaName?: string
  propertyName?: string
  propertySlug?: string
  scrollDepth?: number
  context?: string
}

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = sessionStorage.getItem("wp-session-id")
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem("wp-session-id", id)
  }
  return id
}

function sendPayload(payload: AnalyticsPayload) {
  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, body)
  } else {
    fetch(ENDPOINT, { method: "POST", body, keepalive: true })
  }
}

export function slugifyPropertyName(propertyName: string) {
  return propertyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function trackEvent(event: string, data: Partial<AnalyticsPayload> = {}) {
  try {
    sendPayload({
      event,
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      ...data,
    })
  } catch {}
}

export function trackPageView(pathname: string) {
  try {
    const lastPath = sessionStorage.getItem("wp-last-page-view-path")
    const lastAt = Number(sessionStorage.getItem("wp-last-page-view-at") || "0")
    const now = Date.now()

    if (lastPath === pathname && now - lastAt < PAGE_VIEW_DEDUPE_WINDOW_MS) {
      return
    }

    sessionStorage.setItem("wp-last-page-view-path", pathname)
    sessionStorage.setItem("wp-last-page-view-at", String(now))
  } catch {}

  trackEvent("page_view", { url: pathname })
}

export function trackPopupOpen(popupType: PopupType | string, data: Partial<AnalyticsPayload> = {}) {
  trackEvent("popup_open", { popupType, ...data })
}

export function trackCtaClick(
  ctaName: string,
  options: { propertyName?: string; propertySlug?: string; context?: string } = {}
) {
  trackEvent("cta_click", {
    ctaName,
    propertyName: options.propertyName,
    propertySlug: options.propertySlug ?? (options.propertyName ? slugifyPropertyName(options.propertyName) : undefined),
    context: options.context,
  })
}

export function trackPropertyView(propertyName: string, context?: string) {
  trackEvent("property_view", {
    propertyName,
    propertySlug: slugifyPropertyName(propertyName),
    context,
  })
}

export function trackHeroScrollPast(scrollDepth = 100) {
  try {
    const key = `wp-hero-scroll:${window.location.pathname}`
    if (sessionStorage.getItem(key) === "1") return
    sessionStorage.setItem(key, "1")
  } catch {}

  trackEvent("hero_scroll_past", { scrollDepth })
}
