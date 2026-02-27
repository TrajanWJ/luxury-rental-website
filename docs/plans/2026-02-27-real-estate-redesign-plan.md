# Real Estate Section Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the single-page tabbed real estate section into a multi-page, editorial-style real estate website with dedicated navigation, footer, and 3 distinct pages.

**Architecture:** Create `app/real-estate/layout.tsx` as a shared layout that renders `RealEstateNavigation` and `RealEstateFooter` around all `/real-estate/*` routes. The hub page (`/real-estate`) is content-rich with anchor sections; About Craig (`/real-estate/about`) and Contact (`/real-estate/contact`) are separate pages. The existing `real-estate-hub.tsx` is retired and its content is distributed across the new pages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (hex values in className, not Tailwind color names), Framer Motion, Shadcn/ui primitives, react-hook-form + zod, Lucide React icons.

**Key references:**
- Design doc: `docs/plans/2026-02-27-real-estate-redesign-design.md`
- Brand tokens: `app/globals.css` (:root vars), `brand/brand-tokens.json`
- Existing nav pattern: `components/navigation.tsx` (theme prop, scroll behavior, mobile menu)
- Existing footer pattern: `components/footer-cta.tsx` (social links, dark section)
- Content source: `components/real-estate-hub.tsx` (all copy text, data, sub-components)
- Property data: `lib/data.ts` (Milan Manor = id "6")

**Conventions (from CLAUDE.md):**
- Always use hex values for colors, not Tailwind names (e.g., `bg-[#9D5F36]` not `bg-rust`)
- `"use client"` on all interactive components
- `cn()` from `@/lib/utils` for conditional classes
- Component files: lowercase-hyphenated. Component names: PascalCase
- Fonts: `font-serif` = Playfair Display (headings), `font-sans` = Work Sans (body)
- Path alias: `@/` = project root

**Assets already in place:**
- `/public/real-estate/craig-headshot.jpg`
- `/public/real-estate/remax-logo-minimal.png` (grey/black)
- `/public/real-estate/remax-logo-full.png` (balloon color)
- Wilson Premier logos at `/public/brand/logo-bold-*.png`

---

## Task 1: Create Real Estate Navigation

**Files:**
- Create: `components/real-estate-navigation.tsx`

This is the dedicated nav bar for all `/real-estate/*` pages. It replaces the vacation rental `Navigation` component entirely when on real estate routes.

**Step 1: Create the component file**

Create `components/real-estate-navigation.tsx` with the following structure:

- **Top bar (brand bar):** Wilson Premier logo (left), small grey/black RE/MAX logo (below/beside WP logo), Craig's headshot as circular avatar + "Contact Craig" CTA button (right). No phone number.
- **Bottom bar (nav links):** About SML (anchor `#about-sml`), SML Life (anchor `#sml-life`), Market (anchor `#market`), About Craig (link `/real-estate/about`), Contact (link `/real-estate/contact`). Far right: subtle "Vacation Rentals" link with left-arrow icon.
- **Scroll behavior:** Fixed position, `z-50`. After 20px scroll, add `backdrop-blur-lg` and opaque background with shadow (matching existing nav pattern from `navigation.tsx` lines 12-43).
- **Mobile:** Hamburger menu. Compact brand bar (logo + avatar). Hamburger opens full nav list.
- **Framer Motion:** Slide-down entrance (`y: -100 → 0`), AnimatePresence on mobile menu.

Key implementation details from the existing nav (`components/navigation.tsx`):
- Heights: `h-[72px] md:h-[98px]` — keep the same for consistency
- The scroll detection pattern (lines 51-81): `useEffect` with `scroll` listener, `setScrolled(window.scrollY > 20)`
- Mobile menu positioned `top-[102px]` absolutely
- All social/nav links use `window.location.href` for cross-page navigation (per CLAUDE.md warning about routing)

```tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "About SML", href: "/real-estate#about-sml", type: "anchor" as const },
  { label: "SML Life", href: "/real-estate#sml-life", type: "anchor" as const },
  { label: "Market", href: "/real-estate#market", type: "anchor" as const },
  { label: "About Craig", href: "/real-estate/about", type: "page" as const },
  { label: "Contact", href: "/real-estate/contact", type: "page" as const },
]

export default function RealEstateNavigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleNavClick = (href: string, type: string) => {
    setMobileOpen(false)
    if (type === "anchor") {
      // If we're already on the hub page, smooth scroll
      if (pathname === "/real-estate") {
        const hash = href.split("#")[1]
        const el = document.getElementById(hash)
        if (el) { el.scrollIntoView({ behavior: "smooth" }); return }
      }
      // Otherwise navigate to the hub page with hash
      window.location.href = href
    } else {
      window.location.href = href
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#ece4d8]/98 shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
            : "bg-[#ece4d8]/95 border-b border-[#1f1d1a]/15"
        )}
      >
        {/* Top Brand Bar */}
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-[48px] md:h-[56px]">
          {/* Left: Logos */}
          <div className="flex items-center gap-4">
            <Link href="/real-estate" className="flex items-center gap-3">
              <img
                src="/brand/logo-bold-charcoal.png"
                alt="Wilson Premier Properties"
                className="h-8 md:h-10 w-auto"
              />
            </Link>
            <div className="hidden md:block h-6 w-px bg-[#1f1d1a]/20" />
            <img
              src="/real-estate/remax-logo-minimal.png"
              alt="RE/MAX Lakefront Realty Inc."
              className="hidden md:block h-5 md:h-6 w-auto opacity-70"
            />
          </div>

          {/* Right: Avatar + CTA */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden border-2 border-[#BCA28A]/50">
              <img
                src="/real-estate/craig-headshot.jpg"
                alt="Craig Wilson"
                className="h-full w-full object-cover"
              />
            </div>
            <Button
              onClick={() => window.location.href = "/real-estate/contact"}
              className="hidden md:inline-flex rounded-full bg-[#9D5F36] text-white text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-2 hover:bg-[#8A5230] transition-colors"
            >
              Contact Craig
            </Button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#2B2B2B]/80"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Bottom Nav Bar (desktop) */}
        <nav className="hidden md:block border-t border-[#1f1d1a]/10">
          <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-[42px]">
            <div className="flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = link.type === "page" && pathname === link.href
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href, link.type)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[12px] uppercase tracking-[0.1em] font-semibold transition-colors",
                      isActive
                        ? "text-[#9D5F36] bg-[#9D5F36]/8"
                        : "text-[#2b2925]/80 hover:text-[#9D5F36] hover:bg-[#9D5F36]/5"
                    )}
                  >
                    {link.label}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => window.location.href = "/"}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] font-semibold text-[#2b2925]/60 hover:text-[#9D5F36] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Vacation Rentals
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-[#f2ebe1] border-t border-[#1f1d1a]/10 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href, link.type)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] uppercase tracking-[0.08em] font-semibold text-[#2b2925]/85 hover:text-[#9D5F36] hover:bg-[#9D5F36]/5 transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-[#1f1d1a]/10 mt-2">
                  <Button
                    onClick={() => { setMobileOpen(false); window.location.href = "/real-estate/contact" }}
                    className="w-full rounded-full bg-[#9D5F36] text-white text-[11px] font-bold uppercase tracking-[0.12em] py-2.5 hover:bg-[#8A5230]"
                  >
                    Contact Craig
                  </Button>
                  <button
                    onClick={() => { setMobileOpen(false); window.location.href = "/" }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold text-[#2b2925]/55 hover:text-[#9D5F36]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Vacation Rentals
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed nav */}
      <div className="h-[48px] md:h-[98px]" />
    </>
  )
}
```

**Step 2: Verify the component compiles**

Run: `cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier" && npx next build 2>&1 | head -30`

If there are import errors, fix them. The key imports to verify: `usePathname` from `next/navigation`, `cn` from `@/lib/utils`, `Button` from `@/components/ui/button`.

**Step 3: Commit**

```bash
git add components/real-estate-navigation.tsx
git commit -m "feat: add RealEstateNavigation component

Dedicated navigation for the real estate section with brand bar,
nav links with anchor support, and Vacation Rentals toggle."
```

---

## Task 2: Create Real Estate Footer

**Files:**
- Create: `components/real-estate-footer.tsx`

**Step 1: Create the component file**

The footer matches the design doc: dark background, Craig's info, 3-column link grid, copyright bar.

```tsx
"use client"

import { motion } from "framer-motion"
import { Facebook, Instagram, Linkedin } from "lucide-react"
import { usePathname } from "next/navigation"

const QUICK_LINKS = [
  { label: "About Craig", href: "/real-estate/about" },
  { label: "Contact", href: "/real-estate/contact" },
  { label: "Vacation Rentals", href: "/" },
]

const EXPLORE_LINKS = [
  { label: "About SML", href: "/real-estate#about-sml" },
  { label: "SML Life", href: "/real-estate#sml-life" },
  { label: "The Market", href: "/real-estate#market" },
]

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/askcraig", icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
]

export default function RealEstateFooter() {
  const pathname = usePathname()

  const handleLinkClick = (href: string) => {
    if (href.startsWith("/real-estate#") && pathname === "/real-estate") {
      const hash = href.split("#")[1]
      const el = document.getElementById(hash)
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return }
    }
    window.location.href = href
  }

  return (
    <footer className="bg-[#1f1d1a] text-[#ECE9E7]">
      {/* Main footer content */}
      <div className="container mx-auto px-6 md:px-12 pt-12 pb-8">
        {/* Craig info row */}
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-xl overflow-hidden border border-[#ECE9E7]/20 flex-shrink-0">
              <img
                src="/real-estate/craig-headshot.jpg"
                alt="Craig Wilson"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-base font-semibold">Craig Wilson</p>
              <p className="text-sm text-[#ECE9E7]/70 mt-0.5">President & Founder</p>
              <p className="text-sm text-[#ECE9E7]/70">Wilson Premier Properties</p>
              <p className="text-xs text-[#D8C6AF]/80 mt-1">RE/MAX Lakefront Realty Inc.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Licensed VA", "NAR", "RVAR"].map((badge) => (
                  <span
                    key={badge}
                    className="rounded-md border border-[#ECE9E7]/18 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#ECE9E7]/65"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[#ECE9E7]/12 my-8" />

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#D8C6AF] font-semibold mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-sm text-[#ECE9E7]/72 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#D8C6AF] font-semibold mb-4">Explore</p>
            <ul className="space-y-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-sm text-[#ECE9E7]/72 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#D8C6AF] font-semibold mb-4">Connect</p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-lg border border-[#ECE9E7]/15 flex items-center justify-center text-[#ECE9E7]/65 hover:text-white hover:border-[#ECE9E7]/30 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-[#ECE9E7]/10">
        <div className="container mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-[#ECE9E7]/55">
          <p>Copyright &copy; 2026 All Rights Reserved | Wilson Premier Properties</p>
          <p className="flex items-center gap-2">
            <span>Smith Mountain Lake Real Estate</span>
            <span className="hidden md:inline">|</span>
            <span>Privacy Policy</span>
            <span className="hidden md:inline">|</span>
            <span>Terms & Disclaimers</span>
            <span className="hidden md:inline">|</span>
            <span>Sitemap</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
```

**Step 2: Commit**

```bash
git add components/real-estate-footer.tsx
git commit -m "feat: add RealEstateFooter component

Dark footer with Craig's info, association badges, 3-column link
grid, social links, and copyright bar."
```

---

## Task 3: Create Real Estate Layout

**Files:**
- Create: `app/real-estate/layout.tsx`

This layout wraps ALL `/real-estate/*` routes with the dedicated navigation and footer. Since the existing `app/layout.tsx` renders Navigation per-page (not in root layout), we simply provide our own nav here.

**Step 1: Create the layout file**

```tsx
import RealEstateNavigation from "@/components/real-estate-navigation"
import RealEstateFooter from "@/components/real-estate-footer"

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f2ece3] text-[#2B2B2B]">
      <RealEstateNavigation />
      {children}
      <RealEstateFooter />
    </div>
  )
}
```

**Step 2: Update `app/real-estate/page.tsx` to remove its own Navigation import**

The current `app/real-estate/page.tsx` (lines 1-11) imports and renders `<Navigation theme="dark" />`. Remove that since the layout now handles navigation.

Modify `app/real-estate/page.tsx`:
```tsx
export default function RealEstatePage() {
  return (
    <main>
      {/* Hub page content will be added in Task 5 */}
      <div className="pt-8 pb-20 container mx-auto px-6 md:px-12">
        <h1 className="font-serif text-4xl">Real Estate — Coming Soon</h1>
      </div>
    </main>
  )
}
```

This is a temporary placeholder. Task 5 will fill in the full hub page content.

**Step 3: Verify the layout works**

Run: `cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier" && npx next build 2>&1 | tail -20`

Verify no errors. Visit `/real-estate` in dev to confirm:
- Real estate nav appears (not vacation rental nav)
- Footer appears at bottom
- No duplicate navigation

**Step 4: Commit**

```bash
git add app/real-estate/layout.tsx app/real-estate/page.tsx
git commit -m "feat: add real estate layout with dedicated nav and footer

Creates shared layout for /real-estate/* routes. Removes vacation
rental Navigation from the real estate page."
```

---

## Task 4: Create Real Estate Hero Component

**Files:**
- Create: `components/real-estate-hero.tsx`

**Step 1: Create the hero component**

Large editorial hero with lake imagery, headline, and CTA. Uses existing patterns from `components/hero.tsx` (parallax, gradient overlays).

```tsx
"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"

export default function RealEstateHero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.3])

  return (
    <section
      ref={ref}
      className="relative min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden"
    >
      {/* Background image with parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-cover bg-center"
        // Use a lake image from the existing public folder
        // Can be replaced with a more specific real estate hero image later
      >
        <div
          className="absolute inset-0 bg-cover bg-[center_40%]"
          style={{ backgroundImage: "url('/luxury-lakefront-estate-sunset-view.jpg')" }}
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/80 via-[#2B2B2B]/30 to-[#2B2B2B]/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2B2B2B]/40 to-transparent" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 container mx-auto px-6 md:px-12 pb-16 md:pb-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#D8C6AF] font-bold mb-4">
            Smith Mountain Lake Real Estate
          </p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#ECE9E7] tracking-tight leading-[1.05] max-w-3xl">
            Lakefront Buying & Selling, Done the Right Way
          </h1>
          <p className="mt-5 text-base md:text-lg text-[#ECE9E7]/80 max-w-xl leading-relaxed">
            Discover Smith Mountain Lake through a thoughtful, relationship-first approach
            to real estate — grounded in transparency, local expertise, and genuine care.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              onClick={() => window.location.href = "/real-estate/contact"}
              className="rounded-full bg-[#9D5F36] text-white text-[11px] font-bold uppercase tracking-[0.13em] px-7 py-3 hover:bg-[#8A5230] transition-colors"
            >
              Contact Craig
            </Button>
            <Button
              onClick={() => {
                const el = document.getElementById("about-sml")
                if (el) el.scrollIntoView({ behavior: "smooth" })
              }}
              variant="outline"
              className="rounded-full border-[#ECE9E7]/50 text-[#ECE9E7] text-[11px] font-bold uppercase tracking-[0.13em] px-7 py-3 hover:bg-[#ECE9E7]/10 transition-colors bg-transparent"
            >
              Explore the Lake
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add components/real-estate-hero.tsx
git commit -m "feat: add RealEstateHero component

Editorial hero with parallax lake imagery, headline, and CTAs
for the real estate hub page."
```

---

## Task 5: Build the Hub Page Content Sections

**Files:**
- Create: `components/real-estate-sections.tsx`

This is the largest task. It contains 4 major content sections that live on the hub page: Lake Overview, Life at the Lake, The Market, and Featured Listing. All content comes from the user's provided copy (currently embedded in `real-estate-hub.tsx`).

**Step 1: Create the sections component file**

Create `components/real-estate-sections.tsx` with all 4 sections as named exports. Each section uses scroll-reveal animations via Framer Motion's `whileInView`.

Key content to extract from `components/real-estate-hub.tsx`:
- Lake facts from `AboutSml` (lines 371-439): acreage, length, shoreline, depth, full pond
- Distance data from `AboutSml`: Lynchburg, Roanoke, Raleigh-Durham, Charlotte, DC, etc.
- Happenings from the `happenings` array (lines 19-40)
- Milan Manor reference from `lib/data.ts` (id "6")
- Market overview, tax rates from the user's provided content (in the design doc)

The file should export:
- `LakeOverviewSection` — id="about-sml"
- `LakeLifeSection` — id="sml-life"
- `MarketSection` — id="market"
- `FeaturedListingSection` — uses Milan Manor from `@/lib/data`

```tsx
"use client"

import { motion } from "framer-motion"
import { Anchor, Fish, Mountain, TreePine, Waves, MapPin, Sun, Snowflake, Leaf, Flower2, type LucideIcon } from "lucide-react"
import { properties } from "@/lib/data"
import { useMemo } from "react"
import Link from "next/link"

/* ─── Animation helpers ─── */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
}

/* ─── Data ─── */
const LAKE_FACTS = [
  { label: "Surface Area", value: "20,600", unit: "acres" },
  { label: "Length", value: "~40", unit: "miles" },
  { label: "Shoreline", value: "500+", unit: "miles" },
  { label: "Avg Depth", value: "~55", unit: "feet" },
  { label: "Max Depth", value: "~250", unit: "feet" },
  { label: "Full Pond", value: "795", unit: "ft above sea level" },
]

const SEASONS = [
  {
    name: "Spring & Summer",
    icon: Sun,
    description: "Warm days and mild nights make this peak season for boating, swimming, and outdoor events. Water temperatures in summer often sit comfortably in the 70s°F.",
  },
  {
    name: "Fall",
    icon: Leaf,
    description: "Cooler air, crisp skies, and vibrant foliage draw both residents and visitors. An especially scenic time for hiking, golf, and quieter boating.",
  },
  {
    name: "Winter",
    icon: Snowflake,
    description: "Winters tend to be mild compared with more northern lakes. Heavy snowfall is rare, and the lake rarely freezes — one reason many homes feature permanent docks.",
  },
]

const ACTIVITIES = [
  {
    title: "Boating & Water Sports",
    icon: Waves,
    body: "With generous surface area and scenic coves, boating, waterskiing, kayaking, paddleboarding, and jet skiing are common pastimes.",
  },
  {
    title: "Fishing",
    icon: Fish,
    body: "The lake supports a robust fishery including largemouth and smallmouth bass, striped bass, crappie, sunfish, catfish, and more.",
  },
  {
    title: "Parks & Trails",
    icon: TreePine,
    body: "Smith Mountain Lake State Park offers swimming areas, hiking and biking trails, picnic sites, cabin rentals, and seasonal programs.",
  },
  {
    title: "Community Events",
    icon: Flower2,
    body: "Seasonal festivals, regattas, fishing tournaments, farmers markets, and community gatherings bring locals and visitors together year-round.",
  },
]

const GOLF_COURSES = [
  {
    name: "Water's Edge Country Club",
    description: "A lakeside championship course known for its rolling terrain, water views, and welcoming club atmosphere.",
  },
  {
    name: "The Waterfront Country Club",
    description: "A private, amenity-rich course offering a classic layout, clubhouse dining, and a strong social calendar.",
  },
  {
    name: "Mariners Landing Country Club",
    description: "A beautifully maintained course set within a gated community, popular with both full-time residents and second-home owners.",
  },
]

const HAPPENINGS = [
  { title: "Spring Home Showcase", timing: "March – April", body: "Private tours, curated previews, and relationship-first planning for high-interest waterfront opportunities." },
  { title: "Lakefront Summer Season", timing: "May – August", body: "Peak boating season and active buyer traffic, with strong demand around premium shoreline inventory." },
  { title: "Fall Strategy Window", timing: "September – November", body: "Foliage season and calmer inventory cycles create an ideal environment for deliberate acquisition decisions." },
  { title: "Winter Planning Cycle", timing: "December – February", body: "Seller prep, positioning, and early-buyer strategy ahead of spring listing velocity." },
]

const TAX_RATES = [
  { county: "Bedford County", rate: "~$0.41 / $100" },
  { county: "Franklin County", rate: "~$0.43 / $100" },
  { county: "Pittsylvania County", rate: "Varies — check local assessor" },
]

const DISTANCES = [
  { city: "Lynchburg, VA", miles: "~30", time: "~45 min" },
  { city: "Roanoke, VA", miles: "~45", time: "~1 hr" },
  { city: "Raleigh–Durham, NC", miles: "~150", time: "~2.5–3 hrs" },
  { city: "Charleston, WV", miles: "~200", time: "~3.5–4 hrs" },
  { city: "Charlotte, NC", miles: "~190", time: "~3.5 hrs" },
  { city: "Fairfax, VA", miles: "~235", time: "~4 hrs" },
  { city: "Washington, D.C.", miles: "~245", time: "~4–4.5 hrs" },
  { city: "Baltimore, MD", miles: "~275", time: "~5 hrs" },
  { city: "Pittsburgh, PA", miles: "~300", time: "~5.5 hrs" },
  { city: "Philadelphia, PA", miles: "~330", time: "~5.5–6 hrs" },
  { city: "Cincinnati, OH", miles: "~350", time: "~6 hrs" },
  { city: "Atlanta, GA", miles: "~370", time: "~6–6.5 hrs" },
  { city: "New York, NY", miles: "~450", time: "~7.5–8 hrs" },
  { city: "Chicago, IL", miles: "~700", time: "~11–12 hrs" },
]

/* ─── Section 1: Lake Overview ─── */
export function LakeOverviewSection() {
  return (
    <section id="about-sml" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div {...fadeUp}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
            Overview & History
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B] max-w-2xl">
            About Smith Mountain Lake
          </h2>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-start">
          <motion.div {...fadeUp} className="space-y-5 text-[#2B2B2B]/85 leading-relaxed">
            <p>
              Smith Mountain Lake is one of Virginia's most scenic and beloved destinations. Stretching
              approximately 40 miles long with more than 500 miles of shoreline and covering some 20,600
              acres, it is the largest lake contained entirely within the Commonwealth of Virginia and the
              second-largest freshwater reservoir in the state.
            </p>
            <p>
              The lake was created in the early 1960s when Smith Mountain Dam was built across the
              Roanoke River to generate hydroelectric power. Construction began in 1960 and was completed
              by 1963, and the lake reached its full elevation — commonly referred to as full pond — at
              795 feet above sea level in 1966.
            </p>
            <p>
              Originally valued for energy production and flood control, Smith Mountain Lake quickly became
              known as a premier recreational and residential destination. Over the decades, its calm
              waters, rolling wooded hills, and abundant opportunities for outdoor activities have attracted
              visitors, second-home owners, and full-time residents alike.
            </p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="rounded-2xl overflow-hidden border border-[#BCA28A]/20">
              <img
                src="/luxury-lakefront-estate-sunset-view.jpg"
                alt="Smith Mountain Lake"
                className="w-full h-[300px] md:h-[400px] object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Facts Grid */}
        <motion.div {...fadeUp} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            SML at a Glance
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {LAKE_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-[#BCA28A]/20 bg-[#f8f4ee] p-4 text-center"
              >
                <p className="text-2xl md:text-3xl font-serif text-[#2B2B2B] tracking-tight">{fact.value}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#2B2B2B]/55 mt-1">{fact.unit}</p>
                <p className="text-[11px] text-[#9D5F36] font-semibold mt-1">{fact.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weather / Seasons */}
        <motion.div {...fadeUp} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            Four-Season Living
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {SEASONS.map((season) => {
              const Icon = season.icon
              return (
                <div
                  key={season.name}
                  className="rounded-xl border border-[#BCA28A]/20 bg-white p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-[#9D5F36]/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#9D5F36]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#2B2B2B]">{season.name}</h3>
                  </div>
                  <p className="text-sm text-[#2B2B2B]/75 leading-relaxed">{season.description}</p>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 2: Life at the Lake ─── */
export function LakeLifeSection() {
  return (
    <section id="sml-life" className="py-16 md:py-24 bg-[#f8f4ee]">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div {...fadeUp}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
            Life at the Lake
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B] max-w-2xl">
            An Outdoor Lifestyle Framed by Water
          </h2>
          <p className="mt-4 text-[#2B2B2B]/75 leading-relaxed max-w-2xl">
            Living at Smith Mountain Lake means enjoying an outdoor lifestyle framed by water, wooded
            landscapes, and a community that feels welcoming year-round. Whether you're launching a
            boat, casting a fishing line, or simply watching the sunset from a dock — the lake offers
            an abundance of activities.
          </p>
        </motion.div>

        {/* Activities Grid */}
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {ACTIVITIES.map((activity, i) => {
            const Icon = activity.icon
            return (
              <motion.div
                key={activity.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl border border-[#BCA28A]/18 bg-white p-6 hover:border-[#9D5F36]/30 hover:shadow-[0_8px_24px_rgba(157,95,54,0.06)] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#9D5F36]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-[#9D5F36]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#2B2B2B]">{activity.title}</h3>
                    <p className="mt-1.5 text-sm text-[#2B2B2B]/72 leading-relaxed">{activity.body}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Golf Courses */}
        <motion.div {...fadeUp} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            Golf at the Lake
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {GOLF_COURSES.map((course) => (
              <div key={course.name} className="rounded-xl border border-[#BCA28A]/18 bg-white p-5">
                <h3 className="text-sm font-semibold text-[#2B2B2B]">{course.name}</h3>
                <p className="mt-2 text-sm text-[#2B2B2B]/72 leading-relaxed">{course.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SML Happenings */}
        <motion.div {...fadeUp} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            SML Happenings — Seasonal Pulse
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HAPPENINGS.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl border border-[#BCA28A]/18 bg-white p-5"
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#9D5F36] font-bold">{item.timing}</p>
                <h3 className="text-sm font-semibold text-[#2B2B2B] mt-2">{item.title}</h3>
                <p className="mt-2 text-sm text-[#2B2B2B]/72 leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pop Culture */}
        <motion.div {...fadeUp} className="mt-10 rounded-xl border border-[#BCA28A]/18 bg-white p-5">
          <p className="text-sm text-[#2B2B2B]/75">
            <span className="font-semibold text-[#2B2B2B]">In Popular Culture:</span>{" "}
            Smith Mountain Lake has appeared in films such as <em>What About Bob?</em> and has been
            featured in television and regional stories highlighting lake life.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 3: The Market ─── */
export function MarketSection() {
  return (
    <section id="market" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div {...fadeUp}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
            The Real Estate Market
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B] max-w-3xl">
            A Diverse & Well-Established Market
          </h2>
        </motion.div>

        <motion.div {...fadeUp} className="mt-8 max-w-3xl space-y-5 text-[#2B2B2B]/85 leading-relaxed">
          <p>
            Set against the foothills of Virginia's Blue Ridge Mountains, Smith Mountain Lake spans more
            than 20,600 acres across Bedford, Franklin, and Pittsylvania counties. Since its creation in
            the 1960s, real estate at Smith Mountain Lake has evolved significantly. What was once primarily
            a recreational destination has grown into a diverse and well-established residential market.
          </p>
          <p>
            Today, buyers will find everything from custom lakefront homes and thoughtfully planned
            developments to low-maintenance communities, condominiums, and townhomes designed for easy
            living. Homes range from charming residences tucked into quiet coves to exceptional luxury
            properties with expansive views, private docks, and beautifully landscaped grounds.
          </p>
          <p>
            While Smith Mountain Lake has grown steadily in popularity, it continues to offer a healthy
            inventory of waterfront and water-access opportunities across a variety of price points. For
            those considering lake living, the market remains accessible, diverse, and full of possibility.
          </p>
        </motion.div>

        {/* Tax Rates */}
        <motion.div {...fadeUp} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            Property Tax Rates (per $100 assessed value)
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {TAX_RATES.map((tax) => (
              <div key={tax.county} className="rounded-xl border border-[#BCA28A]/20 bg-[#f8f4ee] p-5">
                <h3 className="text-sm font-semibold text-[#2B2B2B]">{tax.county}</h3>
                <p className="mt-2 text-xl font-serif text-[#9D5F36]">{tax.rate}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[#2B2B2B]/60">
            These rates are typically well below many urban and suburban areas and contribute to Smith
            Mountain Lake's appeal as a place to live, retire, or enjoy part-time lake life.
          </p>
        </motion.div>

        {/* Distance Table */}
        <motion.div {...fadeUp} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            Driving Distances from Moneta, VA
          </p>
          <div className="rounded-xl border border-[#BCA28A]/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8f4ee] text-left">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#2B2B2B]/60 font-semibold">City</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#2B2B2B]/60 font-semibold">Distance</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#2B2B2B]/60 font-semibold">Drive Time</th>
                </tr>
              </thead>
              <tbody>
                {DISTANCES.map((d, i) => (
                  <tr
                    key={d.city}
                    className={`border-t border-[#BCA28A]/10 ${i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"} hover:bg-[#9D5F36]/5 transition-colors`}
                  >
                    <td className="px-4 py-3 font-medium text-[#2B2B2B]">{d.city}</td>
                    <td className="px-4 py-3 text-[#2B2B2B]/72">{d.miles} miles</td>
                    <td className="px-4 py-3 text-[#2B2B2B]/72">{d.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-[#2B2B2B]/60">
            Drive times may vary based on traffic, route, and season.
          </div>
        </motion.div>

        {/* Why This Matters callout */}
        <motion.div
          {...fadeUp}
          className="mt-10 rounded-2xl border border-[#9D5F36]/20 bg-[#9D5F36]/5 p-6 md:p-8"
        >
          <h3 className="font-serif text-xl text-[#2B2B2B]">Why This Matters</h3>
          <p className="mt-3 text-sm text-[#2B2B2B]/78 leading-relaxed">
            Smith Mountain Lake feels like a true escape, yet it's close enough to make regular visits
            practical. Many owners split time between the lake and nearby cities, while others enjoy
            hosting friends and family who can reach the lake with relative ease. It's a destination
            that feels removed from everyday pace — without ever feeling out of reach.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 4: Featured Listing ─── */
export function FeaturedListingSection() {
  const milan = useMemo(() => properties.find((p) => p.name === "Milan Manor"), [])

  if (!milan) return null

  return (
    <section className="py-16 md:py-24 bg-[#f8f4ee]">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div {...fadeUp}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
            Featured Listing
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
            Milan Manor
          </h2>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 grid lg:grid-cols-[1.3fr_1fr] overflow-hidden rounded-2xl border border-[#BCA28A]/25 bg-[#25221D] shadow-[0_18px_44px_rgba(0,0,0,0.2)]"
        >
          {/* Image */}
          <div className="relative min-h-[280px] md:min-h-[420px]">
            <img src={milan.image} alt={milan.name} className="h-full w-full object-cover" />
            <div className="absolute left-4 top-4 rounded-full border border-[#E7D6C1]/45 bg-[#9D5F36]/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F8F1E8]">
              For Sale
            </div>
          </div>

          {/* Details */}
          <div className="p-6 md:p-10 text-[#ECE9E7]">
            <h3 className="font-serif text-3xl md:text-4xl tracking-tight">
              {milan.name}
            </h3>
            <p className="mt-4 text-[#ECE9E7]/82 leading-relaxed">
              {milan.teaser}
            </p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "Bedrooms", value: String(milan.bedrooms) },
                { label: "Bathrooms", value: String(milan.bathrooms) },
                { label: "Guests", value: String(milan.sleeps) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg bg-[#2B2B2B]/60 border border-[#BCA28A]/28 p-3 text-center"
                >
                  <p className="text-xl font-serif">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#ECE9E7]/60 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Amenity highlights */}
            <div className="mt-5 flex flex-wrap gap-2">
              {milan.amenities.slice(0, 5).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-md border border-[#ECE9E7]/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-[#ECE9E7]/70"
                >
                  {amenity}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/properties/milan-manor-house"
                className="inline-flex items-center justify-center rounded-full bg-[#ECE9E7] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#1f1d1a] hover:bg-white transition-colors"
              >
                View Listing
              </Link>
              <Link
                href="/real-estate/contact"
                className="inline-flex items-center justify-center rounded-full border border-[#ECE9E7]/55 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#ECE9E7] hover:bg-[#ECE9E7]/12 transition-colors"
              >
                Inquire About This Property
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add components/real-estate-sections.tsx
git commit -m "feat: add real estate hub page content sections

Four editorial sections: Lake Overview, Life at the Lake,
Market overview with tax rates and distances, Featured Listing."
```

---

## Task 6: Compose the Hub Page

**Files:**
- Modify: `app/real-estate/page.tsx`

Replace the placeholder content from Task 3 with the actual composed page using the hero and section components.

**Step 1: Rewrite the hub page**

```tsx
import RealEstateHero from "@/components/real-estate-hero"
import {
  LakeOverviewSection,
  LakeLifeSection,
  MarketSection,
  FeaturedListingSection,
} from "@/components/real-estate-sections"

export default function RealEstatePage() {
  return (
    <main>
      <RealEstateHero />
      <LakeOverviewSection />
      <LakeLifeSection />
      <MarketSection />
      <FeaturedListingSection />
    </main>
  )
}
```

Note: This is a server component. All the sections are `"use client"` and handle their own interactivity internally.

**Step 2: Verify the page renders**

Run: `cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier" && npx next dev`

Visit `http://localhost:3000/real-estate` and verify:
- Hero renders with lake image, headline, CTAs
- Scrolling reveals all 4 content sections with animations
- Anchor links from nav jump to correct sections
- Milan Manor featured listing renders with data from `lib/data.ts`
- Footer renders at bottom
- Real estate nav is present (not vacation rental nav)
- Mobile nav works (hamburger, links, CTA)

**Step 3: Commit**

```bash
git add app/real-estate/page.tsx
git commit -m "feat: compose real estate hub page with hero and content sections

Assembles the full hub page: hero, lake overview, lake life,
market data, and featured listing."
```

---

## Task 7: Create About Craig Page

**Files:**
- Create: `app/real-estate/about/page.tsx`

All content from the user's provided bio. Editorial magazine feel with headshot, flowing text, pull quotes, value cards, and expertise section.

**Step 1: Create the page file**

```tsx
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
}

const CLIENT_VALUES = [
  { title: "Steady Guidance", body: "A thoughtful, unhurried approach that helps clients navigate decisions with confidence." },
  { title: "Clear Communication", body: "Transparent, responsive, and straightforward — no jargon, no pressure." },
  { title: "Attention to Detail", body: "From property specifics to long-term considerations, nothing gets overlooked." },
  { title: "Genuinely Invested", body: "Not just a transaction — Craig takes personal pride in every client relationship." },
]

const ASSOCIATIONS = [
  "Licensed in the Commonwealth of Virginia",
  "Member of the National Association of Realtors",
  "Member of the Roanoke Valley Association of REALTORS®",
]

export default function AboutCraigPage() {
  return (
    <main>
      {/* Hero / Intro */}
      <section className="pt-8 md:pt-16 pb-16 md:pb-24 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-16 items-start">
            {/* Headshot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mx-auto lg:mx-0"
            >
              <div className="h-56 w-56 md:h-72 md:w-72 rounded-2xl overflow-hidden border border-[#BCA28A]/25 shadow-[0_12px_32px_rgba(0,0,0,0.1)]">
                <img
                  src="/real-estate/craig-headshot.jpg"
                  alt="Craig Wilson"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>

            {/* Intro text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
                About Craig
              </p>
              <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
                Craig Wilson
              </h1>
              <p className="mt-2 text-lg text-[#9D5F36] font-medium">
                President & Founder, Wilson Premier Properties
              </p>
              <p className="mt-5 text-[#2B2B2B]/80 leading-relaxed max-w-xl">
                Craig Wilson is a trusted real estate advisor at Smith Mountain Lake. His approach
                to real estate is shaped as much by place and community as it is by property itself.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Story */}
      <section className="py-16 md:py-24 bg-[#f8f4ee]">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div {...fadeUp}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-4">
              The Story
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-16">
            <motion.div {...fadeUp} className="space-y-5 text-[#2B2B2B]/85 leading-relaxed">
              <p>
                Originally a native of Ohio, Craig grew up in a community much like Franklin County — where
                relationships mattered, people looked out for one another, and a sense of home ran deeper
                than an address. After building his career and raising his four children in Northern Virginia
                with his wife Angela, he eventually found his way to Smith Mountain Lake, where the pace,
                landscape, and community felt familiar and immediately felt like home again.
              </p>
              <p>
                As a licensed Virginia residential real estate professional, Craig brings a deep, hands-on
                understanding of the Smith Mountain Lake market. He takes a thoughtful, unhurried approach,
                helping clients understand not only the details of a property, but the lifestyle, setting,
                and long-term considerations that come with lake living. His focus is on education,
                transparency, and making sure clients feel comfortable and confident throughout the process.
              </p>
              <p>
                In addition to his residential advisory work, Craig has experience as a residential and
                commercial real estate investor and developer at Smith Mountain Lake featuring expertise in
                hospitality, vacation rentals, and off-lake housing. That background gives him an owner's
                perspective on value and long-term ownership, which he uses to better advise clients while
                keeping decisions straightforward and grounded.
              </p>
              <p>
                Craig is deeply connected to the Smith Mountain Lake community and takes pride in contributing
                to the area where he lives and works. His goal is simple: to offer thoughtful guidance,
                honest advice, and a refined, professional experience for those buying and selling at the lake.
              </p>
            </motion.div>

            {/* Pull quote */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden lg:block"
            >
              <div className="sticky top-32 rounded-2xl border border-[#9D5F36]/20 bg-[#9D5F36]/5 p-6">
                <div className="h-1 w-10 bg-[#9D5F36]/40 rounded-full mb-4" />
                <blockquote className="font-serif text-lg text-[#2B2B2B] leading-relaxed italic">
                  "His goal is simple: to offer thoughtful guidance, honest advice, and a refined,
                  professional experience for those buying and selling at the lake."
                </blockquote>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Clients Value */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div {...fadeUp}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-4">
              What Clients Value
            </p>
            <h2 className="font-serif text-2xl md:text-4xl tracking-tight text-[#2B2B2B]">
              A Relationship-First Approach
            </h2>
            <p className="mt-4 text-[#2B2B2B]/75 leading-relaxed max-w-2xl">
              Clients value Craig's steady guidance, clear communication, and attention to detail. He
              is known for being responsive, easy to work with, and genuinely invested in the people he
              serves — whether helping families find a place to put down roots, assisting buyers in
              finding the right lake retreat, or guiding sellers through an important transition.
            </p>
          </motion.div>

          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {CLIENT_VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl border border-[#BCA28A]/20 bg-[#f8f4ee] p-6 hover:border-[#9D5F36]/30 transition-colors"
              >
                <h3 className="text-base font-semibold text-[#2B2B2B]">{value.title}</h3>
                <p className="mt-2 text-sm text-[#2B2B2B]/72 leading-relaxed">{value.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Associations */}
      <section className="py-16 md:py-24 bg-[#f8f4ee]">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div {...fadeUp}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-4">
              Industry Associations
            </p>
          </motion.div>
          <div className="mt-4 flex flex-wrap gap-3">
            {ASSOCIATIONS.map((assoc) => (
              <motion.div
                key={assoc}
                {...fadeUp}
                className="rounded-xl border border-[#BCA28A]/20 bg-white px-5 py-3"
              >
                <p className="text-sm font-medium text-[#2B2B2B]">{assoc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20 bg-[#2B2B2B]">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-2xl md:text-4xl text-[#ECE9E7] tracking-tight">
              Ready to explore lake living?
            </h2>
            <p className="mt-3 text-[#ECE9E7]/70 max-w-lg mx-auto">
              Whether you're considering a full-time move, a weekend retreat, or a sound investment —
              Craig is here to help you find the right path forward.
            </p>
            <Button
              onClick={() => window.location.href = "/real-estate/contact"}
              className="mt-8 rounded-full bg-[#9D5F36] text-white text-[11px] font-bold uppercase tracking-[0.13em] px-8 py-3 hover:bg-[#8A5230] transition-colors"
            >
              Contact Craig
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
```

**Step 2: Verify the page**

Visit `http://localhost:3000/real-estate/about` and confirm:
- Headshot renders correctly
- All bio sections flow well
- Pull quote is sticky on desktop, hidden on mobile
- Client values cards animate on scroll
- CTA banner links to contact page
- Real estate nav and footer are present (from layout)

**Step 3: Commit**

```bash
git add app/real-estate/about/page.tsx
git commit -m "feat: add About Craig page for real estate section

Full editorial bio page with headshot, story, client values,
industry associations, and CTA banner."
```

---

## Task 8: Create Contact Page with Form & Obfuscation

**Files:**
- Create: `app/real-estate/contact/page.tsx`

Two-column layout: form (left) + RE/MAX office details card (right). Contact info is obfuscated (rendered client-side from string fragments).

**Step 1: Create the page file**

```tsx
"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { CheckCircle, MapPin, Phone, Mail, Facebook } from "lucide-react"

/* ─── Form schema ─── */
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Please provide a brief message"),
})

type ContactFormData = z.infer<typeof contactSchema>

/* ─── Obfuscated contact info ─── */
function useObfuscatedContact() {
  return useMemo(() => ({
    phone: ["5", "4", "0", "-", "2", "8", "1", "-", "3", "1", "8", "8"].join(""),
    email: ["craig", "@", "wilson", "-", "premier", ".", "com"].join(""),
    phoneTel: ["tel:", "5", "4", "0", "2", "8", "1", "3", "1", "8", "8"].join(""),
    emailMailto: ["mailto:", "craig", "@", "wilson", "-", "premier", ".", "com"].join(""),
  }), [])
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const contact = useObfuscatedContact()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    // Simulated submission — replace with real API endpoint later
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitted(true)
  }

  return (
    <main className="pt-8 md:pt-16 pb-16 md:pb-24">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
            Get In Touch
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
            Let's Connect
          </h1>
          <p className="mt-4 text-[#2B2B2B]/75 leading-relaxed max-w-xl">
            Whether you're exploring your options or ready to take the next step, Craig is here
            to help with thoughtful guidance and honest advice.
          </p>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-[#BCA28A]/20 bg-white p-6 md:p-8"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <CheckCircle className="h-12 w-12 text-[#337D58] mx-auto" />
                <h3 className="mt-4 font-serif text-2xl text-[#2B2B2B]">Message Sent</h3>
                <p className="mt-2 text-sm text-[#2B2B2B]/70">
                  Thank you for reaching out. Craig will be in touch shortly.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="mt-6 rounded-full border-[#BCA28A]/40 text-[#2B2B2B] text-[11px] font-bold uppercase tracking-[0.12em]"
                >
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* 2x2 grid: Name, Email, Phone, Subject */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.12em] text-[#2B2B2B]/60 font-semibold">
                      Name *
                    </label>
                    <input
                      {...register("name")}
                      className="mt-1.5 w-full rounded-lg border border-[#BCA28A]/30 bg-white px-4 py-2.5 text-sm text-[#2B2B2B] placeholder:text-[#2B2B2B]/35 focus:border-[#9D5F36]/50 focus:ring-1 focus:ring-[#9D5F36]/20 outline-none transition-colors"
                      placeholder="Your name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-[#AD1D23]">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.12em] text-[#2B2B2B]/60 font-semibold">
                      Email *
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="mt-1.5 w-full rounded-lg border border-[#BCA28A]/30 bg-white px-4 py-2.5 text-sm text-[#2B2B2B] placeholder:text-[#2B2B2B]/35 focus:border-[#9D5F36]/50 focus:ring-1 focus:ring-[#9D5F36]/20 outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-[#AD1D23]">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.12em] text-[#2B2B2B]/60 font-semibold">
                      Phone
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      className="mt-1.5 w-full rounded-lg border border-[#BCA28A]/30 bg-white px-4 py-2.5 text-sm text-[#2B2B2B] placeholder:text-[#2B2B2B]/35 focus:border-[#9D5F36]/50 focus:ring-1 focus:ring-[#9D5F36]/20 outline-none transition-colors"
                      placeholder="(optional)"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.12em] text-[#2B2B2B]/60 font-semibold">
                      Subject *
                    </label>
                    <input
                      {...register("subject")}
                      className="mt-1.5 w-full rounded-lg border border-[#BCA28A]/30 bg-white px-4 py-2.5 text-sm text-[#2B2B2B] placeholder:text-[#2B2B2B]/35 focus:border-[#9D5F36]/50 focus:ring-1 focus:ring-[#9D5F36]/20 outline-none transition-colors"
                      placeholder="How can Craig help?"
                    />
                    {errors.subject && <p className="mt-1 text-xs text-[#AD1D23]">{errors.subject.message}</p>}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-[11px] uppercase tracking-[0.12em] text-[#2B2B2B]/60 font-semibold">
                    Message *
                  </label>
                  <textarea
                    {...register("message")}
                    rows={6}
                    className="mt-1.5 w-full rounded-lg border border-[#BCA28A]/30 bg-white px-4 py-2.5 text-sm text-[#2B2B2B] placeholder:text-[#2B2B2B]/35 focus:border-[#9D5F36]/50 focus:ring-1 focus:ring-[#9D5F36]/20 outline-none transition-colors resize-none"
                    placeholder="Tell Craig about what you're looking for, questions you have, or how he can help..."
                  />
                  {errors.message && <p className="mt-1 text-xs text-[#AD1D23]">{errors.message.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto rounded-full bg-[#9D5F36] text-white text-[11px] font-bold uppercase tracking-[0.13em] px-8 py-3 hover:bg-[#8A5230] transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:sticky lg:top-32"
          >
            <div className="rounded-2xl border border-[#BCA28A]/20 bg-[#e8eff3] p-6 md:p-8">
              {/* RE/MAX balloon logo */}
              <img
                src="/real-estate/remax-logo-full.png"
                alt="RE/MAX Lakefront Realty Inc."
                className="h-14 w-auto mb-6"
              />

              <h3 className="text-[10px] uppercase tracking-[0.18em] text-[#2B2B2B]/50 font-semibold mb-4">
                Contact Details
              </h3>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#9D5F36] mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-[#2B2B2B]/80 leading-relaxed">
                    <p className="font-semibold text-[#2B2B2B]">RE/MAX Lakefront Realty Inc.</p>
                    <p>16451 Booker T. Washington Hwy</p>
                    <p>Moneta, VA 24121</p>
                  </div>
                </div>

                {/* Phone (obfuscated) */}
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#9D5F36] flex-shrink-0" />
                  <a
                    href={contact.phoneTel}
                    className="text-sm font-medium text-[#2B2B2B] hover:text-[#9D5F36] transition-colors"
                  >
                    {contact.phone}
                  </a>
                </div>

                {/* Email (obfuscated) */}
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#9D5F36] flex-shrink-0" />
                  <a
                    href={contact.emailMailto}
                    className="text-sm text-[#2B2B2B] hover:text-[#9D5F36] transition-colors"
                  >
                    {contact.email}
                  </a>
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-3">
                  <Facebook className="h-4 w-4 text-[#9D5F36] flex-shrink-0" />
                  <a
                    href="https://www.facebook.com/askcraig"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#2B2B2B] hover:text-[#9D5F36] transition-colors"
                  >
                    facebook.com/askcraig
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
```

**Important implementation note on obfuscation:** The `useObfuscatedContact` hook assembles contact strings client-side from array fragments. Since this is a `"use client"` component, the assembled strings are never present in the server-rendered HTML that scrapers see. The server sends the JavaScript bundle which constructs the strings at runtime in the browser. This is a simple but effective anti-scraping measure.

**Step 2: Verify**

Visit `http://localhost:3000/real-estate/contact` and confirm:
- Form renders with 2x2 grid (Name, Email, Phone, Subject) + message area
- Validation works (try submitting empty)
- Success state shows after submission
- Contact details card with RE/MAX balloon logo renders on right
- Contact info is clickable (phone calls, email opens mailto)
- View page source — phone and email should NOT appear in the HTML
- Mobile: stacks vertically
- Real estate nav and footer are present

**Step 3: Commit**

```bash
git add app/real-estate/contact/page.tsx
git commit -m "feat: add Contact page with form and obfuscated contact info

Two-column layout: validated form (react-hook-form + zod) and
RE/MAX office details card with anti-scraping contact display."
```

---

## Task 9: Final Integration, Cleanup & Verification

**Files:**
- Verify: All `/real-estate/*` routes
- Verify: Vacation rental nav still works on non-real-estate routes
- Optional cleanup: Old `components/real-estate-hub.tsx` (keep for reference or remove)

**Step 1: Verify all routes**

Run: `cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier" && npx next build 2>&1 | tail -30`

Confirm no build errors. Then in dev mode, verify:

| Route | Check |
|---|---|
| `/real-estate` | Hero, 4 sections, Milan Manor, RE nav, RE footer |
| `/real-estate/about` | Headshot, bio, values, associations, CTA |
| `/real-estate/contact` | Form, validation, RE/MAX card, obfuscated info |
| `/` | Vacation rental nav (NOT real estate nav), all existing functionality |
| `/pledge` | Vacation rental nav, pledge content |
| `/properties/milan-manor-house` | Property page still works |

**Step 2: Verify anchor navigation**

On `/real-estate`:
- Click "About SML" in nav → smooth scrolls to `#about-sml`
- Click "SML Life" in nav → smooth scrolls to `#sml-life`
- Click "Market" in nav → smooth scrolls to `#market`

From `/real-estate/about` or `/real-estate/contact`:
- Click "About SML" in nav → navigates to `/real-estate#about-sml`

**Step 3: Verify mobile responsive**

Check all 3 pages at mobile viewport:
- Nav hamburger works
- All sections stack vertically
- Contact form stacks (form above, details below)
- No horizontal overflow

**Step 4: Decide on old real-estate-hub.tsx**

The old `components/real-estate-hub.tsx` (1153 lines) is no longer imported by any route. Options:
- **Keep for reference** — rename to `real-estate-hub.old.tsx` or leave as-is (it's untracked in git)
- **Delete** — if the new pages fully replace it

The implementing engineer should confirm all content has been migrated before deleting. Key content to verify was transferred:
- All lake facts and metrics
- All distance data
- All happenings data
- Craig's bio text
- Contact form fields
- Milan Manor listing card
- Footer with Craig's info, address, socials, copyright

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete real estate section redesign

Multi-page architecture with dedicated nav, footer, hero, and
3 pages (hub, about, contact). Replaces single-page tabbed layout."
```
