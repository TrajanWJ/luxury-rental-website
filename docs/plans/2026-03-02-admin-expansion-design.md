# Admin Dashboard Expansion — Design Document

**Date:** 2026-03-02
**Status:** Approved

## Overview

Expand the admin dashboard from a photo-management tool into a full site management system. Three new admin sections: **Property Management** (with Photo Management as a sub-nav), **Site Management**, and **Concierge Partners**. Plus **Activity Log** and **SEO/Meta per property**.

All new admin-editable data uses an **override layer** — base data stays in `lib/data.ts` and `lib/experiences.ts`, admin edits are stored as overrides in a new `site-config` store (same persistence pattern as `photo-orders`). Runtime merge produces the final values.

## Admin Sidebar Navigation

```
ADMIN SIDEBAR
─────────────────────────
Wilson Premier | Admin

Property Management        ← renamed/expanded section
  ├─ Properties & Settings ← per-property config
  ├─ Photo Management      ← existing photo reorder (sub-nav)
  └─ Recently Deleted      ← existing trash (sub-nav)

Site Management            ← NEW
Concierge Partners         ← NEW
Inquiries                  ← existing
Activity Log               ← NEW
Analytics                  ← existing placeholder
─────────────────────────
View Live Site
Sign Out
```

## Data Architecture

### New Store: `site-config.json` / `site_config` DB table

```json
{
  "propertyOverrides": {
    "suite-retreat": {
      "matterportUrl": "https://my.matterport.com/show/?m=...",
      "matterportEnabled": true,
      "videoUrl": "https://www.youtube.com/watch?v=...",
      "videoEnabled": true,
      "showOnHomepage": true,
      "showOnSite": true,
      "floorPlanImages": ["/images/suite-retreat/floor-plan-1.jpg"],
      "seo": {
        "title": "Suite Retreat | Wilson Premier Properties",
        "description": "A 14,000-SqFt Lakefront Estate...",
        "ogImage": "/images/suite-retreat/suite-retreat-1.jpg"
      }
    }
  },
  "propertyOrder": ["1", "6", "2", "7", "5"],
  "sectionToggles": {
    "str": {
      "hero": true,
      "fullScreenHomes": true,
      "socialStrip": true,
      "pledge": true,
      "insidersGuide": true,
      "conciergeDirectory": true,
      "footerCta": true,
      "bookPage": true,
      "contactPage": true,
      "experiencesPage": true,
      "houseRulesPage": true,
      "mapPage": true
    },
    "realEstate": {
      "lakeOverview": true,
      "lakeLife": true,
      "market": true,
      "featuredListing": true,
      "listedProperties": {
        "1": true,
        "2": true,
        "5": false,
        "6": true,
        "7": false
      }
    }
  },
  "conciergeOverrides": {
    "napoli-at-the-lake": {
      "hidden": false,
      "name": null,
      "description": null
    }
  },
  "conciergeOrder": ["napoli-at-the-lake", "lindas-catering", ...],
  "conciergeAdditions": [
    {
      "id": "new-partner-uuid",
      "name": "New Partner",
      "type": "dining",
      "...": "full experience fields"
    }
  ],
  "activityLog": [
    {
      "action": "Photo order saved for Suite Retreat",
      "timestamp": "2026-03-02T14:30:00Z",
      "user": "Wilson"
    }
  ]
}
```

### Existing Store: `photo-orders.json` (UNCHANGED)

Photo ordering, trash, and inquiry data remain in their existing store. No migration needed.

### Runtime Merge Strategy

```
Final Property = base (lib/data.ts) + override (site-config.propertyOverrides[id])
Final Experiences = base (lib/experiences.ts) + overrides + additions + order + hidden filter
Final Sections = all enabled by default, toggled off via sectionToggles
```

Override fields that are `null` or missing fall through to base data. Only explicitly set values override.

## Page Designs

### Properties & Settings (`/admin`)

Property selector dropdown at top with inline visibility toggles.

Sections (top to bottom):
1. **Visibility** — "Show on homepage" toggle, "Show on site" toggle
2. **Hostaway** — Read-only display of linked hostawayId
3. **3D Virtual Tour** — Checkbox enable + Matterport URL input
4. **Video Walkthrough** — Checkbox enable + YouTube URL input
5. **SEO & Meta** — Page title, meta description, OG image inputs
6. **Floor Plans** — Upload zone + reorderable thumbnail grid
7. **Property Display Order** — Drag-to-reorder list of all properties with visibility indicators

### Photo Management (`/admin/photos`)

The **existing photo reorder system** — moved to its own sub-route but functionally identical. Property dropdown, drag-to-reorder grid, upload, lock positions, set hero.

### Recently Deleted (`/admin/trash`)

Existing trash system — unchanged.

### Site Management (`/admin/site-management`)

Tab switcher: **STR** | **Real Estate**

**STR tab:**
- Homepage Sections: checkboxes for Hero, Properties, Social Strip, Pledge, Insider's Guide, Concierge Directory, Footer CTA
- Site Pages: checkboxes for Book, Contact, Experiences, House Rules, Map

**Real Estate tab:**
- Sections: checkboxes for Lake Overview, Lake Life, Market, Featured Listing
- Listed Properties: per-property checkboxes for real estate listing visibility

### Concierge Partners (`/admin/concierge`)

- "Add Partner" button
- Filter by type dropdown
- Reorderable list with drag handles, visibility eye toggle, edit button per row
- Edit modal: all Experience fields (name, type, description, details, contact, phone, email, website, service, image)
- Override-layer: edits stored in conciergeOverrides, new partners in conciergeAdditions

### Activity Log (`/admin/activity-log`)

- Chronological list of admin actions with timestamp and user
- Actions logged: photo order changes, property setting changes, section toggles, concierge edits, visibility changes
- Simple append-only log, no editing
- Most recent first, paginated or virtual-scrolled

### Floor Plan Lightbox (Public Site)

- New "Floor Plans" button on PropertyModal (alongside "3D View" and "Video Preview")
- Opens a focused lightbox overlay with just the floor plan image(s), clean dark background
- Arrow navigation if multiple floor plans
- Close button returns focus to PropertyModal

## API Design

### New Endpoint: `/api/site-config`

```
GET  /api/site-config              → full config
GET  /api/site-config?section=...  → specific section
POST /api/site-config              → update config (admin auth required)
```

Uses same persistence pattern as photo-orders: DB-first with file-store fallback. Atomic writes. Version-based optimistic locking.

### Public Endpoint: `/api/site-config/public`

```
GET /api/site-config/public → stripped config (no activity log, no admin-only data)
```

Returns only: propertyOverrides, propertyOrder, sectionToggles, conciergeOverrides, conciergeOrder, conciergeAdditions. Used by SiteConfigProvider for client-side rendering.

## Context Provider

### `SiteConfigProvider`

Wraps the app in `layout.tsx` alongside existing DemoProvider and ConciergeProvider.

- Polls `/api/site-config/public` every 5 seconds (admin) or loads once on page load (public)
- Provides hooks: `useSiteConfig()`, `usePropertyConfig(id)`, `useSectionToggle(section)`, `useConciergeConfig()`
- Components check toggles before rendering: `if (!sectionToggle.pledge) return null`

## Backwards Compatibility

- `lib/data.ts` and `lib/experiences.ts` remain the base source of truth
- Photo ordering system completely unchanged
- If site-config store is empty/missing, everything defaults to current behavior (all visible, base data only)
- No breaking changes to existing API endpoints
- Existing admin pages (/admin, /admin/trash, /admin/inquiries) get new routes but same functionality
