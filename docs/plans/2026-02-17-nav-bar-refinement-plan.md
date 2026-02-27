# Nav Bar Refinement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the mobile nav bar with three-zone dividers, clean icons (no pill backgrounds), a mobile Book Now button, and minor dropdown menu styling updates.

**Architecture:** Single-file change to `components/navigation.tsx`. The mobile top bar gets restructured into three visual zones (left/center/right) separated by thin vertical dividers. Icon buttons lose their frosted-glass pill styling. A compact Book Now CTA is added to the mobile top bar. The dropdown menu gets minor brand-aligned refinements.

**Tech Stack:** Next.js, React, Tailwind CSS, Framer Motion

---

### Task 1: Strip Mobile Chat Icon Pill Styling

**Files:**
- Modify: `components/navigation.tsx:132-141`

**Step 1: Edit the mobile chat button**

Replace the chat button className (line 135) from:

```tsx
className={`md:hidden p-2.5 rounded-full transition-all ${isDark ? "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20" : "bg-[#2B2B2B]/10 border border-[#2B2B2B]/20 text-[#2B2B2B] hover:bg-[#2B2B2B]/20"}`}
```

To:

```tsx
className={`md:hidden p-2.5 rounded-full transition-colors ${isDark ? "text-white/70 hover:text-white" : "text-[#2B2B2B]/60 hover:text-[#2B2B2B]"}`}
```

**Step 2: Verify build**

Run: `cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier" && npm run build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 2: Add Divider After Chat Icon (Left Zone)

**Files:**
- Modify: `components/navigation.tsx:130-141`

**Step 1: Add a divider element after the chat button, before the logo**

After the closing `</button>` of the chat button (line 141) and before the `{/* Logo */}` comment (line 143), insert:

```tsx
              {/* Divider — mobile only, separates left zone */}
              <div className={`md:hidden w-px h-5 ${isDark ? "bg-white/15" : "bg-[#2B2B2B]/12"}`} />
```

**Step 2: Verify build**

Run: `cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier" && npm run build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 3: Restructure Mobile Right Zone with Divider, Clean Map Icon, Book Now, and Hamburger

**Files:**
- Modify: `components/navigation.tsx:271-302`

**Step 1: Replace the entire mobile right zone**

Replace lines 271-302 (the `{/* ─── RIGHT: Mobile Actions ─── */}` section) with:

```tsx
            {/* ─── RIGHT: Mobile Actions ─── */}
            <div className="md:hidden flex items-center gap-2">
              {/* Divider — separates center from right zone */}
              <div className={`w-px h-5 ${isDark ? "bg-white/15" : "bg-[#2B2B2B]/12"}`} />

              {/* Map icon — clean, no pill */}
              <button
                onClick={() => window.location.href = '/map'}
                className={`p-2.5 rounded-full transition-colors ${isDark ? "text-white/70 hover:text-white" : "text-[#2B2B2B]/60 hover:text-[#2B2B2B]"}`}
                aria-label="Getting Here - Map"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </button>

              {/* Book Now — compact rust pill */}
              <button
                onClick={() => setBookingOpen(true)}
                className="bg-[#9D5F36] text-white rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[#9D5F36]/85"
              >
                Book Now
              </button>

              {/* Hamburger — clean, matches icon style */}
              <button
                className={`flex flex-col justify-center items-center p-2.5 space-y-1.5 focus:outline-none z-50 transition-colors ${isDark ? "text-white/70 hover:text-white" : "text-[#2B2B2B]/60 hover:text-[#2B2B2B]"}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className={`block w-6 h-0.5 ${isDark ? "bg-white" : "bg-[#2B2B2B]"}`}
                />
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className={`block w-6 h-0.5 ${isDark ? "bg-white" : "bg-[#2B2B2B]"}`}
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className={`block w-6 h-0.5 ${isDark ? "bg-white" : "bg-[#2B2B2B]"}`}
                />
              </button>
            </div>
```

Key changes:
- Gap reduced from `gap-2.5` to `gap-2`
- Divider added at start of right zone
- Map icon stripped of pill styling (no bg, border, backdrop-blur, shadow)
- Book Now compact rust pill added between map and hamburger
- Hamburger: `w-11 h-11` replaced with `p-2.5`, bar width reduced from `w-7` to `w-6` for elegance

**Step 2: Verify build**

Run: `cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier" && npm run build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 4: Refine Mobile Dropdown Menu Styling

**Files:**
- Modify: `components/navigation.tsx:307-350` (the mobile menu overlay)

**Step 1: Update dropdown container classes**

On the `<motion.div>` container (the line with `className="md:hidden absolute top-[76px]..."`), change:

```tsx
className="md:hidden absolute top-[76px] left-3 right-3 py-6 bg-[#2B2B2B]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl px-5 flex flex-col gap-1"
```

To:

```tsx
className="md:hidden absolute top-[76px] left-3 right-3 py-6 bg-[#2B2B2B]/95 backdrop-blur-2xl rounded-2xl border border-white/10 border-t-2 border-t-[#BCA28A] shadow-2xl px-5 flex flex-col gap-1"
```

This adds the taupe top accent border.

**Step 2: Update nav link divider opacity and add hover accent**

Change the link button className from:

```tsx
className="text-left text-white/80 hover:text-white transition-colors font-medium py-3 text-base border-b border-white/5 font-serif min-h-[44px] flex items-center"
```

To:

```tsx
className="text-left text-white/80 hover:text-white transition-all font-medium py-3 text-base border-b border-white/8 font-serif min-h-[44px] flex items-center pl-0 hover:pl-2 hover:border-l-2 hover:border-l-[#9D5F36]"
```

Apply this to both the navLinks `.map()` button and the standalone "Lakefront Retreats" button below it (both share the same className string).

**Step 3: Update the dropdown Book Now button**

Change the Book Now `<Button>` className from:

```tsx
className="bg-white text-[#2B2B2B] hover:bg-white/90 w-full py-3.5 text-base rounded-full mt-3 font-semibold min-h-[44px]"
```

To:

```tsx
className="bg-[#9D5F36] text-white hover:bg-[#9D5F36]/90 w-full py-3.5 text-base rounded-full mt-3 font-semibold min-h-[44px]"
```

**Step 4: Verify build**

Run: `cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier" && npm run build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 5: Visual Verification and Commit

**Step 1: Start dev server**

Run: `cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier" && npm run dev &`

**Step 2: Verify visually**

Open http://localhost:3000 in browser. Check:
- Mobile (375px): Three zones visible with dividers, clean icons, rust Book Now pill, hamburger matches
- Mobile dropdown: Taupe top border, visible dividers, rust hover accents, rust Book Now
- Desktop (1440px): No visual changes — desktop nav unchanged
- Scroll state: Dividers remain visible against frosted background

**Step 3: Commit**

```bash
cd "/home/trajan/Desktop/Coding/Projects/web design STR/client sites/wilson premier"
git add components/navigation.tsx
git commit -m "Refine mobile nav bar: three-zone dividers, clean icons, rust Book Now CTA

- Replace frosted-glass pill backgrounds with clean icon strokes
- Add thin vertical dividers between left/center/right zones
- Add compact rust Book Now button to mobile top bar
- Refine dropdown: taupe top border, visible dividers, rust hover accents
- Match hamburger styling to clean icon language"
```
