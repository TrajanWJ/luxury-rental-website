# Analytics — Design Spec

**Date:** 2026-03-10
**Status:** Draft

## Overview

Add lightweight, privacy-respecting analytics to Wilson Premier Properties. The goal is to give the property owner visibility into how visitors interact with the site — which pages are popular, how far they scroll, and whether key calls-to-action are being clicked — without relying on third-party tracking scripts or storing any personally identifiable information.

The analytics page at `/admin/analytics` currently shows a "Coming Soon" placeholder. This document defines the full design from the client-side tracker through the API and admin UI.

---

## Metrics to Track

### 1. Page Views
Total visits and unique visits (unique = distinct anonymous session IDs per URL) across all pages.

### 2. Hero Scroll-Past Rate
Percentage of visitors who scroll past the hero section on the home page. Tracked via `IntersectionObserver` on a sentinel element at the bottom of the hero. Useful for measuring whether the hero engages visitors enough to continue.

### 3. Popup / Modal Opens
Count of opens for each modal type:
- Booking popup
- Concierge modal
- Contact modal

### 4. Property Page Views
Per-property detail page view counts, allowing the owner to see which properties attract the most interest.

### 5. CTA Click-Through Rates
Click counts on major calls-to-action, normalized against page views to produce a percentage:
- Book Now (hero and property cards)
- Contact (hero and footer CTA)
- View Details (property cards)

---

## Event Schema

```ts
interface AnalyticsEvent {
  event: string        // "page_view" | "hero_scroll_past" | "popup_open" | "cta_click"
  sessionId: string    // anonymous session UUID (ephemeral, not stored beyond session)
  timestamp: string    // ISO 8601
  url: string          // page pathname (no query string to avoid leaking PII)
  data?: {
    popupType?: string   // "booking" | "concierge" | "contact"
    ctaName?: string     // "book-now" | "contact-hero" | "view-details" etc.
    propertyId?: string  // for property page views and property CTA clicks
    scrollDepth?: number // percentage 0–100, for scroll-past events
  }
}
```

Event names are a closed set; unknown event names are rejected by the API.

---

## Architecture

### Client-Side Tracker: `lib/analytics.ts`

A lightweight module (~1KB minified) responsible for generating/retrieving the session ID and sending events to the API.

**Session ID:**
- Generated with `crypto.randomUUID()` on first call within a browser session
- Stored in `sessionStorage` (cleared on tab close, never persisted to `localStorage`)
- Never sent to any third-party service

**Transport:**
- Primary: `navigator.sendBeacon('/api/analytics/events', payload)` — fire-and-forget, survives page unload
- Fallback: `fetch('/api/analytics/events', { method: 'POST', keepalive: true, body: payload })` for browsers without `sendBeacon`

**Public API:**
```ts
// Track an arbitrary event
trackEvent(event: string, data?: Record<string, unknown>): void

// Convenience wrappers (optional, for cleaner call sites)
trackPageView(pathname: string): void
trackPopupOpen(popupType: "booking" | "concierge" | "contact"): void
trackCtaClick(ctaName: string, propertyId?: string): void
trackHeroScrollPast(scrollDepth: number): void
```

### API Endpoint: `app/api/analytics/events/route.ts`

**POST `/api/analytics/events`**
- Accepts a single `AnalyticsEvent` JSON payload
- Validates: required fields present, `event` is a known type, `timestamp` is a valid ISO date
- Appends the validated event to `data/analytics-events.json`
- Prunes events older than 30 days on every write (retention policy)
- Returns `204 No Content` on success; `400` with error detail on validation failure
- No authentication required (events are write-only from the public site)

**GET `/api/analytics/events?summary=true&range=7d`**
- Authenticated (admin session required, same pattern as other admin APIs)
- Query params:
  - `summary=true` — return aggregated counts rather than raw events
  - `range=7d | 30d` — time window (defaults to `7d`)
- Returns aggregated summary (see Summary Shape below)

**Summary Shape:**
```ts
interface AnalyticsSummary {
  range: "7d" | "30d"
  totalPageViews: number
  uniqueSessionPageViews: number
  heroScrollPastRate: number        // percentage (0–100)
  popupOpens: {
    booking: number
    concierge: number
    contact: number
  }
  propertyPageViews: Record<string, number>  // propertyId → count
  ctaClicks: Record<string, number>          // ctaName → count
  ctaClickRates: Record<string, number>      // ctaName → % of page views
  comparisonPeriod?: {                       // same shape for the prior period
    totalPageViews: number
    uniqueSessionPageViews: number
    heroScrollPastRate: number
    // ... etc
  }
}
```

### Storage: `data/analytics-events.json`

Simple append-only JSON array of `AnalyticsEvent` objects. Written atomically (write to temp file, rename) to avoid corruption.

```json
[
  {
    "event": "page_view",
    "sessionId": "a1b2c3d4-...",
    "timestamp": "2026-03-10T14:32:00Z",
    "url": "/",
    "data": {}
  }
]
```

**Retention:** On each POST write, events older than 30 days are pruned before the new event is appended. This bounds file size to roughly 30 days × estimated daily event volume.

**Upgrade Path:** The same read/write interface can be backed by Turso (libSQL) using the same pattern as `lib/site-config-store.ts`. A `ANALYTICS_STORAGE` env var could switch between `"file"` (default/dev) and `"turso"` (production). The API route is the only place that touches storage, so the migration is isolated.

---

## Admin UI: `app/admin/analytics/page.tsx`

Replaces the "Coming Soon" placeholder with a functional dashboard.

### Layout

```
┌─────────────────────────────────────────────────────┐
│ Analytics                          [7 Days] [30 Days]│
├────────────┬────────────┬────────────┬──────────────┤
│ Page Views │ Unique     │ Hero Scroll│ Popup Opens  │
│   1,204    │ Sessions   │  Past Rate │    87        │
│            │   342      │   68%      │              │
│ +12% vs    │ +8% vs     │ —          │ +3% vs       │
│ prior      │ prior      │            │ prior        │
├────────────┴────────────┴────────────┴──────────────┤
│ Property Page Views         │ CTA Click Rates        │
│ ─────────────────────────── │ ───────────────────────│
│ Lakehouse at the Point  402 │ Book Now       8.2%    │
│ The Lodge               318 │ Contact Hero   3.1%    │
│ Sunset Retreat          241 │ View Details   14.6%   │
│ ...                         │ ...                    │
└─────────────────────────────────────────────────────┘
```

### Components

**Time Range Selector:** Two-button toggle (`Last 7 Days` / `Last 30 Days`). Updates URL search param (`?range=7d`) and re-fetches data via `useEffect`.

**Metric Cards:** Each card shows:
- Metric title (small overline text)
- Big number (current period)
- Comparison line ("↑ 12% vs prior period" in rust, "↓ 5% vs prior period" in muted red, "— no prior data" in taupe)

**Property Views Table:** Simple two-column table (property name, count), sorted descending by count.

**CTA Click Rates Table:** Three-column table (CTA name, click count, rate %), sorted descending by rate.

**Loading State:** Skeleton cards matching the metric card shape.

**Empty State:** "No data yet — analytics will appear once visitors start using the site."

### Data Fetching

```ts
// Client component, fetches on mount and on range change
const { data, isLoading } = useSWR(
  `/api/analytics/events?summary=true&range=${range}`,
  fetcher
)
```

If SWR is not already in the project, use a simple `useEffect` + `fetch` pattern consistent with other admin pages.

---

## Integration Points

### Page View Tracking: `components/analytics-tracker.tsx`

A lightweight client component that calls `trackPageView` on route changes. Rendered once inside `app/layout.tsx` (or `app/admin/layout.tsx` if tracking is only wanted for the public site pages).

```tsx
"use client"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { trackPageView } from "@/lib/analytics"

export function AnalyticsTracker() {
  const pathname = usePathname()
  useEffect(() => { trackPageView(pathname) }, [pathname])
  return null
}
```

### Hero Scroll-Past: `components/hero.tsx`

Add an `IntersectionObserver` targeting a 1px sentinel `<div>` placed at the bottom of the hero section. When the sentinel exits the viewport (threshold 0), fire `trackHeroScrollPast`.

Debounce to fire only once per session (store a `heroScrollTracked` flag in the module or `sessionStorage`).

### Popup Opens

Each modal's open trigger (wherever `open` state transitions to `true`) calls the appropriate tracker:
- Booking popup open → `trackPopupOpen("booking")`
- Concierge modal open → `trackPopupOpen("concierge")`
- Contact modal open → `trackPopupOpen("contact")`

Relevant files: `components/navigation.tsx` (booking popup), `components/concierge-modal.tsx` or similar, contact form trigger.

### CTA Clicks

Add `onClick` handlers (or wrap existing handlers) on major CTA buttons:
- "Book Now" buttons → `trackCtaClick("book-now", propertyId)`
- "Contact" buttons → `trackCtaClick("contact-hero")`
- "View Details" links → `trackCtaClick("view-details", propertyId)`

---

## Privacy Considerations

- No PII is stored at any point. Session IDs are random UUIDs with no link to user identity.
- Session IDs are stored in `sessionStorage` only — they do not persist across tabs or sessions.
- URL pathnames are stored but query strings are stripped before recording.
- The `data/analytics-events.json` file is not publicly accessible (Next.js does not serve files from `data/`).
- No third-party scripts, pixels, or tracking SDKs are used.

---

## Future Considerations

- **Turso migration:** Replace file storage with Turso (libSQL) for multi-instance deployments and better query performance. The API route is the only change required.
- **Real-time dashboard:** Auto-refresh the admin analytics page every 60 seconds, or add a manual refresh button.
- **Export to CSV:** Add a download button on the analytics page that calls `GET /api/analytics/events?export=csv&range=30d`.
- **Referrer tracking:** Record `document.referrer` (domain only, not full URL) to understand traffic sources.
- **Bot filtering:** Simple heuristic — ignore events where the user agent matches known bot patterns (applied server-side in the POST handler).
- **Goal funnels:** Combine page view → popup open → (external booking link click) into a conversion funnel view.
