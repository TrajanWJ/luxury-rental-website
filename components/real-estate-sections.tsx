"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Sun,
  Leaf,
  Snowflake,
  Waves,
  Fish,
  TreePine,
  Flower2,
  MapPin,
} from "lucide-react"
import { properties } from "@/lib/data"

/* ─────────────────────────────────────────────
   Shared animation defaults
   ───────────────────────────────────────────── */

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
}

/* ─────────────────────────────────────────────
   Data constants
   ───────────────────────────────────────────── */

const LAKE_FACTS = [
  { label: "Surface Area", value: "20,600 acres" },
  { label: "Length", value: "~40 miles" },
  { label: "Shoreline", value: "500+ miles" },
  { label: "Avg Depth", value: "~55 feet" },
  { label: "Max Depth", value: "~250 feet" },
  { label: "Full Pond", value: "795 ft above sea level" },
]

const SEASONS = [
  {
    icon: Sun,
    title: "Spring & Summer",
    body: "Warm days and mild nights make this peak season for boating, swimming, and outdoor events. Water temperatures in summer often sit comfortably in the 70s\u00B0F.",
  },
  {
    icon: Leaf,
    title: "Fall",
    body: "Cooler air, crisp skies, and vibrant foliage draw both residents and visitors. An especially scenic time for hiking, golf, and quieter boating.",
  },
  {
    icon: Snowflake,
    title: "Winter",
    body: "Winters tend to be mild compared with more northern lakes. Heavy snowfall is rare, and the lake rarely freezes \u2014 one reason many homes feature permanent docks.",
  },
]

const ACTIVITIES = [
  {
    icon: Waves,
    title: "Boating & Water Sports",
    body: "With generous surface area and scenic coves, boating, waterskiing, kayaking, paddleboarding, and jet skiing are common pastimes.",
  },
  {
    icon: Fish,
    title: "Fishing",
    body: "The lake supports a robust fishery including largemouth and smallmouth bass, striped bass, crappie, sunfish, catfish, and more.",
  },
  {
    icon: TreePine,
    title: "Parks & Trails",
    body: "Smith Mountain Lake State Park offers swimming areas, hiking and biking trails, picnic sites, cabin rentals, and seasonal programs.",
  },
  {
    icon: Flower2,
    title: "Community Events",
    body: "Seasonal festivals, regattas, fishing tournaments, farmers markets, and community gatherings bring locals and visitors together year-round.",
  },
]

const GOLF_COURSES = [
  {
    name: "Water\u2019s Edge Country Club",
    body: "A lakeside championship course known for its rolling terrain, water views, and welcoming club atmosphere.",
  },
  {
    name: "The Waterfront Country Club",
    body: "A private, amenity-rich course offering a classic layout, clubhouse dining, and a strong social calendar.",
  },
  {
    name: "Mariners Landing Country Club",
    body: "A beautifully maintained course set within a gated community, popular with both full-time residents and second-home owners.",
  },
]

const SML_HAPPENINGS = [
  {
    title: "Spring Home Showcase",
    timing: "March \u2013 April",
    body: "Private tours, curated previews, and relationship-first planning for high-interest waterfront opportunities.",
  },
  {
    title: "Lakefront Summer Season",
    timing: "May \u2013 August",
    body: "Peak boating season and active buyer traffic, with strong demand around premium shoreline inventory.",
  },
  {
    title: "Fall Strategy Window",
    timing: "September \u2013 November",
    body: "Foliage season and calmer inventory cycles create an ideal environment for deliberate acquisition decisions.",
  },
  {
    title: "Winter Planning Cycle",
    timing: "December \u2013 February",
    body: "Seller prep, positioning, and early-buyer strategy ahead of spring listing velocity.",
  },
]

const TAX_RATES = [
  { county: "Bedford County", rate: "~$0.41/$100" },
  { county: "Franklin County", rate: "~$0.43/$100" },
  { county: "Pittsylvania County", rate: "Varies" },
]

const DRIVING_DISTANCES = [
  { city: "Lynchburg, VA", miles: "~30", time: "~45 min" },
  { city: "Roanoke, VA", miles: "~45", time: "~1 hr" },
  { city: "Raleigh\u2013Durham, NC", miles: "~150", time: "~2.5\u20133 hrs" },
  { city: "Charleston, WV", miles: "~200", time: "~3.5\u20134 hrs" },
  { city: "Charlotte, NC", miles: "~190", time: "~3.5 hrs" },
  { city: "Fairfax, VA", miles: "~235", time: "~4 hrs" },
  { city: "Washington, D.C.", miles: "~245", time: "~4\u20134.5 hrs" },
  { city: "Baltimore, MD", miles: "~275", time: "~5 hrs" },
  { city: "Pittsburgh, PA", miles: "~300", time: "~5.5 hrs" },
  { city: "Philadelphia, PA", miles: "~330", time: "~5.5\u20136 hrs" },
  { city: "Cincinnati, OH", miles: "~350", time: "~6 hrs" },
  { city: "Atlanta, GA", miles: "~370", time: "~6\u20136.5 hrs" },
  { city: "New York, NY", miles: "~450", time: "~7.5\u20138 hrs" },
  { city: "Chicago, IL", miles: "~700", time: "~11\u201312 hrs" },
]

/* ═══════════════════════════════════════════════
   1. LakeOverviewSection
   ═══════════════════════════════════════════════ */

export function LakeOverviewSection() {
  return (
    <section id="about-sml" className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        {/* Overline + Heading */}
        <motion.div {...reveal}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
            Overview &amp; History
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
            About Smith Mountain Lake
          </h2>
        </motion.div>

        {/* Two-column: editorial text + image */}
        <div className="mt-10 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left — editorial */}
          <motion.div {...reveal} className="space-y-5">
            <p className="text-[#2B2B2B]/85 leading-relaxed">
              Smith Mountain Lake is one of Virginia&#39;s most scenic and beloved destinations. Stretching approximately 40 miles long with more than 500 miles of shoreline and covering some 20,600 acres, it is the largest lake contained entirely within the Commonwealth of Virginia and the second-largest freshwater reservoir in the state.
            </p>
            <p className="text-[#2B2B2B]/85 leading-relaxed">
              The lake was created in the early 1960s when Smith Mountain Dam was built across the Roanoke River to generate hydroelectric power. Construction began in 1960 and was completed by 1963, and the lake reached its full elevation &mdash; commonly referred to as full pond &mdash; at 795 feet above sea level in 1966.
            </p>
            <p className="text-[#2B2B2B]/85 leading-relaxed">
              Originally valued for energy production and flood control, Smith Mountain Lake quickly became known as a premier recreational and residential destination. Over the decades, its calm waters, rolling wooded hills, and abundant opportunities for outdoor activities have attracted visitors, second-home owners, and full-time residents alike.
            </p>
          </motion.div>

          {/* Right — lake image */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 }}
            className="relative rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          >
            <img
              src="/luxury-lakefront-estate-sunset-view.jpg"
              alt="Aerial view of Smith Mountain Lake at sunset"
              className="w-full h-auto object-cover aspect-[4/3]"
            />
          </motion.div>
        </div>

        {/* Facts Grid */}
        <motion.div {...reveal} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            Key Facts
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {LAKE_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-[#BCA28A]/20 bg-[#f8f4ee] p-5 text-center"
              >
                <p className="text-lg font-semibold text-[#2B2B2B]">{fact.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[#2B2B2B]/60 font-medium">
                  {fact.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weather / Seasons */}
        <motion.div {...reveal} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            Weather &amp; Seasons
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {SEASONS.map((season) => {
              const Icon = season.icon
              return (
                <div
                  key={season.title}
                  className="rounded-xl border border-[#BCA28A]/20 bg-white p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#BCA28A]/25 bg-[#f8f4ee]">
                      <Icon className="h-4 w-4 text-[#9D5F36]" />
                    </span>
                    <h3 className="font-semibold text-[#2B2B2B]">{season.title}</h3>
                  </div>
                  <p className="text-[#2B2B2B]/75 leading-relaxed text-sm">{season.body}</p>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   2. LakeLifeSection
   ═══════════════════════════════════════════════ */

export function LakeLifeSection() {
  return (
    <section id="sml-life" className="bg-[#f8f4ee] py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        {/* Overline + Heading */}
        <motion.div {...reveal}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
            Life at the Lake
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
            An Outdoor Lifestyle Framed by Water
          </h2>
        </motion.div>

        {/* Intro paragraph */}
        <motion.p
          {...reveal}
          className="mt-6 max-w-3xl text-[#2B2B2B]/85 leading-relaxed"
        >
          Life at Smith Mountain Lake is defined by the water. Whether it&#39;s a morning kayak across glassy coves, an afternoon of bass fishing, or an evening spent watching the sunset from a private dock, the lake shapes the rhythm of daily life and draws a community united by a love of the outdoors.
        </motion.p>

        {/* Activities Grid — 2 columns */}
        <motion.div {...reveal} className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            Activities &amp; Recreation
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {ACTIVITIES.map((activity) => {
              const Icon = activity.icon
              return (
                <div
                  key={activity.title}
                  className="rounded-xl border border-[#BCA28A]/20 bg-white p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#BCA28A]/25 bg-[#f8f4ee]">
                      <Icon className="h-4 w-4 text-[#9D5F36]" />
                    </span>
                    <h3 className="font-semibold text-[#2B2B2B]">{activity.title}</h3>
                  </div>
                  <p className="text-[#2B2B2B]/75 leading-relaxed text-sm">{activity.body}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Golf Courses */}
        <motion.div {...reveal} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            Golf Courses
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {GOLF_COURSES.map((course) => (
              <div
                key={course.name}
                className="rounded-xl border border-[#BCA28A]/20 bg-white p-5"
              >
                <h3 className="font-semibold text-[#2B2B2B] mb-2">{course.name}</h3>
                <p className="text-[#2B2B2B]/75 leading-relaxed text-sm">{course.body}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SML Happenings */}
        <motion.div {...reveal} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            SML Happenings
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SML_HAPPENINGS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[#BCA28A]/20 bg-white p-5"
              >
                <h3 className="font-semibold text-[#2B2B2B]">{item.title}</h3>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#9D5F36] font-medium">
                  {item.timing}
                </p>
                <p className="mt-3 text-[#2B2B2B]/75 leading-relaxed text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pop Culture callout */}
        <motion.div
          {...reveal}
          className="mt-14 rounded-xl border border-[#BCA28A]/25 bg-white p-5 md:p-6"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-3">
            Pop Culture
          </p>
          <p className="text-[#2B2B2B]/85 leading-relaxed">
            Smith Mountain Lake has appeared in films such as <em>What About Bob?</em> and has been featured in television and regional stories highlighting lake life.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   3. MarketSection
   ═══════════════════════════════════════════════ */

export function MarketSection() {
  return (
    <section id="market" className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        {/* Overline + Heading */}
        <motion.div {...reveal}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
            The Real Estate Market
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
            A Diverse &amp; Well-Established Market
          </h2>
        </motion.div>

        {/* 3 editorial paragraphs */}
        <motion.div {...reveal} className="mt-8 max-w-3xl space-y-5">
          <p className="text-[#2B2B2B]/85 leading-relaxed">
            Smith Mountain Lake&#39;s real estate market spans three counties &mdash; Bedford, Franklin, and Pittsylvania &mdash; and includes everything from waterfront estates and lakefront cottages to off-water homes, condominiums, townhomes, and undeveloped land. The variety of property types and price points makes the lake accessible to a wide range of buyers, whether they are looking for a weekend retreat, a year-round residence, or a long-term investment.
          </p>
          <p className="text-[#2B2B2B]/85 leading-relaxed">
            Demand for lakefront property has remained consistently strong, supported by the lake&#39;s natural beauty, its growing reputation as a lifestyle destination, and the relatively favorable cost of living compared with many urban markets in the Mid-Atlantic and Southeast. Inventory levels fluctuate with the seasons and broader economic conditions, but well-positioned properties &mdash; particularly those with quality docks, deep-water access, and long-range views &mdash; tend to attract sustained buyer interest.
          </p>
          <p className="text-[#2B2B2B]/85 leading-relaxed">
            County tax rates around the lake are generally favorable, and the overall cost of homeownership compares well against many metropolitan areas in the region. Whether buying, selling, or exploring long-term plans, understanding the local market dynamics, seasonal patterns, and neighborhood characteristics is essential to making sound real estate decisions at Smith Mountain Lake.
          </p>
        </motion.div>

        {/* Tax Rates */}
        <motion.div {...reveal} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            County Tax Rates
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {TAX_RATES.map((item) => (
              <div
                key={item.county}
                className="rounded-xl border border-[#BCA28A]/20 bg-[#f8f4ee] p-5 text-center"
              >
                <p className="text-lg font-semibold text-[#2B2B2B]">{item.rate}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[#2B2B2B]/60 font-medium">
                  {item.county}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[#2B2B2B]/65 leading-relaxed">
            These rates are typically well below many urban and suburban areas, contributing to the lake&#39;s appeal as a primary or secondary home destination.
          </p>
        </motion.div>

        {/* Driving Distance Table */}
        <motion.div {...reveal} className="mt-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-5">
            Driving Distances
          </p>
          <div className="rounded-xl border border-[#BCA28A]/20 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#2B2B2B] text-[#ECE9E7]">
                  <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-[0.12em]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      City
                    </span>
                  </th>
                  <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-[0.12em]">
                    Miles
                  </th>
                  <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-[0.12em]">
                    Drive Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {DRIVING_DISTANCES.map((row, i) => (
                  <tr
                    key={row.city}
                    className={`border-t border-[#BCA28A]/15 transition-colors duration-200 hover:bg-[#f8f4ee] ${
                      i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-[#2B2B2B]">{row.city}</td>
                    <td className="px-5 py-3 text-[#2B2B2B]/75">{row.miles}</td>
                    <td className="px-5 py-3 text-[#2B2B2B]/75">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-[#2B2B2B]/65 leading-relaxed">
            Drive times may vary based on traffic, route, and season.
          </p>
        </motion.div>

        {/* "Why This Matters" callout */}
        <motion.div
          {...reveal}
          className="mt-14 rounded-xl border border-[#BCA28A]/20 border-l-4 border-l-[#9D5F36] bg-[#f8f4ee] p-6 md:p-8"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-3">
            Why This Matters
          </p>
          <p className="text-[#2B2B2B]/85 leading-relaxed">
            Smith Mountain Lake feels like a true escape, yet it&#39;s close enough to make regular visits practical. Many owners split time between the lake and nearby cities, while others enjoy hosting friends and family who can reach the lake with relative ease. It&#39;s a destination that feels removed from everyday pace &mdash; without ever feeling out of reach.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   4. FeaturedListingSection
   ═══════════════════════════════════════════════ */

export function FeaturedListingSection() {
  const milan = properties.find((p) => p.name === "Milan Manor")
  if (!milan) return null

  return (
    <section className="bg-[#f8f4ee] py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        {/* Overline + Heading */}
        <motion.div {...reveal}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
            Featured Listing
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
            Milan Manor
          </h2>
        </motion.div>

        {/* Large image + details card */}
        <motion.div
          {...reveal}
          className="mt-10 grid lg:grid-cols-[1.2fr_1fr] overflow-hidden rounded-xl border border-[#BCA28A]/20 shadow-[0_16px_44px_rgba(0,0,0,0.18)]"
        >
          {/* Image */}
          <div className="relative min-h-[280px] md:min-h-[420px]">
            <img
              src={milan.image}
              alt={milan.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4 rounded-full border border-[#E7D6C1]/45 bg-[#9D5F36] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F8F1E8]">
              For Sale
            </div>
          </div>

          {/* Details card */}
          <div className="bg-[#25221D] p-6 md:p-8 text-[#ECE9E7]">
            <h3 className="font-serif text-3xl md:text-4xl tracking-tight">
              {milan.name}
            </h3>
            <p className="mt-3 text-[#ECE9E7]/84 leading-relaxed">
              {milan.teaser}
            </p>

            {/* Stats grid */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#ECE9E7]/15 bg-[#ECE9E7]/5 p-3 text-center">
                <p className="text-xl font-semibold">{milan.bedrooms}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#ECE9E7]/60">
                  Bedrooms
                </p>
              </div>
              <div className="rounded-lg border border-[#ECE9E7]/15 bg-[#ECE9E7]/5 p-3 text-center">
                <p className="text-xl font-semibold">{milan.bathrooms}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#ECE9E7]/60">
                  Bathrooms
                </p>
              </div>
              <div className="rounded-lg border border-[#ECE9E7]/15 bg-[#ECE9E7]/5 p-3 text-center">
                <p className="text-xl font-semibold">{milan.sleeps}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#ECE9E7]/60">
                  Guests
                </p>
              </div>
            </div>

            {/* Amenity tags (first 5) */}
            <div className="mt-5 flex flex-wrap gap-2">
              {milan.amenities.slice(0, 5).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border border-[#ECE9E7]/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[#D8C6AF]"
                >
                  {amenity}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/properties/milan-manor-house"
                className="inline-flex items-center justify-center rounded-md bg-[#ECE9E7] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#1f1d1a] hover:bg-white transition-colors duration-300"
              >
                View Listing
              </Link>
              <Link
                href="/real-estate/contact"
                className="inline-flex items-center justify-center rounded-md border border-[#ECE9E7]/50 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#ECE9E7] hover:bg-[#ECE9E7]/10 transition-colors duration-300"
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
