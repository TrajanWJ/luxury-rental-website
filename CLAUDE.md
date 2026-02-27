# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Framer Motion

**Routing:** File-based via `/app`. Dynamic property pages at `/app/properties/[slug]/`. Pages: home, book, contact, experiences, house-rules, map, style-guide.

**Data:** No database or API routes. Properties and experiences are static TypeScript arrays in `/lib/data.ts` and `/lib/experiences.ts`. External services handle transactions: Hostaway (booking calendar widget), Google Maps (map view), Matterport (3D tours).

**State:** Two React Context providers wrap the app in `app/layout.tsx`:
- `DemoProvider` — toggles demo mode
- `ConciergeProvider` — manages contact modal state, selected experience

Cross-component communication uses custom DOM events (e.g., `"open-booking"`, `"open-booking-with-context"`) dispatched from property cards and caught by the navigation booking popup.

**UI Components:** Shadcn/ui primitives in `/components/ui/`. Feature components in `/components/` (navigation, hero, experiences, featured-homes, property-panel, map-view, footer-cta, etc.).

## Brand & Design System

Brand identity: Wilson Premier Properties — luxury lakefront vacation rentals at Smith Mountain Lake, Virginia. Full guidelines in `brand/brand-brief.md` and structured tokens in `brand/brand-tokens.json`.

**Colors** (always use hex values, not Tailwind color names):
- Linen `#ECE9E7` — backgrounds, light surfaces
- Charcoal `#2B2B2B` — primary text, dark backgrounds
- Rust `#9D5F36` — primary accent, CTAs, hover states
- Taupe `#BCA28A` — secondary accent, borders, section labels

**Typography:** Playfair Display (serif headings, `--font-playfair`), Work Sans (body, `--font-work-sans`). Both loaded via Next.js Google Fonts in `app/layout.tsx`.

**CSS:** Tailwind v4 with `@import` / `@theme` syntax in `app/globals.css`. Brand tokens defined as CSS custom properties in `:root` and `.dark`. Reusable utility classes: `.brand-overline`, `.brand-divider-horizontal`, `.brand-card-premium`, `.bg-band-linen`, `.bg-depth-linen`.

**Patterns:** Responsive breakpoints at `md:` (768px) and `lg:` (1024px). Hover states use Rust accent + 0.3s ease transitions. Focus states get Rust border + glow. Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional classes.

## Conventions

- `"use client"` directive on all interactive components; server components are the default
- Path alias `@/` maps to project root (e.g., `import { Button } from "@/components/ui/button"`)
- Component files: lowercase-hyphenated (`featured-homes.tsx`). Component names: PascalCase
- Context providers: `*-context.tsx` with `use*()` hooks
- Theme-aware components accept `theme?: "dark" | "light"` prop and derive all colors from `isDark` boolean
- Images use Next.js `<Image>` with `unoptimized: true` (disabled optimization for Vercel). Remote patterns allowed for wilson-premier.com

## Deployment

Vercel with Next.js framework preset. Deploy via `vercel --prod` or Git push. Config in `vercel.json` (clean URLs, no trailing slashes).

## Navigation & Routing

Navigation refactors have historically required multiple iterations. Before making nav/routing changes, map out the current route structure and confirm impact on all pages. The nav component (`components/navigation.tsx`) integrates the booking popup and handles both hash-based scrolling (home page sections) and page navigation.

## Planning Documents

Design docs and implementation plans are saved to `docs/plans/` with the format `YYYY-MM-DD-<topic>-{design,plan}.md`.
