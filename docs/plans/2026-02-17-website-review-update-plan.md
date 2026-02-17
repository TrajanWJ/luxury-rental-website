# Website Review - Change Tracker & Update Plan

Based on: `/home/trajan/Downloads/Website review.docx`

## Status Legend
- [x] Done
- [~] Partially done
- [ ] Not started

---

## 1. GLOBAL / SITE-WIDE

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 1.1 | Replace "residences," "residential," "units," sale-style language → "vacation homes," "vacation rentals," "lakefront retreats," "estate homes" | [ ] | Requires full codebase grep |
| 1.2 | Add logo upper left corner on every page | [x] | Logo in nav on all pages |
| 1.3 | Add "Luxury Lakefront Vacation Rentals" near logo | [x] | Desktop tagline, theme-aware |
| 1.4 | Ensure logo is single solid brand color with padding | [x] | Theme-aware: inverted on dark, normal on light |
| 1.5 | Replace non-brand colors with brand palette only | [ ] | Audit needed |
| 1.6 | Set headings to Plantin / body to Work Sans | [~] | Using Playfair Display + Work Sans; Plantin not on Google Fonts |
| 1.7 | Contact form: remove raw email link, add concierge message | [ ] | |
| 1.8 | Form success message update | [ ] | |

## 2. HOME PAGE

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 2.1 | Nav labels: Home, Our Pledge, Lake Experiences, House Rules, Contact Concierge, Getting Here, Lakefront Retreats | [x] | All nav links implemented + House Rules added |
| 2.2 | Hero body text update (Wilson Premier Properties curates...) | [x] | Updated in hero.tsx |
| 2.3 | Hero tagline: "Settle for… the Extraordinary" | [x] | Added below headline |
| 2.4 | Hero button: "Lakefront Homes" via HeroBookingWidget | [x] | Widget integration in hero |
| 2.5 | Under properties: "Available for Your Vacation" + correct bed/guest counts | [x] | full-screen-homes.tsx updated |

## 3. OUR PLEDGE SECTION

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 3.1 | Title: "Our Mission, Promise, and Pledge" | [x] | pledge-section.tsx |
| 3.2 | Subtitle 1: "Our Mission" + full body text | [x] | |
| 3.3 | Subtitle 2: "Our Promise" + OUR COMMITMENT text | [x] | |
| 3.4 | Subtitle 3: "Our 'They Thought of Everything' Pledge" + body | [x] | |
| 3.5 | Subtitle 4: "Our Values" (Authentic, Extraordinary, Humility, Integrity) | [x] | 5 values in 2-col grid |
| 3.6 | Subtitle 5: "Our Logo – The Majestic Crane" + logo beside statement | [x] | Logo image + blockquote |

## 4. FEATURED PROPERTIES SECTION

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 4.1 | Section title: "Premier Lakefront Retreats" | [x] | Overline + heading in full-screen-homes.tsx |

## 5. SUITE RETREAT

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 5.1 | Subheading: "A 14,000-SqFt Lakefront Estate for Elevated Gatherings" | [x] | teaser in data.ts |
| 5.2 | Button: "Explore Suite Retreat" | [x] | Dynamic in property-panel.tsx |
| 5.3 | "beds" → "bedrooms" | [x] | property-panel.tsx uses "Bedrooms" |
| 5.4 | Quick facts: 9 bedrooms, Sleeps 32 | [x] | data.ts updated |
| 5.5 | Full description rewrite | [x] | 3-paragraph description in data.ts |
| 5.6 | Amenities list overhaul (24 items from docx) | [x] | data.ts updated |

## 6. SUITE VIEW

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 6.1 | Subheading: "13,000+ Sq Ft of Waterfront Luxury for Multifamily Retreats" | [x] | teaser in data.ts |
| 6.2 | Button: "Explore Suite View" | [x] | Dynamic button |
| 6.3 | "beds" → "bedrooms", 8 bedrooms | [x] | data.ts |
| 6.4 | Full description rewrite | [x] | 3-paragraph description |
| 6.5 | Amenities list overhaul (15 items) | [x] | data.ts |

## 7. MILAN MANOR

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 7.1 | Button: "Explore Milan Manor" | [x] | Dynamic button |
| 7.2 | "beds" → "bedrooms" | [x] | |
| 7.3 | Card description update | [x] | New teaser in data.ts |

## 8. PENTHOUSE VIEW

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 8.1 | Remove "Private Decks" badge | [x] | Not in current amenities list |
| 8.2 | "beds" → "bedrooms" | [x] | |
| 8.3 | Quick facts: 2 bedrooms, Sleeps 6 | [x] | Docx as source of truth |
| 8.4 | Button: "Explore Penthouse View" | [x] | Dynamic button |
| 8.5 | Full description rewrite | [x] | 3-paragraph description |
| 8.6 | Hero image: replace with WPP preferred photo | [ ] | Need asset from client |
| 8.7 | Amenities list overhaul (18 items) | [x] | data.ts |

## 9. LAKE VIEW

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 9.1 | Heading: remove "and 3-D tour" | [x] | Clean title |
| 9.2 | "beds" → "bedrooms" | [x] | |
| 9.3 | Sleeps 6 → Sleeps 4 | [x] | data.ts updated |
| 9.4 | Full description rewrite | [x] | 2-paragraph description |
| 9.5 | Remove "3D tour" from amenities, keep separate button | [x] | 3D button still available |
| 9.6 | Amenities list overhaul (17 items) | [x] | data.ts |

## 10. LAKE EXPERIENCES SECTION

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 10.1 | Heading: "At Your Service" / "Your Concierge Collection" | [x] | Pivoted to concierge per user decision |
| 10.2 | Intro text: concierge partner descriptions | [x] | Updated experiences.tsx |
| 10.3 | Local attractions (Dam, Hickory Hill, etc.) | [~] | Replaced with 16 concierge partners per user decision; local attractions removed |

## 11. HOUSE RULES & AGREEMENT

| # | Change | Status | Notes |
|---|--------|--------|-------|
| 11.1 | Add House Rules page with rental agreement PDF | [x] | /house-rules page with embed + download |

---

## QUESTIONS FOR CLIENT / NEXT SESSION

1. **Plantin font**: Not available on Google Fonts. Source a web font file, or is Playfair Display acceptable?
2. **Penthouse View hero image**: Need the preferred primary photo from client
3. **"Own Your Lake Retreat" nav item**: Is this a new page or a link to Wilson Premier Real Estate?

## 12. CONCIERGE EXPERIENCES — PHOTO SOURCING

Visit each concierge partner website and extract one ideal photo per service for the carousel and /experiences page. Current images are generic placeholders.

| # | Partner | Website | Current Image | Photo Sourced? |
|---|---------|---------|---------------|----------------|
| 12.1 | Napoli at the Lake | https://napolibythelakesml.com/ | /waterfront-dining.png | [ ] |
| 12.2 | Linda's Catering | (no website) | /gourmet-kitchen-marble-countertops.jpg | [ ] |
| 12.3 | Mt. Fuji Private Hibachi | https://mtfujiof757.com/ | /rustic-dining-room-wooden-beams.jpg | [ ] |
| 12.4 | SML Fine Wines | https://www.smlfinewines.com/ | /vineyard-tasting.png | [ ] |
| 12.5 | Mountain View Farm Wagyu | https://www.mvfpremierbeef.com/ | /outdoor-patio-fire-pit-lake.jpg | [ ] |
| 12.6 | Traveling Therapy Spa | https://travelingtherapy.ncbcertified.com/ | /infinity-pool-overlooking-lake.jpg | [ ] |
| 12.7 | Goodhue Boat Company | https://www.goodhueboat.com/ | /boating-water-sports.png | [ ] |
| 12.8 | Virginia Dare Cruises | https://www.vadaresml.com/virginia-dare | /sunset-cruises.png | [ ] |
| 12.9 | Captain Vic Sea Ray | https://www.facebook.com/CaptainVicServices/ | /modern-lakefront-home-dock.jpg | [ ] |
| 12.10 | Patriot Fishing Charters | https://patriotfishingcharter.com/ | /fishing-recreation.png | [ ] |
| 12.11 | Betty Ashton Mayo (Harpist) | https://www.bettyashton.com/ | /luxury-lakefront-estate-sunset-view.jpg | [ ] |
| 12.12 | Shows Great Media Group | https://showsgreat.photography/ | /penthouse-view.jpg | [ ] |
| 12.13 | Personal Assistant Service | (no website) | /contemporary-lake-house-boat-dock.jpg | [ ] |
| 12.14 | At Your Service Concierge | https://atyourservicepc.com/ | /luxury-bedroom-lake-view.jpg | [ ] |
| 12.15 | Acti-Kare Childcare | https://actikare.com/roanoke/ | /family-reunions.png | [ ] |
| 12.16 | Wilson Premier Real Estate | https://smllakefront.com/ | /luxury-lakefront-estate-sunset-view.jpg | [ ] |

**Process**: Visit each site, find the best representative photo, download to `/public/concierge/`, update `imageUrl` in `lib/experiences.ts`.

---

## SUGGESTED IMPLEMENTATION ORDER

### Phase 1 — Quick text swaps (DONE)
- Items: 2.2-2.5, 4.1, 5.1-5.4, 6.1-6.3, 7.1-7.3, 8.1-8.4, 9.1-9.3

### Phase 2 — Content rewrites (DONE)
- Items: 5.5-5.6, 6.4-6.5, 8.5-8.7, 9.4-9.6

### Phase 3 — Pledge section (DONE)
- Items: 3.1-3.6

### Phase 4 — Visual/brand polish (PARTIALLY DONE)
- [x] Hero readability (overlay, text color, tagline)
- [x] Logo theme awareness (dark/light)
- [x] Nav tagline theme awareness
- [x] Map icon theme awareness
- [x] Nav dropdown "Bedrooms" label
- [x] House Rules nav link added
- [ ] 1.1 — Global "residences"/"units" language sweep
- [ ] 1.7 — Contact form: remove raw email link, add concierge message
- [ ] 1.8 — Form success message update
- [ ] 1.6 — Font audit (Plantin vs Playfair)

### Phase 5 — Concierge photo sourcing (NOT STARTED)
- Items: 12.1-12.16
- Visit each partner website, extract ideal photos

### Phase 6 — Remaining items
- "Own Your Lake Retreat" nav item
- Penthouse View hero image from client
- Any remaining assets
