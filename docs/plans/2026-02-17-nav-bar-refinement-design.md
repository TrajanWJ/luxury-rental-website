# Nav Bar Refinement Design

**Date:** 2026-02-17
**Focus:** Mobile top bar visual refinement + minor dropdown adjustments
**File:** `components/navigation.tsx`

## Problem

The mobile top bar icons (chat, map) feel disconnected from the brand. They use frosted-glass pill backgrounds that look like afterthoughts rather than part of a cohesive design system. There's no visual separation between layout zones, and the bar lacks balance and elegance.

## Design

### Mobile Top Bar — Three-Zone Layout with Dividers

```
 ┌──────────────────────────────────────────────────────────┐
 │  💬  │      Wilson Premier Logo      │  📍  [Book Now]  ≡  │
 │ chat │                                │ map    CTA    menu │
 └──────────────────────────────────────────────────────────┘
       ↑                                  ↑
   divider 1                          divider 2
```

**Dividers:**
- 1px wide, `h-5` (20px) tall
- Dark theme: `bg-white/15`
- Light theme: `bg-[#2B2B2B]/12`

**Icon Buttons (chat, map):**
- Remove all background pills: no `bg-white/10`, no `backdrop-blur-md`, no `border`, no `shadow-sm`
- Clean strokes only: `text-white/70 hover:text-white` (dark) / `text-[#2B2B2B]/60 hover:text-[#2B2B2B]` (light)
- Keep `p-2.5` for 44px touch targets

**Hamburger:**
- Remove explicit `w-11 h-11` sizing, use `p-2.5` padding instead for consistency
- Keep animated three-bar morph
- Same color treatment as other icons

**Mobile "Book Now" Button:**
- Compact rust pill: `bg-[#9D5F36] text-white rounded-full px-3.5 py-1.5 text-xs font-semibold`
- Sits between map icon and hamburger in the right zone
- Same rust CTA color used throughout the site for consistency

**Spacing:**
- Left zone: chat icon → `gap-3` → divider
- Center zone: logo with generous padding, flex-centered
- Right zone: divider → map icon → Book Now button → hamburger with `gap-2`

### Mobile Dropdown Menu — Minor Refinements

1. **Dividers:** Bump from `border-white/5` to `border-white/8` for visibility
2. **Book Now button:** Change from white to rust — `bg-[#9D5F36] text-white hover:bg-[#9D5F36]/90`
3. **Link hover accent:** Add `border-l-2 border-[#9D5F36]` with slight padding shift on hover
4. **Top accent:** Add `border-t-2 border-[#BCA28A]` to the dropdown container

### Desktop Nav

No changes — desktop icon buttons are already clean and aligned with this direction.

### Scroll State

Dividers remain visible against both transparent and frosted-glass scroll backgrounds.

## Out of Scope

- Navigation link labels or destinations
- Desktop layout changes
- Booking popup behavior
- Properties dropdown behavior
