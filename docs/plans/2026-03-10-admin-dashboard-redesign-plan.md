# Admin Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin dashboard from an organic pile of feature panels into a polished, function-first admin with guided navigation, clean separation of concerns, and a dashboard landing page.

**Architecture:** Function-First nav with persistent property context. Current property-settings.tsx is split into Overview & Ordering (visibility + display order) and Photos & Media (expanded with tabs for video, 3D tours, floor plans). New dashboard landing page with inquiry previews, activity feed, and property quick-access cards. All existing functionality preserved.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, Lucide icons, existing site-config-store.ts for persistence.

**Spec:** `docs/plans/2026-03-10-admin-dashboard-redesign-design.md`

**Note:** No test framework configured. Verification is visual via `npm run dev` and `npm run build`.

---

## Chunk 1: Foundation — Shared Components & Sidebar

### Task 1: Extract Save Indicator Component

The save status indicator is duplicated in property-settings.tsx, site-management.tsx, and concierge-manager.tsx. Extract to shared component.

**Files:**
- Create: `components/admin/save-indicator.tsx`

- [ ] **Step 1: Create save-indicator.tsx**

```tsx
"use client"

import { Check, Loader2 } from "lucide-react"

interface SaveIndicatorProps {
  status: "idle" | "saving" | "saved"
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === "idle") return null

  return (
    <div className="flex items-center gap-2 text-xs">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-[#BCA28A]" />
          <span className="text-[#BCA28A]">Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Saved</span>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/save-indicator.tsx
git commit -m "feat(admin): extract shared SaveIndicator component"
```

---

### Task 2: Create Property Selector Component

Shared dropdown used on Photos & Media and other property-scoped pages. Remembers last selection in localStorage.

**Files:**
- Create: `components/admin/property-selector.tsx`

- [ ] **Step 1: Create property-selector.tsx**

```tsx
"use client"

import { useState, useEffect } from "react"
import { properties } from "@/lib/data"

const STORAGE_KEY = "admin-selected-property"

interface PropertySelectorProps {
  value?: string
  onChange?: (propertyId: string) => void
}

export function PropertySelector({ value, onChange }: PropertySelectorProps) {
  const [selectedId, setSelectedId] = useState(() => {
    if (value) return value
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || properties[0]?.id || ""
    }
    return properties[0]?.id || ""
  })

  useEffect(() => {
    if (value !== undefined) setSelectedId(value)
  }, [value])

  function handleChange(id: string) {
    setSelectedId(id)
    try { localStorage.setItem(STORAGE_KEY, id) } catch {}
    onChange?.(id)
  }

  return (
    <div className="flex-1">
      <label className="block text-[#ECE9E7]/40 text-[10px] uppercase tracking-wider mb-2">
        Select Property
      </label>
      <select
        value={selectedId}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9D5F36]/50"
      >
        {properties.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export function useSelectedProperty(initialId?: string) {
  const [selectedId, setSelectedId] = useState(() => {
    if (initialId) return initialId
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || properties[0]?.id || ""
    }
    return properties[0]?.id || ""
  })

  const selectedProperty = properties.find((p) => p.id === selectedId) || properties[0]

  function select(id: string) {
    setSelectedId(id)
    try { localStorage.setItem(STORAGE_KEY, id) } catch {}
  }

  return { selectedId, selectedProperty, select }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add components/admin/property-selector.tsx
git commit -m "feat(admin): add shared PropertySelector with localStorage persistence"
```

---

### Task 3: Update Sidebar Navigation

Replace current nav structure with the new function-first grouping. Add section dividers and labels.

**Files:**
- Modify: `components/admin/admin-sidebar.tsx`

- [ ] **Step 1: Rewrite admin-sidebar.tsx with new nav structure**

Replace the `navItems` array and remove the collapsible group logic. New structure:

```
Dashboard, Inquiries | Overview & Ordering, Photos & Media, Concierge Partners | Site Settings, Analytics, Activity Log
```

Key changes:
- Remove `children` / collapsible group concept — all items are flat
- Add `group` labels between sections (rendered as thin dividers with optional labels)
- `/admin` route now = Dashboard
- `/admin/properties` = Overview & Ordering (new route)
- `/admin/photos` stays
- `/admin/site-management` → `/admin/site-settings`
- Remove Trash from sidebar (accessed from Photos page)
- Update `isActive` logic for new routes

The nav items become:
```ts
interface NavSection {
  label?: string
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
}

const navSections: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
    ],
  },
  {
    label: "Properties",
    items: [
      { href: "/admin/properties", label: "Overview & Ordering", icon: Building2 },
      { href: "/admin/photos", label: "Photos & Media", icon: ImageIcon },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/concierge", label: "Concierge Partners", icon: Users },
      { href: "/admin/site-settings", label: "Site Settings", icon: Settings2 },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/activity-log", label: "Activity Log", icon: Activity },
    ],
  },
]
```

Render by iterating `navSections`, inserting dividers with optional labels between groups. Remove all collapsible/chevron logic. Simplify `isActive` — no more special-casing `/admin` children.

- [ ] **Step 2: Verify in dev server**

Run: `npm run dev`
Navigate to `/admin` — sidebar should show new nav structure with section groups.

- [ ] **Step 3: Commit**

```bash
git add components/admin/admin-sidebar.tsx
git commit -m "feat(admin): redesign sidebar with function-first grouped navigation"
```

---

## Chunk 2: Dashboard Landing Page

### Task 4: Create Dashboard Component

The new landing page at `/admin`. Shows inquiry previews, recent activity, property quick-access cards, and a guidance banner.

**Files:**
- Create: `components/admin/dashboard.tsx`

- [ ] **Step 1: Create dashboard.tsx**

This component fetches data from existing endpoints:
- `GET /api/site-config?section=activityLog` for recent activity
- `GET /api/inquiries` for recent inquiries
- `GET /api/site-config` for property overrides (to show visibility status)

Layout structure:
```
┌──────────────────────────────────────────┐
│  Quick Start Banner (dismissible)        │
├────────────────────┬─────────────────────┤
│  Inquiries Card    │  Recent Activity    │
│  - 3 new badge     │  - Last 4 actions   │
│  - 3 previews      │  - "Full Log →"     │
│  - "View All →"    │                     │
├────────────────────┴─────────────────────┤
│  Properties at a Glance                  │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ Prop 1 │ │ Prop 2 │ │ Prop 3 │       │
│  │ 🟢 vis │ │ 🟢 vis │ │ 🔴 hid │       │
│  │ Photos │ │ Photos │ │ Photos │       │
│  └────────┘ └────────┘ └────────┘       │
└──────────────────────────────────────────┘
```

Properties card: iterate `properties` from `lib/data.ts`, cross-reference `config.propertyOverrides` for visibility status, show media summary (count images, check matterportEnabled/videoEnabled). Each property has "Photos" and "Settings" pill-links routing to `/admin/photos?property={id}` and `/admin/properties`.

Quick Start banner: stored in `localStorage` key `admin-quickstart-dismissed`. Shows pill-links to `/admin/properties`, `/admin/photos`, `/admin/concierge`.

Inquiries card: fetch from `/api/inquiries`, show count + 3 most recent. "View All →" links to `/admin/inquiries`.

Activity card: fetch from site-config activityLog, show last 4. "Full Log →" links to `/admin/activity-log`.

Responsive: 2-column grid at `lg:`, single column below. Properties grid: 3-col at `lg:`, 2-col at `md:`, 1-col mobile.

- [ ] **Step 2: Update app/admin/page.tsx to render Dashboard**

Replace `PropertySettings` import with `Dashboard`:

```tsx
"use client"

import { Dashboard } from "@/components/admin/dashboard"

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <Dashboard />
    </div>
  )
}
```

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev`
Navigate to `/admin` — should show dashboard with inquiry previews, activity feed, property cards.

- [ ] **Step 4: Commit**

```bash
git add components/admin/dashboard.tsx app/admin/page.tsx
git commit -m "feat(admin): add dashboard landing page with inquiries, activity, and property overview"
```

---

## Chunk 3: Overview & Ordering Page

### Task 5: Create Overview & Ordering Component

Replaces old property settings visibility/ordering. Unified drag-to-reorder list with inline visibility toggles.

**Files:**
- Create: `components/admin/overview-ordering.tsx`
- Create: `app/admin/properties/page.tsx`

- [ ] **Step 1: Create overview-ordering.tsx**

Port the visibility toggle logic and property ordering from `property-settings.tsx`. Key differences from old:
- No property selector dropdown — shows ALL properties in a single list
- Each row: drag handle, position number, property name (struck-through if hidden), media summary, inline visibility badges (Homepage/Site-wide), quick-jump pills (Photos/Media)
- Drag-to-reorder the whole list
- Visibility badges are clickable toggles (green = visible, red/dim = hidden)

Data flow:
- Fetch `/api/site-config` for `propertyOverrides` and `propertyOrder`
- Use `properties` from `lib/data.ts` for base property info
- Each row reads: `config.propertyOverrides[toKey(property.name)]` for `showOnHomepage`, `showOnSite`
- Media summary: count `property.images.length`, check `override.matterportEnabled`, `override.videoEnabled`, `override.floorPlanImages?.length`

Port from property-settings.tsx:
- `toKey()` helper
- `saveConfig()` function
- `updateOverride()` for visibility toggles
- `updatePropertyOrder()` + drag handlers + `moveProperty()`

Remove from this component (stays in Photos & Media):
- Matterport URL/toggle
- Video URL/toggle
- Floor plan upload/management
- Property selector dropdown

Add tip bar at bottom with guidance text.

- [ ] **Step 2: Create route page**

```tsx
// app/admin/properties/page.tsx
"use client"

import { OverviewOrdering } from "@/components/admin/overview-ordering"

export default function AdminPropertiesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-2xl lg:text-3xl mb-1">Overview & Ordering</h1>
        <p className="text-[#ECE9E7]/40 text-sm">
          Control which properties are visible and how they appear on the site
        </p>
      </div>
      <OverviewOrdering />
    </div>
  )
}
```

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev`
Navigate to `/admin/properties` — should show all properties in a drag-to-reorder list with visibility toggles.

- [ ] **Step 4: Commit**

```bash
git add components/admin/overview-ordering.tsx app/admin/properties/page.tsx
git commit -m "feat(admin): add Overview & Ordering page with unified property list"
```

---

## Chunk 4: Photos & Media Expansion

### Task 6: Expand Photos Page with Media Tabs

Add tabs to the existing photos page: Photos | Video | 3D Tour | Floor Plans. Move media settings from old property-settings.tsx here.

**Files:**
- Create: `components/admin/media-tabs.tsx` — tab bar + Video/3D Tour/Floor Plans tab content
- Modify: `app/admin/photos/page.tsx` — add tab navigation and property selector
- Keep: `components/admin/photo-manager.tsx` — untouched, renders as "Photos" tab content

- [ ] **Step 1: Create media-tabs.tsx**

Contains three sub-components for the non-photo tabs:

**VideoTab:** Port from property-settings.tsx lines 395-444. YouTube URL input + enable/disable toggle. Uses `useCallback` save pattern from property-settings.

**VirtualTourTab:** Port from property-settings.tsx lines 344-393. Matterport URL input + enable/disable toggle.

**FloorPlansTab:** Port from property-settings.tsx lines 446-540. Drag-drop upload zone + URL input + floor plan grid with delete. Include the `FloorPlanUrlInput` sub-component.

Each tab receives `config`, `propertyKey`, `selectedProperty`, `updateOverride`, and `saveConfig` as props from the parent page.

Also export a `TabBar` component:
```tsx
type MediaTab = "photos" | "video" | "3d-tour" | "floor-plans"

function TabBar({ active, onChange }: { active: MediaTab; onChange: (t: MediaTab) => void }) {
  const tabs: { key: MediaTab; label: string; icon: LucideIcon }[] = [
    { key: "photos", label: "Photos", icon: ImageIcon },
    { key: "video", label: "Video", icon: Video },
    { key: "3d-tour", label: "3D Tour", icon: Box },
    { key: "floor-plans", label: "Floor Plans", icon: FileImage },
  ]
  // Render horizontal tab bar with active state styling
}
```

- [ ] **Step 2: Update app/admin/photos/page.tsx**

Restructure to include:
1. Page header with property selector
2. Tab bar (Photos | Video | 3D Tour | Floor Plans)
3. Tab content area — Photos tab renders existing `<PhotoManager />`, other tabs render from media-tabs.tsx

The page manages:
- Selected property (via `useSelectedProperty` hook)
- Active tab state
- Config fetch + save logic (shared across tabs)
- `updateOverride` function (ported from property-settings.tsx)

Also add a "Recently Deleted" link/button in the Photos tab that links to `/admin/trash`.

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev`
Navigate to `/admin/photos` — should show property selector, tab bar, and all four tab contents working.

- [ ] **Step 4: Commit**

```bash
git add components/admin/media-tabs.tsx app/admin/photos/page.tsx
git commit -m "feat(admin): expand Photos page with Video, 3D Tour, and Floor Plans tabs"
```

---

## Chunk 5: Site Settings, Activity Log, Concierge Polish

### Task 7: Rename Site Management → Site Settings

**Files:**
- Create: `app/admin/site-settings/page.tsx`
- Modify: `components/admin/site-management.tsx` — visual refresh to match new card conventions

- [ ] **Step 1: Create new route page**

```tsx
// app/admin/site-settings/page.tsx
"use client"

import { SiteManagement } from "@/components/admin/site-management"

export default function SiteSettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-2xl lg:text-3xl mb-1">Site Settings</h1>
        <p className="text-[#ECE9E7]/40 text-sm">
          Homepage section toggles and email forwarding configuration
        </p>
      </div>
      <SiteManagement />
    </div>
  )
}
```

- [ ] **Step 2: Update site-management.tsx**

Replace inline save indicator with `<SaveIndicator status={saveStatus} />` import. Update padding to `p-6 lg:p-8` pattern. No logic changes.

- [ ] **Step 3: Add redirect from old route**

In `app/admin/site-management/page.tsx`, replace content with a redirect:
```tsx
import { redirect } from "next/navigation"
export default function OldSiteManagementPage() {
  redirect("/admin/site-settings")
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/site-settings/page.tsx components/admin/site-management.tsx app/admin/site-management/page.tsx
git commit -m "feat(admin): rename Site Management to Site Settings with redirect"
```

---

### Task 8: Add Date Grouping to Activity Log

**Files:**
- Modify: `components/admin/activity-log.tsx`

- [ ] **Step 1: Add date grouping logic**

Group entries by: "Today", "Yesterday", "This Week", "Older". Insert group headers between sections.

Add a `getDateGroup(date: Date): string` function:
```ts
function getDateGroup(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  if (date >= today) return "Today"
  if (date >= yesterday) return "Yesterday"
  if (date >= weekAgo) return "This Week"
  return "Older"
}
```

In the render, iterate entries and insert a header `<div>` when the group changes:
```tsx
let lastGroup = ""
{entries.map((entry, i) => {
  const group = getDateGroup(new Date(entry.timestamp))
  const showHeader = group !== lastGroup
  lastGroup = group
  return (
    <>
      {showHeader && (
        <div className="text-[#ECE9E7]/20 text-[10px] uppercase tracking-wider pt-4 pb-1 first:pt-0">
          {group}
        </div>
      )}
      {/* existing entry row */}
    </>
  )
})}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/activity-log.tsx
git commit -m "feat(admin): add date grouping headers to activity log"
```

---

### Task 9: Concierge Visual Polish

**Files:**
- Modify: `components/admin/concierge-manager.tsx`

- [ ] **Step 1: Replace inline save indicator with shared component**

Import `SaveIndicator` from `@/components/admin/save-indicator` and replace the inline save status JSX.

- [ ] **Step 2: Commit**

```bash
git add components/admin/concierge-manager.tsx
git commit -m "refactor(admin): use shared SaveIndicator in concierge manager"
```

---

## Chunk 6: Route Cleanup & Mobile Polish

### Task 10: Clean Up Old Routes and Add Redirects

**Files:**
- Modify: `app/admin/trash/page.tsx` — keep working (still accessible via URL), no changes needed
- Remove old `/admin` PropertySettings import (already done in Task 4)

- [ ] **Step 1: Verify all routes work**

Run `npm run dev` and manually navigate:
- `/admin` → Dashboard
- `/admin/inquiries` → Inquiries
- `/admin/properties` → Overview & Ordering
- `/admin/photos` → Photos & Media (with tabs)
- `/admin/concierge` → Concierge Partners
- `/admin/site-settings` → Site Settings
- `/admin/site-management` → redirects to `/admin/site-settings`
- `/admin/analytics` → Analytics (placeholder)
- `/admin/activity-log` → Activity Log (with date groups)
- `/admin/trash` → Still works

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Clean build, no TypeScript errors.

- [ ] **Step 3: Commit if any fixes were needed**

---

### Task 11: Mobile Polish

**Files:**
- Modify: `components/admin/dashboard.tsx` — responsive grid adjustments
- Modify: `components/admin/overview-ordering.tsx` — mobile row layout

- [ ] **Step 1: Dashboard mobile layout**

Ensure:
- Quick Start banner: pills wrap on small screens, text stacks
- Inquiries + Activity cards: `grid-cols-1 lg:grid-cols-2`
- Property cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- All interactive elements get `px-4` minimum to pull away from screen edges

- [ ] **Step 2: Overview & Ordering mobile layout**

Each property row on mobile:
- Stack into two rows: top row = name + media summary, bottom row = visibility badges
- Drag handle and position number stay inline with name
- Quick-jump pills wrap below
- Add `px-2 sm:px-4` to center content away from edges

- [ ] **Step 3: Photos & Media mobile layout**

Tab bar: horizontally scrollable on mobile (overflow-x-auto, no wrapping). Property selector full-width.

- [ ] **Step 4: Verify on mobile viewport**

Open dev tools, set viewport to 375px width. Navigate all admin pages. Ensure no horizontal overflow, all buttons tappable, content centered away from edges.

- [ ] **Step 5: Commit**

```bash
git add components/admin/dashboard.tsx components/admin/overview-ordering.tsx app/admin/photos/page.tsx
git commit -m "feat(admin): mobile-responsive layout for dashboard and property pages"
```

---

## Chunk 7: Analytics Preparatory Work

### Task 12: Write Analytics Design Doc

**Files:**
- Create: `docs/plans/2026-03-10-analytics-design.md`

- [ ] **Step 1: Write analytics spec**

Document:
- Metrics to track: page views (total + unique via session ID), scroll depth past hero, popup/modal opens (booking, concierge, contact), property page views, CTA clicks
- Client-side tracker: `lib/analytics.ts` — lightweight module that fires events via `navigator.sendBeacon` or `fetch` to `/api/analytics/events`
- API endpoint: `app/api/analytics/events/route.ts` — POST handler that stores events (simple JSON file or Turso table)
- Analytics page: card grid showing each metric with placeholder data
- Session handling: anonymous session ID in sessionStorage

- [ ] **Step 2: Commit**

```bash
git add docs/plans/2026-03-10-analytics-design.md
git commit -m "docs: analytics design spec for admin dashboard"
```

---

### Task 13: Implement Analytics Foundation

**Files:**
- Create: `lib/analytics.ts` — client-side event tracker
- Create: `app/api/analytics/events/route.ts` — event collection endpoint
- Modify: `app/admin/analytics/page.tsx` — replace placeholder with metric cards

- [ ] **Step 1: Create client-side tracker**

```ts
// lib/analytics.ts
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
```

- [ ] **Step 2: Create events API endpoint**

Simple POST handler. Stores events to `data/analytics-events.json` (or Turso if configured). GET handler returns aggregated counts for the analytics page.

- [ ] **Step 3: Update analytics page with metric cards**

Replace "Coming Soon" with a grid of cards showing:
- Total Visits / Unique Visits
- Hero Scroll-Past Rate
- Popup Opens (booking, concierge, contact)
- Property Page Views
- CTA Clicks

Each card: title, big number (or "—" if no data yet), small trend text. Data fetched from GET `/api/analytics/events?summary=true`.

- [ ] **Step 4: Wire up 2-3 basic trackers**

In the main site (not admin), add `trackEvent` calls for:
- Page view: in `app/layout.tsx` or a `components/analytics-tracker.tsx` component
- Hero scroll: in `components/hero.tsx` using IntersectionObserver
- Popup open: in the booking/concierge modal open handlers

- [ ] **Step 5: Verify in dev server**

Navigate the main site, trigger tracked events, then check `/admin/analytics` — should show at least page view counts.

- [ ] **Step 6: Commit**

```bash
git add lib/analytics.ts app/api/analytics/events/route.ts app/admin/analytics/page.tsx
git commit -m "feat(admin): analytics foundation with event tracking and metric cards"
```

---

## Chunk 8: Final Cleanup

### Task 14: Remove Dead Code

**Files:**
- Modify: `components/admin/property-settings.tsx` — can be deleted or kept as empty redirect reference

- [ ] **Step 1: Check if property-settings.tsx is still imported anywhere**

Search for `property-settings` imports. The old `app/admin/page.tsx` should no longer import it (replaced in Task 4). If no imports remain, delete the file.

- [ ] **Step 2: Remove unused imports from sidebar**

Check that `ChevronDown` and `Trash2` are removed from admin-sidebar.tsx imports (no longer needed after collapsible groups removed).

- [ ] **Step 3: Verify full build**

Run: `npm run build`
Expected: Clean build, zero TypeScript errors, zero unused import warnings.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore(admin): remove dead code from old property settings and sidebar"
```

---

## Execution Order

Tasks 1-3 must be sequential (foundation before pages).
Tasks 4-6 can be parallelized (Dashboard, Overview, Photos are independent).
Tasks 7-9 can be parallelized (Site Settings, Activity Log, Concierge are independent).
Task 10 depends on all prior tasks.
Task 11 depends on Task 10.
Tasks 12-13 are independent of everything else.
Task 14 is last.

```
[1] → [2] → [3] → ┬→ [4] ─┐
                    ├→ [5] ─┤
                    ├→ [6] ─┤→ [10] → [11] → [14]
                    ├→ [7] ─┤
                    ├→ [8] ─┤
                    └→ [9] ─┘
               [12] → [13] ───────────────────┘
```
