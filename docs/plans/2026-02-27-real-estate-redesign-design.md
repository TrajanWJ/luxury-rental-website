# Real Estate Section Redesign — Design Document

**Date:** 2026-02-27
**Status:** Approved
**Scope:** Full redesign of the `/real-estate` section of Wilson Premier Properties

---

## Overview

Transform the current single-page tabbed real estate component into a multi-page, editorial-style real estate website section. The redesign introduces a dedicated navigation bar, footer, and 3 distinct pages that feel like a professional, standalone real estate site while remaining part of the Wilson Premier Properties ecosystem.

## Architecture

### Page Structure (Approach A: Two Pages + Anchor Nav)

| Route | Purpose |
|---|---|
| `/real-estate` | Main hub — hero, About SML, SML Life, Market, Featured Listing |
| `/real-estate/about` | Craig Wilson's full bio and credentials |
| `/real-estate/contact` | Contact form + RE/MAX office details |

The main hub page is content-rich with multiple anchor sections. Nav links jump to sections within the hub, while About Craig and Contact have their own pages. This creates the feel of a large site with only 3 routes.

### Navigation Behavior

- When on any `/real-estate/*` route, the vacation rental navigation is **completely replaced** by the real estate navigation
- The vacation rental nav retains its existing "Real Estate" link (no changes needed there)
- The real estate nav includes a subtle "Vacation Rentals" link/toggle for returning to the STR side
- This toggle only appears on the real estate section — not bidirectional

---

## Component Design

### 1. Real Estate Navigation (`RealEstateNavigation`)

**Top bar (brand bar):**
- Left: Wilson Premier Properties logo (existing gold/charcoal brand mark)
- Left-below or beside: Small grey/black RE/MAX Lakefront Realty Inc. logo
- Right: Craig's headshot as small circular avatar + "Contact Craig" CTA button (rust colored)
- No phone number in the nav bar

**Bottom bar (nav links):**
- About SML (anchor `#about-sml` on hub)
- SML Life (anchor `#sml-life` on hub)
- Market (anchor `#market` on hub)
- About Craig (link to `/real-estate/about`)
- Contact (link to `/real-estate/contact`)
- Far right: subtle "Vacation Rentals" link with arrow icon
- Future placeholder links can be added with "Coming Soon" tooltips

**Behavior:**
- Fixed position, backdrop-blur on scroll (matching existing nav pattern)
- Framer Motion entrance animation (slide down)
- Mobile: collapses to hamburger menu with compact brand bar

### 2. Main Hub Page (`/real-estate`)

**Hero Section:**
- Full-width editorial hero with lake imagery background
- "Smith Mountain Lake Real Estate" overline
- "Lakefront Buying & Selling, Done the Right Way" headline
- "Contact Craig" CTA button
- Parallax or subtle scroll animation

**#about-sml — Lake Overview:**
- Two-column layout: editorial text (left) + lake imagery (right)
- History and overview of Smith Mountain Lake (from provided copy)
- Quick Facts grid: 20,600 acres, 40 miles, ~55ft avg depth, ~250ft max depth, 795ft full pond, 500+ miles shoreline
- Weather section: 4 season cards (Spring/Summer, Fall, Winter) with descriptions

**#sml-life — Life at the Lake:**
- Activities grid cards: Boating & Water Sports, Fishing, Parks & Trails, Community Events, Golf
- Golf courses feature cards:
  - Water's Edge Country Club
  - The Waterfront Country Club
  - Mariners Landing Country Club
- SML Happenings: seasonal timeline/cards (Spring Home Showcase, Lakefront Summer, Fall Strategy Window, Winter Planning)
- Popular culture mention (What About Bob?)

**#market — The Real Estate Market:**
- Editorial text on market overview (from provided copy)
- Tax rates comparison cards:
  - Bedford County: ~$0.41/$100
  - Franklin County: ~$0.43/$100
  - Pittsylvania County: varies
- Driving distance table (styled, from provided data — Lynchburg through Chicago)
- "Why This Matters" callout section

**Featured Listing — Milan Manor:**
- Large image + details card (adapted from existing `real-estate-hub.tsx` Milan section)
- Property stats, description, CTAs
- "For Sale" badge

### 3. About Craig Page (`/real-estate/about`)

**Hero/Intro:**
- Large headshot (left) + name, title, tagline (right)
- "Craig Wilson — President & Founder, Wilson Premier Properties"

**The Story:**
- Editorial flowing bio text from provided copy
- Ohio roots → Northern Virginia career → Smith Mountain Lake
- His approach: education, transparency, comfort
- Two-column with pull quotes

**What Clients Value:**
- Cards: Steady guidance, Clear communication, Attention to detail, Responsive, Genuinely invested

**Expertise:**
- Residential advisory + investment/development experience
- Hospitality, vacation rentals, off-lake housing background
- Owner's perspective on value

**Industry Associations:**
- Badge/icon style display
- Licensed in Commonwealth of Virginia
- Member of National Association of Realtors
- Member of Roanoke Valley Association of REALTORS

**CTA Banner:**
- "Ready to explore lake living?" + Contact Craig button

### 4. Contact Page (`/real-estate/contact`)

**Layout:** Two-column — form (~60% left), contact details card (~40% right)

**Form (left):**
- Fields in 2x2 grid: Name, Email, Phone, Subject
- Message textarea below
- "Send Message" button (rust color)
- Uses `react-hook-form` + `zod` validation
- Submit: simulated for now (matching existing pattern), upgradable to real backend

**Contact Details Card (right):**
- Full-color RE/MAX balloon logo at top
- Address: RE/MAX Lakefront Realty Inc., 16451 Booker T. Washington Hwy, Moneta, VA 24121
- Phone: 540-281-3188 (obfuscated)
- Email: craig@wilson-premier.com (obfuscated)
- Social: Facebook (askcraig)
- Light background card (subtle blue-grey or linen)

**Mobile:** Stacks vertically — form on top, contact card below

### 5. Real Estate Footer (`RealEstateFooter`)

**Dark background** (`#1f1d1a` or `#2B2B2B`)

**Top section:**
- Craig's headshot (rounded), name, title, Wilson Premier Properties
- RE/MAX Lakefront Realty Inc. text
- Association badges: NAR, RVAR, Licensed VA

**Link grid (3 columns):**
- Quick Links: About Craig, Contact, Vacation Rentals
- Explore: About SML, SML Life, The Market
- Connect: Facebook, Instagram, LinkedIn

**Bottom bar:**
- Copyright 2026 All Rights Reserved | Wilson Premier Properties
- Smith Mountain Lake Real Estate | Privacy Policy | Terms & Disclaimers | Sitemap

---

## Visual Design

### Palette
Maintains the existing Wilson Premier brand palette:
- **Linen** `#ECE9E7` — page backgrounds, light sections
- **Taupe** `#BCA28A` — secondary accents, borders, overlines
- **Rust** `#9D5F36` — CTAs, hover states, accent underlines
- **Charcoal** `#2B2B2B` — text, dark sections (hero, footer)

### Typography
- **Playfair Display** (serif) — headings, editorial headlines
- **Work Sans** (sans-serif) — body text, labels, nav links

### Visual Feel
- Editorial/magazine aesthetic with generous whitespace
- Big imagery, elegant typography, spacious layouts
- Modern with tasteful Framer Motion animations (scroll reveals, entrances, parallax)
- Alternating section backgrounds (white, linen, subtle taupe bands) for visual separation

### Animation Patterns
- Scroll-reveal entrance animations on sections
- Framer Motion `AnimatePresence` for page transitions
- Subtle parallax on hero imagery
- Hover effects on cards and links
- Consistent with existing vacation rental side patterns

---

## Technical Details

### New Components
| Component | Purpose |
|---|---|
| `RealEstateNavigation` | Dedicated nav for `/real-estate/*` routes |
| `RealEstateFooter` | Dedicated footer for real estate pages |
| `RealEstateHero` | Hero section for hub page |
| `RealEstateContactForm` | Form with obfuscated contact display |

### New Routes
| File | Route |
|---|---|
| `app/real-estate/page.tsx` | Hub page (rebuild existing) |
| `app/real-estate/about/page.tsx` | About Craig page (new) |
| `app/real-estate/contact/page.tsx` | Contact page (new) |
| `app/real-estate/layout.tsx` | Shared layout with RE nav + footer |

### Reused from Existing Codebase
- Brand design tokens and CSS custom properties
- Framer Motion animation utilities
- `cn()` utility from `lib/utils.ts`
- Shadcn/ui primitives (Button, Input, Textarea, etc.)
- `react-hook-form` + `zod` validation pattern
- Milan Manor property data from `lib/data.ts`

### Assets
Copy to `/public/real-estate/`:
- `remax-logo-minimal.png` — grey/black (for header)
- `remax-logo-full.png` — balloon color (for contact page)
- `craig-headshot.jpg` — already present

### Contact Info Obfuscation
- Phone and email are rendered client-side only (`"use client"`)
- Values assembled from string parts in JavaScript (e.g., `"craig" + "@" + "wilson-premier.com"`)
- Not present in server-rendered HTML source
- Invisible to email/phone scraping bots

### What Gets Replaced
- `components/real-estate-hub.tsx` — the old single-component tabbed approach is replaced by the new multi-page architecture
- The hub page (`app/real-estate/page.tsx`) is completely rebuilt
- The old inline footer within `real-estate-hub.tsx` is replaced by `RealEstateFooter`

### Layout Strategy
A new `app/real-estate/layout.tsx` wraps all real estate routes with:
- `RealEstateNavigation` (instead of the vacation rental `Navigation`)
- `RealEstateFooter`
- This means the root layout's `Navigation` component needs to be conditionally excluded for `/real-estate/*` routes, or the real estate layout overrides it

---

## Contact Information Reference

- **Phone:** 540-281-3188
- **Email:** craig@wilson-premier.com
- **Address:** 16451 Booker T. Washington Hwy, Moneta, VA 24121
- **Brokerage:** RE/MAX Lakefront Realty Inc.
- **Facebook:** facebook.com/askcraig
- **Associations:** Licensed VA, NAR, RVAR
