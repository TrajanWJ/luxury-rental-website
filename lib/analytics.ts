"use client"

const ENDPOINT = "/api/analytics/events"

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = sessionStorage.getItem("wp-session-id")
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem("wp-session-id", id)
  }
  return id
}

export function trackEvent(event: string, data?: Record<string, unknown>) {
  try {
    const payload = JSON.stringify({
      event,
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      ...data,
    })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, payload)
    } else {
      fetch(ENDPOINT, { method: "POST", body: payload, keepalive: true })
    }
  } catch {}
}
