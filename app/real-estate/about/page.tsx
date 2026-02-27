"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Shield, Award, Building2, Compass, MessageCircle, Search, Heart } from "lucide-react"

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

const VALUES = [
  {
    icon: Compass,
    title: "Steady Guidance",
    body: "A thoughtful, unhurried approach that helps clients navigate decisions with confidence.",
  },
  {
    icon: MessageCircle,
    title: "Clear Communication",
    body: "Transparent, responsive, and straightforward \u2014 no jargon, no pressure.",
  },
  {
    icon: Search,
    title: "Attention to Detail",
    body: "From property specifics to long-term considerations, nothing gets overlooked.",
  },
  {
    icon: Heart,
    title: "Genuinely Invested",
    body: "Not just a transaction \u2014 Craig takes personal pride in every client relationship.",
  },
]

const ASSOCIATIONS = [
  {
    icon: Shield,
    label: "Licensed in the Commonwealth of Virginia",
  },
  {
    icon: Award,
    label: "Member of the National Association of Realtors",
  },
  {
    icon: Building2,
    label: "Member of the Roanoke Valley Association of REALTORS\u00AE",
  },
]

/* ═══════════════════════════════════════════════
   About Craig Page
   ═══════════════════════════════════════════════ */

export default function AboutCraigPage() {
  return (
    <main>
      {/* ───────────────────────────────────────
          1. Hero / Intro
         ─────────────────────────────────────── */}
      <section className="bg-white pt-8 md:pt-16 pb-16 md:pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-14 items-center">
            {/* Left — headshot */}
            <motion.div
              {...reveal}
              className="flex justify-center lg:justify-start"
            >
              <img
                src="/real-estate/craig-headshot.jpg"
                alt="Craig Wilson — President and Founder, Wilson Premier Properties"
                className="h-56 w-56 md:h-72 md:w-72 rounded-2xl border border-[#BCA28A]/30 shadow-[0_12px_40px_rgba(0,0,0,0.12)] object-cover"
              />
            </motion.div>

            {/* Right — text */}
            <motion.div
              {...reveal}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 }}
            >
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
                About Craig
              </p>
              <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
                Craig Wilson
              </h1>
              <p className="mt-3 text-lg text-[#9D5F36] font-medium">
                President &amp; Founder, Wilson Premier Properties
              </p>
              <p className="mt-5 max-w-2xl text-[#2B2B2B]/85 leading-relaxed">
                Craig Wilson is a licensed Virginia real estate professional and the founder of Wilson Premier Properties, a boutique advisory practice dedicated to helping clients buy and sell residential property at Smith Mountain Lake. With deep local knowledge and a commitment to personal service, Craig brings a thoughtful, relationship-first approach to every engagement.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────
          2. The Story
         ─────────────────────────────────────── */}
      <section className="bg-[#f8f4ee] py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div {...reveal}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-4">
              The Story
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
              From Ohio Roots to Lake Living
            </h2>
          </motion.div>

          <div className="mt-10 grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-14 items-start">
            {/* Left — editorial paragraphs */}
            <motion.div {...reveal} className="space-y-5">
              <p className="text-[#2B2B2B]/85 leading-relaxed">
                Originally a native of Ohio, Craig grew up in a community much like Franklin County &mdash; where relationships mattered, people looked out for one another, and a sense of home ran deeper than an address. After building his career and raising his four children in Northern Virginia with his wife Angela, he eventually found his way to Smith Mountain Lake, where the pace, landscape, and community felt familiar and immediately felt like home again.
              </p>
              <p className="text-[#2B2B2B]/85 leading-relaxed">
                As a licensed Virginia residential real estate professional, Craig brings a deep, hands-on understanding of the Smith Mountain Lake market. He takes a thoughtful, unhurried approach, helping clients understand not only the details of a property, but the lifestyle, setting, and long-term considerations that come with lake living. His focus is on education, transparency, and making sure clients feel comfortable and confident throughout the process.
              </p>
              <p className="text-[#2B2B2B]/85 leading-relaxed">
                In addition to his residential advisory work, Craig has experience as a residential and commercial real estate investor and developer at Smith Mountain Lake featuring expertise in hospitality, vacation rentals, and off-lake housing. That background gives him an owner&#39;s perspective on value and long-term ownership, which he uses to better advise clients while keeping decisions straightforward and grounded.
              </p>
              <p className="text-[#2B2B2B]/85 leading-relaxed">
                Craig is deeply connected to the Smith Mountain Lake community and takes pride in contributing to the area where he lives and works. His goal is simple: to offer thoughtful guidance, honest advice, and a refined, professional experience for those buying and selling at the lake.
              </p>
            </motion.div>

            {/* Right — sticky pull quote (lg+ only) */}
            <motion.div
              {...reveal}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const, delay: 0.15 }}
              className="hidden lg:block sticky top-32"
            >
              <div className="rounded-xl border border-[#BCA28A]/25 border-l-4 border-l-[#9D5F36] bg-white p-6 shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-3">
                  In His Words
                </p>
                <p className="font-serif text-lg md:text-xl leading-relaxed text-[#2B2B2B]/90 italic">
                  &ldquo;His goal is simple: to offer thoughtful guidance, honest advice, and a refined, professional experience for those buying and selling at the lake.&rdquo;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────
          3. What Clients Value
         ─────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div {...reveal}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-4">
              What Clients Value
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#2B2B2B]">
              A Relationship-First Approach
            </h2>
          </motion.div>

          <motion.p
            {...reveal}
            className="mt-6 max-w-3xl text-[#2B2B2B]/85 leading-relaxed"
          >
            Clients value Craig&#39;s steady guidance, clear communication, and attention to detail. He is known for being responsive, easy to work with, and genuinely invested in the people he serves &mdash; whether helping families find a place to put down roots, assisting buyers in finding the right lake retreat, or guiding sellers through an important transition.
          </motion.p>

          <motion.div {...reveal} className="mt-12 grid md:grid-cols-2 gap-4">
            {VALUES.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="rounded-xl border border-[#BCA28A]/20 bg-[#f8f4ee] p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#BCA28A]/25 bg-white">
                      <Icon className="h-4 w-4 text-[#9D5F36]" />
                    </span>
                    <h3 className="font-semibold text-[#2B2B2B]">{value.title}</h3>
                  </div>
                  <p className="text-[#2B2B2B]/75 leading-relaxed text-sm">{value.body}</p>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────────────────────
          4. Industry Associations
         ─────────────────────────────────────── */}
      <section className="bg-[#f8f4ee] py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div {...reveal}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D5F36] font-semibold mb-4">
              Industry Associations
            </p>
          </motion.div>

          <motion.div {...reveal} className="mt-6 grid md:grid-cols-3 gap-4">
            {ASSOCIATIONS.map((assoc) => {
              const Icon = assoc.icon
              return (
                <div
                  key={assoc.label}
                  className="rounded-xl border border-[#BCA28A]/20 bg-white p-5 flex items-start gap-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#BCA28A]/25 bg-[#f8f4ee]">
                    <Icon className="h-5 w-5 text-[#9D5F36]" />
                  </span>
                  <p className="text-[#2B2B2B]/85 leading-relaxed font-medium text-sm pt-1.5">
                    {assoc.label}
                  </p>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────────────────────
          5. CTA Banner
         ─────────────────────────────────────── */}
      <section className="bg-[#2B2B2B] py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div {...reveal}>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-[#ECE9E7]">
              Ready to explore lake living?
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-[#ECE9E7]/75 leading-relaxed">
              Whether you&#39;re considering a move to Smith Mountain Lake or exploring your options, Craig is here to help you navigate every step with confidence.
            </p>
            <div className="mt-8">
              <Button
                className="bg-[#9D5F36] hover:bg-[#8A5230] text-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.13em] rounded-md transition-colors duration-300 h-auto"
                onClick={() => { window.location.href = "/real-estate/contact" }}
              >
                Contact Craig
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
