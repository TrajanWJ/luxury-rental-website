# Admin Dashboard Redesign — Design Spec

**Date:** 2026-03-10
**Status:** Approved

## Overview

Redesign the Wilson Premier admin dashboard from an organically-grown collection of panels into a polished, function-first admin with clear grouping, guided navigation, and clean separation of concerns.

**Constraints:** Preserve all existing functionality. No SEO fields. Mobile-friendly but not primary target. Center interactive elements slightly for mobile browser chrome.

## Navigation Architecture

**Approach:** Function-First with Property Context

Sidebar organized by what you *do*. Property-scoped pages have a persistent property selector. Each property also has quick-jump links from the Overview page.

```
📊 Dashboard              → /admin
📬 Inquiries              → /admin/inquiries
─────────────
🏠 Overview & Ordering    → /admin/properties
📷 Photos & Media         → /admin/photos
👥 Concierge Partners     → /admin/concierge
─────────────
⚙️ Site Settings          → /admin/site-settings
📈 Analytics              → /admin/analytics
📋 Activity Log           → /admin/activity-log
```

**Route changes:**
- `/admin` → Dashboard (was property settings)
- `/admin/properties` → Overview & Ordering (new — replaces property settings)
- `/admin/photos` → Photos & Media (expanded — absorbs video, matterport, floor plans from old property settings)
- `/admin/site-settings` → renamed from `/admin/site-management`
- `/admin/trash` → accessible from Photos & Media page (link/tab), removed from sidebar

**Removed from sidebar:** Trash (accessed from Photos & Media instead), Analytics placeholder text.

## Page Designs

### 1. Dashboard (`/admin`)

The landing page. Guided overview with functional quick-links.

**Components:**
- **Quick Start banner** — contextual guidance with pill-links to Properties, Photos, Concierge. Dismissible (localStorage flag).
- **Inquiries card** (left) — "New" count badge + "This Month" count. 3 most recent inquiry previews (name, property, time ago). "View All →" links to /admin/inquiries.
- **Recent Activity card** (right) — Last 3-5 admin actions with timestamps and dot indicators (rust = recent, dim = older). "Full Log →" links to /admin/activity-log.
- **Properties at a Glance** (bottom, full width) — Grid of property cards. Each card shows: name, green/red status dot (visible/hidden), media summary line ("12 photos · 3D tour · Video"), quick-jump pill-links to Photos and Settings for that property.

**Layout:** 2-column grid for inquiries + activity, full-width grid below for properties. Stacks to single column on mobile.

### 2. Overview & Ordering (`/admin/properties`)

Unified property visibility and display order.

**Components:**
- **Property list** — drag-to-reorder rows, each containing:
  - Drag handle (grip dots)
  - Position number (mono font)
  - Property name (struck-through + dimmed when hidden)
  - Media summary ("Hostaway #ID · N photos · 3D tour · Video")
  - Inline visibility badges — clickable "Homepage" and "Site-wide" pills (green = visible, red = hidden)
  - Quick-jump links — "Photos" and "Media" pills linking to those pages pre-filtered to this property
- **Tip bar** at bottom — guidance text explaining drag-to-reorder and badge toggling

**Key change from old:** No dropdown selector. All properties visible at once. Visibility and ordering are inline, not in separate sections. Replaces the entire old property-settings.tsx.

### 3. Photos & Media (`/admin/photos`)

Expanded from photo-only to include all property media.

**Components:**
- **Property selector** — dropdown at top (persistent, remembers last selection)
- **Tab bar** — Photos | Video | 3D Tour | Floor Plans
- **Photos tab** — existing drag-to-reorder photo grid + upload + delete (preserve current photo management functionality). "Recently Deleted" link/button opens trash view inline or navigates to /admin/trash.
- **Video tab** — YouTube URL input + enable/disable toggle (moved from old property settings)
- **3D Tour tab** — Matterport URL input + enable/disable toggle (moved from old property settings)
- **Floor Plans tab** — drag-drop upload zone + URL input + floor plan grid with delete (moved from old property settings)

**Key change from old:** All media for a property is in one place with tabs instead of scattered across property settings. Each tab is clean and focused.

### 4. Concierge Partners (`/admin/concierge`)

Minimal changes — this page is already well-structured.

**Refinements:**
- Keep existing filter-by-type, reorder, visibility, edit/add modals
- Match updated card styling (consistent border-radius, spacing, badge styling)
- Ensure mobile layout centers interactive elements

### 5. Site Settings (`/admin/site-settings`)

Renamed from site-management. Same content, slightly reorganized.

**Components:**
- **Homepage Sections card** — existing 7 toggle switches (keep as-is, works well)
- **Email Forwarding card** — STR and RE recipient inputs + save button (keep as-is)
- Visual refresh to match new card/spacing conventions

### 6. Analytics (`/admin/analytics`)

Mostly design-phase. Minimal preparatory implementation.

**Planned metrics:**
- Page visits (total + unique)
- Scroll depth past hero
- Popup/modal open counts (booking, concierge, contact)
- Property page views
- CTA click-through rates

**Implementation scope for this redesign:**
- Design the analytics page layout with placeholder cards for each metric
- Implement a lightweight client-side event tracker (`lib/analytics.ts`) that fires custom events
- Store events via a simple API endpoint (`/api/analytics/events`)
- Wire up 2-3 basic trackers (page view, hero scroll, popup open) as proof of concept
- Full analytics backend and visualization is a separate future task

**Design doc for analytics:** Separate detailed spec to be written during implementation planning.

### 7. Activity Log (`/admin/activity-log`)

No structural changes. Existing component works well.

**Refinements:**
- Match updated card styling
- Add date grouping headers (Today, Yesterday, This Week, Older) instead of flat list

## Shared Patterns

### Property Selector Bar
A shared component used on Photos & Media page. Dropdown selector that remembers the last-selected property in localStorage.

### Card Styling (updated)
All admin cards use consistent:
- `bg-[#1C1C1C]` background
- `border border-white/5` border
- `rounded-2xl` radius
- `p-6` padding (desktop), `p-4` (mobile)
- Section labels: `text-[#ECE9E7]/40 text-[10px] uppercase tracking-wider`

### Save Status Indicator
Shared component (currently duplicated across 3 files). Extract to `components/admin/save-indicator.tsx`.

### Mobile Considerations
- Single-column layout below `lg:` breakpoint
- Interactive elements (buttons, toggles, drag handles) get slight `px` padding increase on mobile to move away from screen edges
- Sidebar hamburger menu stays as-is
- Property cards in dashboard stack vertically on mobile

## Files Affected

**New files:**
- `app/admin/properties/page.tsx` — Overview & Ordering route
- `components/admin/dashboard.tsx` — Dashboard component
- `components/admin/overview-ordering.tsx` — Overview & Ordering component
- `components/admin/property-selector.tsx` — Shared property selector
- `components/admin/save-indicator.tsx` — Shared save status indicator
- `lib/analytics.ts` — Client-side event tracker (preparatory)
- `app/api/analytics/events/route.ts` — Analytics event endpoint (preparatory)
- `docs/plans/2026-03-10-analytics-design.md` — Analytics detailed spec

**Modified files:**
- `components/admin/admin-sidebar.tsx` — New nav structure
- `components/admin/property-settings.tsx` — Gutted/replaced by overview-ordering + photos tabs
- `components/admin/site-management.tsx` — Renamed, visual refresh
- `components/admin/activity-log.tsx` — Date grouping headers
- `app/admin/page.tsx` — Now renders Dashboard instead of PropertySettings
- `app/admin/photos/page.tsx` — Expanded to include media tabs
- `app/admin/site-management/page.tsx` → `app/admin/site-settings/page.tsx`
- `app/admin/layout.tsx` — No structural changes needed

**Removed/deprecated:**
- `app/admin/trash/page.tsx` — Trash accessed from Photos & Media page instead (route can redirect)
- Old property-settings.tsx logic split across overview-ordering.tsx and photos page
