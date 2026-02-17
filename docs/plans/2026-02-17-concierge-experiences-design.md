# Concierge Experiences Redesign

## Goal
Replace local attractions with curated concierge partner services. Combine two homepage carousels into one. Link to editorial /experiences page.

## Data Layer
- Rewrite `lib/experiences.ts` with 16 concierge partners from WPP Concierge services.docx
- Fields: id, name, type, description, contactName, title, phone, email, website, imageUrl, serviceOffered
- Delete `lib/experiences-data.ts`

## Homepage — Single Carousel
- Merge Experiences + ExperiencesTicker into one carousel component
- Keep current Experiences carousel style with click-to-expand popup showing contact info
- Rebrand heading to concierge theme
- Add "Explore All Services" CTA linking to /experiences
- Remove ExperiencesTicker from page.tsx

## /experiences Page — Editorial Scroll
- Keep editorial parallax layout
- Swap data to concierge partners
- Update hero copy to concierge theme
- Each partner gets editorial section with image, description, contact info, website link

## Deletions
- components/experiences-ticker.tsx
- lib/experiences-data.ts
- 30 generic local attractions from lib/experiences.ts
