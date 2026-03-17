# Nav A/B Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace both `navigation.tsx` and `real-estate-navigation.tsx` with a unified B1 two-row nav (brand bar + context bar) supporting A/B variants switchable via a floating picker — preserving all existing hooks, events, and logic.

**Architecture:** A new `NavVariantContext` persists the chosen variant (`'A'|'B'`) to localStorage and provides it throughout the app. `navigation.tsx` and `real-estate-navigation.tsx` are refactored in-place to consume variant tokens — no file splits, no event system changes. A floating `NavABPicker` button renders in both layouts so the user can switch at any time.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4, Framer Motion, existing contexts (`useConcierge`, `usePhotoOrder`, `useREContact`)

---

## Variant Spec

| Token | A — Refined Current | B — Editorial Luxury |
|-------|--------------------|--------------------|
| Brand bar height | 60px desktop / 52px mobile | 64px desktop / 56px mobile |
| Context bar height | 38px | 44px |
| Logo height | 50px desktop / 36px mobile | 54px desktop / 40px mobile |
| Link font size | 10px | 11px |
| Link gap | 16px (gap-4) | 24px (gap-6) |
| CTA font size | 10px | 11px |
| CTA padding | px-5 py-2 | px-6 py-2.5 |
| Icon button size | 30px | 32px |
| Total nav height desktop | 98px | 108px |

Both variants share: taupe underline active state, ghost-pill section switcher, left-anchored dropdown (modal trigger only), full-screen mobile overlay with STR/RE grouped sections, both rows go transparent together over the homes section.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `components/nav-variant-context.tsx` | **CREATE** | `NavVariantContext`, `NavVariantProvider`, `useNavVariant()` hook, localStorage persistence |
| `components/nav-ab-picker.tsx` | **CREATE** | Floating bottom-right pill button, toggles A↔B, reads/writes `useNavVariant()` |
| `components/navigation.tsx` | **MODIFY** | Add variant tokens object, split JSX into brand-bar + context-bar rows, fix transparent state, fix mobile to full-screen overlay, left-anchor dropdown |
| `components/real-estate-navigation.tsx` | **MODIFY** | Add variant tokens, match two-row structure, consistent sizing, ghost-pill section switcher |
| `app/layout.tsx` | **MODIFY** | Wrap with `NavVariantProvider`, add `<NavABPicker />` |
| `app/real-estate/layout.tsx` | **MODIFY** | Add `<NavABPicker />` (shares the root `NavVariantProvider`) |

---

## Chunk 1: NavVariantContext + NavABPicker

### Task 1: Create NavVariantContext

**Files:**
- Create: `components/nav-variant-context.tsx`

- [ ] **Step 1: Create the context file**

```tsx
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type NavVariant = "A" | "B"

interface NavVariantContextType {
  variant: NavVariant
  setVariant: (v: NavVariant) => void
}

const NavVariantContext = createContext<NavVariantContextType | undefined>(undefined)

const STORAGE_KEY = "wpp-nav-variant"

export function NavVariantProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<NavVariant>("A")

  // Hydrate from localStorage after mount (avoid SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "A" || stored === "B") {
      setVariantState(stored)
    }
  }, [])

  const setVariant = (v: NavVariant) => {
    setVariantState(v)
    localStorage.setItem(STORAGE_KEY, v)
  }

  return (
    <NavVariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </NavVariantContext.Provider>
  )
}

export function useNavVariant() {
  const ctx = useContext(NavVariantContext)
  if (!ctx) throw new Error("useNavVariant must be used within NavVariantProvider")
  return ctx
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier"
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing errors unrelated to this file).

- [ ] **Step 3: Commit**

```bash
git add components/nav-variant-context.tsx
git commit -m "feat: add NavVariantContext for A/B nav switching"
```

---

### Task 2: Create NavABPicker

**Files:**
- Create: `components/nav-ab-picker.tsx`

- [ ] **Step 1: Create the picker component**

```tsx
"use client"

import { useNavVariant } from "./nav-variant-context"

export function NavABPicker() {
  const { variant, setVariant } = useNavVariant()

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col items-end gap-2">
      {/* Label */}
      <div className="text-[9px] uppercase tracking-[0.14em] text-[#BCA28A]/50 font-semibold">
        Nav Variant
      </div>
      {/* Toggle */}
      <div className="flex rounded-full overflow-hidden border border-[#BCA28A]/25 shadow-xl backdrop-blur-sm bg-[#1e1c19]/90">
        {(["A", "B"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={[
              "px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-200",
              variant === v
                ? "bg-[#9D5F36] text-white"
                : "text-[#BCA28A]/60 hover:text-[#BCA28A]",
            ].join(" ")}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add components/nav-ab-picker.tsx
git commit -m "feat: add NavABPicker floating variant switcher"
```

---

### Task 3: Wire providers into layouts

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/real-estate/layout.tsx`

- [ ] **Step 1: Add NavVariantProvider + NavABPicker to root layout**

In `app/layout.tsx`, add the import:

```tsx
import { NavVariantProvider } from "@/components/nav-variant-context"
import { NavABPicker } from "@/components/nav-ab-picker"
```

Wrap the existing provider tree — `NavVariantProvider` goes **outermost** (outside `DemoProvider`):

```tsx
// app/layout.tsx — updated return
return (
  <html lang="en">
    <body className={`font-sans antialiased ${playfair.variable} ${workSans.variable}`}>
      <NavVariantProvider>
        <DemoProvider>
          <ConciergeProvider>
            <PhotoOrderProvider>
              <SiteConfigProvider>
                {children}
                <ContactModal />
                <AnalyticsTracker />
              </SiteConfigProvider>
            </PhotoOrderProvider>
          </ConciergeProvider>
        </DemoProvider>
        <NavABPicker />
      </NavVariantProvider>
      <Analytics />
      <Script src="https://d2q3n06xhbi0am.cloudfront.net/calendar.js" strategy="afterInteractive" />
      <Script src="/hostaway-debug.js" strategy="afterInteractive" />
    </body>
  </html>
)
```

- [ ] **Step 2: Confirm NavABPicker renders on real-estate pages**

`NavVariantProvider` and `<NavABPicker />` are in `app/layout.tsx` which wraps **all** pages including `/real-estate/*`. No changes needed to `app/real-estate/layout.tsx` — adding it there would render a duplicate picker. Just verify it appears when visiting `/real-estate`.

- [ ] **Step 3: Run dev server and confirm picker renders**

```bash
npm run dev
```

Open http://localhost:3000 — verify the floating "Nav Variant / A / B" pill renders bottom-right. Click B, refresh, confirm B persists (localStorage). Click A to reset.

- [ ] **Step 4: Verify TypeScript + lint**

```bash
npx tsc --noEmit 2>&1 | head -30
npm run lint 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/real-estate/layout.tsx
git commit -m "feat: wire NavVariantProvider and NavABPicker into both layouts"
```

---

## Chunk 2: Refactor navigation.tsx

This is the main STR nav. All existing logic is preserved exactly — we add variant tokens, restructure the JSX into two rows, fix the transparent state, update the mobile menu, and reposition the dropdown.

### Task 4: Add variant tokens and restructure brand bar

**Files:**
- Modify: `components/navigation.tsx`

**Preserve unchanged:**
- All `useEffect` hooks (scroll detection, booking events, concierge flag)
- `searchParams` state and `setSearchParams`
- `scrollToSection`, `goToFooterAndOpenConcierge` functions
- `navLinks` array
- `mobileMenuOpen`, `bookingOpen`, `scrolled`, `homesInView`, `milanInView`, `hoveringProperties` state
- `const showTransparentNav = homesInView && !milanInView` — keep this line, the new JSX uses it
- `AdvancedBookingPopup` at bottom
- All theme variables (`headerBase`, `headerScrolled`, `navText`, `divider`, `dropdownPanel`, `iconBtn`, `desktopBookBtn`)

**Remove after refactor:**
- `const unscrolledShell = ...` (lines ~42–44) — this variable is no longer used in the new JSX; delete it to avoid unused-variable lint errors

- [ ] **Step 1: Add the variant tokens object near top of component (after existing theme vars)**

Add this import at top of file:

```tsx
import { useNavVariant } from "./nav-variant-context"
```

Add inside the component function, after the existing theme var block (after line ~44):

```tsx
const { variant } = useNavVariant()

// Variant sizing tokens — all measurements in one place
const vt = variant === "B"
  ? {
      bbH: "h-[64px]",        // brand bar height desktop
      cbH: "h-[44px]",        // context bar height
      mobBbH: "h-[56px]",     // brand bar height mobile
      logoH: "h-[54px] sm:h-[54px] md:h-[54px]",  // logo height — keep big
      linkSz: "text-[11px]",
      linkGap: "gap-6",
      ctaSz: "text-[11px]",
      ctaPx: "px-6 py-2.5",
      iconSz: "w-8 h-8",      // 32px icons
      spacerH: "h-[108px]",   // total nav height for spacer
    }
  : {
      bbH: "h-[60px]",
      cbH: "h-[38px]",
      mobBbH: "h-[52px]",
      logoH: "h-[50px] sm:h-[50px] md:h-[50px]",
      linkSz: "text-[10px]",
      linkGap: "gap-4",
      ctaSz: "text-[10px]",
      ctaPx: "px-5 py-2",
      iconSz: "w-[30px] h-[30px]",
      spacerH: "h-[98px]",
    }
```

- [ ] **Step 2: Replace the entire JSX return with the two-row structure**

Replace the `return (` block — keep `AdvancedBookingPopup` at bottom, replace everything between the `<motion.nav>` open/close tags:

```tsx
return (
  <>
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.55 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showTransparentNav
          ? "bg-transparent border-b border-transparent"
          : scrolled
          ? `backdrop-blur-[14px] ${headerBase} ${headerScrolled}`
          : `backdrop-blur-lg ${headerBase}`
      }`}
    >
      <div className="w-full max-w-[1920px] mx-auto px-3 md:px-6 lg:px-10">

        {/* ── Brand Bar ── */}
        <div className={`hidden md:flex items-center justify-between ${vt.bbH}`}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-shrink-0 flex items-center"
          >
            <Link href="/" className="block shrink-0">
              <img
                src="/brand/logo-bold-linen.png"
                alt="Wilson Premier"
                className={`${vt.logoH} w-auto object-contain`}
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2"
          >
            {/* Map icon */}
            <button
              onClick={() => (window.location.href = "/map")}
              className={`${vt.iconSz} rounded-full flex items-center justify-center transition-all ${iconBtn}`}
              aria-label="Getting Here - Map"
              title="Getting Here"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </button>
            {/* Concierge icon */}
            <button
              onClick={goToFooterAndOpenConcierge}
              className={`${vt.iconSz} rounded-full flex items-center justify-center transition-all ${iconBtn}`}
              aria-label="Contact Concierge"
              title="Contact Concierge"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            <div className={`w-px h-7 ${divider}`} />

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              onClick={() => setBookingOpen(true)}
              className={`rounded-full border ${vt.ctaPx} ${vt.ctaSz} font-medium uppercase tracking-[0.1em] transition-colors ${desktopBookBtn}`}
            >
              Book Now
            </motion.button>
          </motion.div>
        </div>

        {/* ── Context Bar (desktop) ── */}
        <div className={`hidden md:flex items-center justify-between ${vt.cbH} border-t ${isDark ? "border-[#BCA28A]/9" : "border-[#1f1d1a]/8"}`}>
          <div className={`flex items-center ${vt.linkGap}`}>
            {/* Nav links */}
            {navLinks.map((link, index) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index + 0.2 }}
                onClick={() => {
                  if (link.label === "Concierge") {
                    goToFooterAndOpenConcierge()
                  } else {
                    scrollToSection(link.href)
                  }
                }}
                className={`transition-colors duration-300 font-semibold ${vt.linkSz} uppercase tracking-[0.08em] whitespace-nowrap py-1 ${navText}`}
              >
                {link.label}
              </motion.button>
            ))}

            {/* Retreats dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setHoveringProperties(true)}
              onMouseLeave={() => setHoveringProperties(false)}
            >
              <button
                onClick={() => scrollToSection("#homes")}
                className={`flex items-center gap-1 font-semibold ${vt.linkSz} uppercase tracking-[0.08em] whitespace-nowrap py-1 transition-colors ${navText}`}
              >
                Retreats
                <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${hoveringProperties ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {hoveringProperties && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={`absolute top-full left-0 mt-0 w-72 shadow-2xl overflow-hidden py-2 border ring-1 ring-black/10 ${dropdownPanel}`}
                    style={{ borderRadius: "0 6px 6px 6px" }}
                  >
                    <div className={`px-4 py-2 border-b ${isDark ? "border-[#d8c7af]/15" : "border-[#1f1d1a]/10"}`}>
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-[#ece2d6]/70" : "text-[#25231f]/70"}`}>
                        Our Retreats
                      </span>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {properties.map((prop) => (
                        <button
                          key={prop.id}
                          onClick={() => {
                            setHoveringProperties(false)
                            const section = document.getElementById("homes")
                            if (section) section.scrollIntoView({ behavior: "smooth" })
                            setTimeout(() => {
                              window.dispatchEvent(
                                new CustomEvent("open-property-modal", { detail: { propertyId: prop.id } })
                              )
                            }, 400)
                          }}
                          className="block w-full text-left"
                        >
                          <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${isDark ? "hover:bg-[#d8c7af]/8" : "hover:bg-[#1f1d1a]/6"}`}>
                            <div className={`h-11 w-14 rounded-md overflow-hidden shrink-0 ${isDark ? "bg-[#d8c7af]/10" : "bg-[#1f1d1a]/10"}`}>
                              <img
                                src={photoOrder.getHeroImage(prop)}
                                alt={prop.name}
                                className="h-full w-full object-cover sepia-[.16]"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-[11px] font-serif">{prop.name}</p>
                              <p className={`text-[10px] ${isDark ? "text-[#ece2d6]/70" : "text-[#25231f]/70"}`}>
                                {prop.bedrooms} Beds · {prop.sleeps} Guests
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Real Estate link */}
            <button
              onClick={() => scrollToSection("/real-estate")}
              className={`transition-colors duration-300 font-semibold ${vt.linkSz} uppercase tracking-[0.08em] whitespace-nowrap py-1 ${navText}`}
            >
              Real Estate
            </button>
          </div>

          {/* Ghost pill section switcher */}
          <button
            onClick={() => (window.location.href = "/real-estate")}
            className={`text-[9px] font-medium tracking-[0.06em] whitespace-nowrap border rounded-[10px] px-[10px] py-[2px] transition-colors duration-300 ${
              isDark
                ? "text-[#BCA28A]/30 border-[#BCA28A]/12 hover:text-[#BCA28A]/60 hover:border-[#BCA28A]/25"
                : "text-[#9D5F36]/30 border-[#9D5F36]/15 hover:text-[#9D5F36]/55 hover:border-[#9D5F36]/25"
            }`}
          >
            Real Estate →
          </button>
        </div>

        {/* ── Mobile Bar ── */}
        <div className={`md:hidden flex items-center justify-between ${vt.mobBbH}`}>
          <Link href="/" className="block shrink-0">
            <img
              src="/brand/logo-bold-linen.png"
              alt="Wilson Premier"
              className="h-[36px] w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setBookingOpen(true)}
              className={`rounded-full border px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${desktopBookBtn}`}
              aria-label="Book Now"
            >
              Book
            </button>
            <button
              onClick={() => (window.location.href = "/map")}
              className={`p-2 rounded-full transition-colors ${iconBtn}`}
              aria-label="Getting Here - Map"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </button>
            <button
              onClick={goToFooterAndOpenConcierge}
              className={`p-2 rounded-full transition-colors ${iconBtn}`}
              aria-label="Contact Concierge"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <div className={`w-px h-5 ${divider}`} />
            <button
              className={`flex flex-col justify-center items-center p-2 space-y-1.5 focus:outline-none z-50 transition-colors ${iconBtn}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className={`block w-[22px] h-[1.5px] ${isDark ? "bg-[#f7f0e7]" : "bg-[#1f1d1a]"}`}
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className={`block w-[22px] h-[1.5px] ${isDark ? "bg-[#f7f0e7]" : "bg-[#1f1d1a]"}`}
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className={`block w-[22px] h-[1.5px] ${isDark ? "bg-[#f7f0e7]" : "bg-[#1f1d1a]"}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Full-Screen Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`md:hidden fixed inset-x-0 top-0 bottom-0 z-40 overflow-y-auto ${
              isDark ? "bg-[#1e1c19]/98 backdrop-blur-lg" : "bg-[#ece4d8]/98 backdrop-blur-lg"
            }`}
          >
            {/* Close row */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-[#BCA28A]/10" : "border-[#1f1d1a]/8"}`}>
              <img
                src="/brand/logo-bold-linen.png"
                alt="Wilson Premier"
                className="h-[32px] w-auto object-contain"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded-full transition-colors ${iconBtn}`}
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-5 flex flex-col gap-0">
              {/* Primary CTA */}
              <button
                onClick={() => { setBookingOpen(true); setMobileMenuOpen(false) }}
                className={`w-full py-3.5 text-[13px] rounded-full mb-5 font-semibold tracking-[0.06em] uppercase min-h-[48px] transition-colors ${
                  isDark ? "bg-[#d8c7af] text-[#1f1d1a] hover:bg-[#e8d7bf]" : "bg-[#1f1d1a] text-[#ece4d8] hover:bg-[#2a2723]"
                }`}
              >
                Book a Retreat
              </button>

              {/* Section: Vacation Rentals */}
              <div className={`text-[9px] font-bold uppercase tracking-[0.14em] mb-2 ${isDark ? "text-[#BCA28A]/45" : "text-[#9D5F36]/50"}`}>
                Vacation Rentals
              </div>
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    if (link.label === "Concierge") {
                      goToFooterAndOpenConcierge()
                    } else {
                      scrollToSection(link.href)
                    }
                  }}
                  className={`w-full text-left py-3.5 text-[15px] font-medium border-b min-h-[48px] flex items-center transition-colors ${
                    isDark
                      ? "text-[#ece2d6]/88 hover:text-[#f7f0e7] border-[#BCA28A]/10"
                      : "text-[#25231f]/88 hover:text-[#1f1d1a] border-[#1f1d1a]/10"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => scrollToSection("#homes")}
                className={`w-full text-left py-3.5 text-[15px] font-medium border-b min-h-[48px] flex items-center transition-colors ${
                  isDark
                    ? "text-[#ece2d6]/88 hover:text-[#f7f0e7] border-[#BCA28A]/10"
                    : "text-[#25231f]/88 hover:text-[#1f1d1a] border-[#1f1d1a]/10"
                }`}
              >
                Retreats
              </button>

              {/* Section: Real Estate */}
              <div className={`text-[9px] font-bold uppercase tracking-[0.14em] mt-5 mb-2 ${isDark ? "text-[#BCA28A]/45" : "text-[#9D5F36]/50"}`}>
                Real Estate
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); window.location.href = "/real-estate" }}
                className={`w-full text-left py-3.5 text-[15px] font-medium border-b min-h-[48px] flex items-center justify-between transition-colors ${
                  isDark
                    ? "text-[#ece2d6]/60 hover:text-[#ece2d6]/88 border-[#BCA28A]/10"
                    : "text-[#25231f]/60 hover:text-[#25231f]/88 border-[#1f1d1a]/10"
                }`}
              >
                <span>Craig Wilson · Real Estate</span>
                <span className="text-[12px] opacity-50">→</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>

    {/* Spacer so content doesn't hide under fixed nav */}
    <div className={`hidden md:block ${vt.spacerH}`} />

    <AdvancedBookingPopup
      isOpen={bookingOpen}
      onClose={() => {
        setBookingOpen(false)
        setSearchParams({ location: "", checkIn: "", checkOut: "", guests: "1" })
      }}
      searchParams={searchParams}
    />
  </>
)
```

**Important notes about the spacer div:**
- The existing `app/layout.tsx` does NOT include a spacer — individual pages handle their own offset or the nav is transparent. Check each page that uses this nav and verify it doesn't need additional spacer adjustments.
- The spacer only renders on `md:` and above because mobile has the full-screen overlay and doesn't need the same offset.

- [ ] **Step 3: Add body scroll lock to mobile menu useEffect**

In the existing `useEffect` array, add a new effect after the booking event listeners (around line 130):

```tsx
// Lock body scroll when mobile menu is open
useEffect(() => {
  if (mobileMenuOpen) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = ""
  }
  return () => { document.body.style.overflow = "" }
}, [mobileMenuOpen])
```

- [ ] **Step 4: Verify TypeScript compiles and no lint errors**

```bash
npx tsc --noEmit 2>&1 | head -40
npm run lint 2>&1 | head -40
```

Fix any type errors before continuing.

- [ ] **Step 5: Visual QA on dev server**

```bash
npm run dev
```

Check each scenario:
1. Desktop — scrolled state: both rows visible with blur, taupe underline on current active link
2. Desktop — over homes section: both rows go transparent, links readable at 50% white
3. Desktop — Retreats hover: dropdown opens left-anchored, shows property images, clicking dispatches `open-property-modal` event
4. Desktop — "Real Estate →" ghost pill: barely visible, darkens on hover
5. Mobile — hamburger click: full-screen overlay, closes with × button, has two sections
6. Mobile — Book button: opens AdvancedBookingPopup
7. Variant A vs B: switch with picker, reload, confirm persists

- [ ] **Step 6: Commit**

```bash
git add components/navigation.tsx
git commit -m "feat: refactor STR nav to two-row B1 design with A/B variant support"
```

---

## Chunk 3: Refactor real-estate-navigation.tsx

### Task 5: Apply two-row structure to real estate nav

**Files:**
- Modify: `components/real-estate-navigation.tsx`

**Preserve unchanged:**
- All scroll/keyboard effects
- `handleNavClick` logic (anchor vs page vs contact)
- `NAV_LINKS` array
- `useREContact` hook
- All existing mobile menu structure (just adding section labels)

- [ ] **Step 1: Add variant import and tokens**

Add at top of file:

```tsx
import { useNavVariant } from "./nav-variant-context"
```

Add inside component function (after existing state):

```tsx
const { variant } = useNavVariant()

const vt = variant === "B"
  ? {
      bbH: "h-[64px]",
      cbH: "h-[44px]",
      logoH: "md:h-[54px]",
      linkSz: "text-[11px]",
      linkGap: "gap-6 lg:gap-8",
      ctaSz: "md:text-[12px]",
      ctaPad: "md:px-5 md:py-2",
      spacerH: "h-[108px]",
    }
  : {
      bbH: "h-[60px]",
      cbH: "h-[38px]",
      logoH: "md:h-[50px]",
      linkSz: "text-[10px]",
      linkGap: "gap-5 lg:gap-7",
      ctaSz: "md:text-[11px]",
      ctaPad: "md:px-5 md:py-1.5",
      spacerH: "h-[98px]",
    }
```

- [ ] **Step 2: Replace JSX structure**

Replace the current nav JSX while keeping all click handlers and `NAV_LINKS.map()` unchanged. The key changes are: use `vt` tokens, move nav links to a second context bar row, add ghost pill back-switcher.

Replace `<motion.nav ...>` through the closing `</motion.nav>` with:

```tsx
<motion.nav
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ duration: 0.55 }}
  className={cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
    scrolled
      ? "bg-[#ece4d8]/98 backdrop-blur-[14px] shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
      : "bg-[#ece4d8]/95",
  )}
>
  <div className="w-full max-w-[1920px] mx-auto px-3 md:px-6 lg:px-10">

    {/* ── Brand Bar ── */}
    <div className={cn("flex items-center justify-between", vt.bbH)}>
      {/* Logo */}
      <button
        onClick={() => (window.location.href = "/real-estate")}
        className="block shrink-0"
        aria-label="Wilson Premier Real Estate home"
      >
        <img
          src="/brand/logo-bold-charcoal.png"
          alt="Wilson Premier"
          className={cn("h-[44px] w-auto object-contain", vt.logoH)}
        />
      </button>

      {/* Right: headshot + CTA + hamburger */}
      <div className="flex items-center gap-3">
        <img
          src="/real-estate/craig-headshot.jpg"
          alt="Craig Wilson"
          className="h-8 w-8 rounded-full object-cover border border-[#BCA28A]/40 md:h-9 md:w-9"
        />
        <button
          onClick={() => openREContactModal()}
          className={cn(
            "inline-flex items-center rounded-full bg-[#9D5F36] text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#864E2B]",
            "px-4 py-1.5",
            vt.ctaSz,
            vt.ctaPad,
          )}
        >
          Contact
        </button>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full text-[#2b2925]/75 hover:text-[#1f1d1a] hover:bg-[#1f1d1a]/10 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </div>

    {/* ── Context Bar (desktop only) ── */}
    <div className={cn(
      "hidden md:flex items-center justify-between border-t border-[#1f1d1a]/8",
      vt.cbH,
    )}>
      {/* Nav links */}
      <div className={cn("flex items-center", vt.linkGap)}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => handleNavClick(link)}
            className={cn(
              "font-semibold uppercase tracking-[0.08em] whitespace-nowrap transition-colors duration-300",
              vt.linkSz,
              !link.anchor && pathname === link.href
                ? "text-[#25231f] border-b-[1.5px] border-[#9D5F36] pb-[1px]"
                : "text-[#2b2925]/55 hover:text-[#9D5F36]",
            )}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Ghost pill back-switcher */}
      <button
        onClick={() => (window.location.href = "/")}
        className="text-[9px] font-medium tracking-[0.06em] whitespace-nowrap border rounded-[10px] px-[10px] py-[2px] transition-colors duration-300 text-[#9D5F36]/30 border-[#9D5F36]/15 hover:text-[#9D5F36]/55 hover:border-[#9D5F36]/25"
      >
        ← Vacation Rentals
      </button>
    </div>
  </div>
</motion.nav>
```

- [ ] **Step 3: Update the spacer div**

Replace the existing `<div className="h-14 md:h-[98px]" />` spacer with:

```tsx
{/* Spacer — explicit classes so Tailwind JIT does not purge them */}
<div className={cn("h-[60px]", variant === "B" ? "md:h-[108px]" : "md:h-[98px]")} />
```

**Important:** Never construct Tailwind classes via string interpolation (e.g. `` `md:${vt.spacerH}` ``). Tailwind v4 JIT scans source for complete class strings — dynamic construction causes the class to be purged and produce no CSS output. Always use full explicit class names in conditional expressions.

Note: mobile height stays at 60px (single bar on mobile), desktop uses variant spacer height.

- [ ] **Step 4: Verify mobile menu still works**

The mobile menu `<AnimatePresence>` block remains unchanged. Run dev and verify:

```bash
npm run dev
```

Navigate to http://localhost:3000/real-estate and check:
1. Brand bar + context bar two-row layout renders
2. Active link (About SML if on `/real-estate`) has rust underline
3. Ghost pill "← Vacation Rentals" barely visible, darkens on hover, navigates correctly
4. Mobile hamburger → existing mobile menu still works
5. Variant switch: A (38px context bar) vs B (44px context bar)

- [ ] **Step 5: Remove unused `ArrowLeft` import**

The refactored JSX uses a plain `←` character for the back-switcher instead of the `ArrowLeft` lucide icon. Remove it from the imports at the top of the file:

```tsx
// Before:
import { ArrowLeft, Menu, X } from "lucide-react"

// After:
import { Menu, X } from "lucide-react"
```

- [ ] **Step 6: Verify TypeScript + lint**

```bash
npx tsc --noEmit 2>&1 | head -40
npm run lint 2>&1 | head -40
```

- [ ] **Step 7: Commit**

```bash
git add components/real-estate-navigation.tsx
git commit -m "feat: refactor RE nav to two-row B1 design with A/B variant support"
```

---

## Chunk 4: Final QA + Spacer Audit

### Task 6: Audit spacer heights across pages

The nav height changed (was ~58px single row, now 98–108px two rows). Any page that relied on implicit height needs a spacer check.

- [ ] **Step 1: Find pages that use the STR nav**

```bash
grep -r "Navigation" app/ --include="*.tsx" -l
```

For each page found, check if it has a top padding or spacer that accounted for the old nav height. If a page has `pt-[58px]` or similar, update to `pt-[98px]` for variant A, or use the CSS custom property approach below.

- [ ] **Step 2: Check hero component for top offset**

The hero (`components/hero.tsx`) likely relies on the nav height. Read the file and check for hardcoded offsets:

```bash
grep -n "pt-\|mt-\|top-\|h-\[5" components/hero.tsx | head -20
```

If the hero uses `pt-[58px]` or similar for its top padding (to sit under the nav), update to account for the new two-row height. The transparent-nav sections (homes) don't need adjustment — they're behind the nav intentionally.

- [ ] **Step 3: Check real-estate pages for spacer**

```bash
grep -rn "h-14\|h-\[98\|h-\[56\|pt-14\|pt-16" app/real-estate/ --include="*.tsx" | head -20
```

The RE layout already has a spacer div at the bottom of `real-estate-navigation.tsx` — confirm it now uses `vt.spacerH` correctly.

- [ ] **Step 4: Full page visual walkthrough**

With `npm run dev` running, visit each page:

| Page | Check |
|------|-------|
| `/` | Nav transparent over hero, opaque on scroll, two-row visible after scroll |
| `/` homes section | Both rows go transparent, links readable |
| `/contact` | Nav opaque, correct spacer |
| `/real-estate` | Light two-row nav, context bar links, ghost pill |
| `/real-estate/about` | Nav scrolled state, correct active link |
| `/map` | Nav renders correctly |
| `/house-rules` | Nav renders correctly |
| Mobile (375px) | Single row, Book + map + concierge + hamburger, full-screen overlay |

- [ ] **Step 5: Test A/B switch on every page**

Switch from A to B via the picker on each page listed above. Confirm:
- Heights transition smoothly (they won't animate — that's fine, it's a hard swap)
- No layout shifts that break page content
- Picker persists across navigation

- [ ] **Step 6: Production build check**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds with no errors. Warnings about `img` vs `next/image` are pre-existing and acceptable.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete B1 nav A/B redesign — two-row, unified STR+RE, variant picker"
```

---

## Known Pre-existing Issues (do not fix unless they break the new nav)

- `window.location.href` used for navigation instead of `next/link` / `router.push` — intentional, preserves current behavior
- `any` type on booking event handlers — pre-existing, out of scope
- `img` instead of `next/image` for logo and property thumbnails — pre-existing

## Rollback

If anything breaks badly:

```bash
git log --oneline -8   # find the pre-refactor commit
git revert HEAD        # or revert specific commits
```

Each task is its own commit so individual tasks can be reverted without losing other work.
