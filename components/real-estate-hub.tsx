"use client"

import { useMemo, useState, type ReactNode, useRef, useEffect } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion"
import { CalendarClock, Fish, Home, Mail, MapPin, MessageCircle, Mountain, Phone, TreePine, UserRound, Waves, type LucideIcon } from "lucide-react"
import { properties } from "@/lib/data"

type SectionKey = "about-craig" | "about-sml" | "sml-happenings" | "contact"
type ModalKey = "craig-story" | "career-highlights" | "sml-deep-dive" | "distance-access" | "market-momentum" | "contact-intent" | null

const TABS: Array<{ key: SectionKey; label: string; hint: string; icon: LucideIcon }> = [
  { key: "about-sml", label: "About SML", hint: "Lake profile + market", icon: Mountain },
  { key: "about-craig", label: "About Craig", hint: "Profile + track record", icon: UserRound },
  { key: "sml-happenings", label: "SML Happenings", hint: "Seasonal pulse", icon: CalendarClock },
  { key: "contact", label: "Contact", hint: "Direct inquiry", icon: MessageCircle },
]

const happenings = [
  {
    title: "Spring Home Showcase",
    timing: "March - April",
    body: "Private tours, curated previews, and relationship-first planning for high-interest waterfront opportunities.",
  },
  {
    title: "Lakefront Summer Season",
    timing: "May - August",
    body: "Peak boating season and active buyer traffic, with strong demand around premium shoreline inventory.",
  },
  {
    title: "Fall Strategy Window",
    timing: "September - November",
    body: "Foliage season and calmer inventory cycles create an ideal environment for deliberate acquisition decisions.",
  },
  {
    title: "Winter Planning Cycle",
    timing: "December - February",
    body: "Seller prep, positioning, and early-buyer strategy ahead of spring listing velocity.",
  },
]

export function RealEstateHub() {
  const [activeTab, setActiveTab] = useState<SectionKey>("about-sml")
  const [activeModal, setActiveModal] = useState<ModalKey>(null)
  const [submitted, setSubmitted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const glowX = useMotionValue(0)
  const glowY = useMotionValue(0)
  const smoothGlowX = useSpring(glowX, { stiffness: 180, damping: 22 })
  const smoothGlowY = useSpring(glowY, { stiffness: 180, damping: 22 })

  const milan = useMemo(() => properties.find((p) => p.name === "Milan Manor"), [])

  const panel = useMemo(() => {
    if (activeTab === "about-craig") {
      return (
        <AboutCraig
          onOpen={() => setActiveModal("craig-story")}
          onOpenCareer={() => setActiveModal("career-highlights")}
        />
      )
    }
    if (activeTab === "about-sml") {
      return (
        <AboutSml
          onOpenDeepDive={() => setActiveModal("sml-deep-dive")}
          onOpenDistance={() => setActiveModal("distance-access")}
          onOpenMarket={() => setActiveModal("market-momentum")}
        />
      )
    }
    if (activeTab === "sml-happenings") return <SmlHappenings />
    return <ContactPanel submitted={submitted} setSubmitted={setSubmitted} onOpenIntent={() => setActiveModal("contact-intent")} />
  }, [activeTab, submitted])

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    glowX.set(e.clientX - rect.left - 140)
    glowY.set(e.clientY - rect.top - 140)
  }

  return (
    <section ref={sectionRef} onMouseMove={handleMove} className="relative overflow-hidden pt-32 md:pt-36 pb-20">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute -top-20 left-[-140px] h-[360px] w-[360px] rounded-full bg-[#9D5F36]/12 blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="absolute top-[220px] right-[-120px] h-[320px] w-[320px] rounded-full bg-[#2B2B2B]/8 blur-[95px]"
        />
        <motion.div
          style={{ x: smoothGlowX, y: smoothGlowY }}
          className="hidden md:block absolute h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(157,95,54,0.18)_0%,rgba(157,95,54,0.08)_35%,rgba(157,95,54,0)_72%)]"
        />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #2B2B2B 1px, transparent 0)", backgroundSize: "26px 26px" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-10">
        <header className="rounded-[28px] border border-[#BCA28A]/35 bg-[linear-gradient(135deg,#1f1d1a_0%,#2B2B2B_100%)] text-[#ECE9E7] p-6 md:p-10 shadow-[0_20px_55px_rgba(0,0,0,0.28)]">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#D8C6AF]">Smith Mountain Lake Real Estate</p>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl tracking-tight leading-[1.02]">
            Lakefront Buying and Selling, Done the Right Way
          </h1>
          <p className="mt-4 max-w-3xl text-[#ECE9E7]/82 leading-relaxed">
            Discover Smith Mountain Lake through a modern, interactive real-estate experience built around clarity, story, and actionable guidance.
          </p>
        </header>

        {milan && (
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-7 grid md:grid-cols-[1.2fr_1fr] overflow-hidden rounded-[26px] border border-[#BCA28A]/30 bg-[#25221D] shadow-[0_18px_44px_rgba(0,0,0,0.3)]"
          >
            <div className="relative min-h-[260px] md:min-h-[380px]">
              <img src={milan.image} alt={milan.name} className="h-full w-full object-cover" />
              <div className="absolute left-4 top-4 rounded-full border border-[#E7D6C1]/45 bg-[#9D5F36]/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F8F1E8]">
                For Sale
              </div>
            </div>
            <div className="p-6 md:p-8 text-[#ECE9E7]">
              <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Milan Manor</h2>
              <p className="mt-3 text-[#ECE9E7]/84 leading-relaxed">{milan.teaser}</p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <Stat label="Bedrooms" value={String(milan.bedrooms)} />
                <Stat label="Bathrooms" value={String(milan.bathrooms)} />
                <Stat label="Guests" value={String(milan.sleeps)} />
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/properties/milan-manor-house"
                  className="inline-flex items-center justify-center rounded-full bg-[#ECE9E7] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#1f1d1a] hover:bg-white transition-colors"
                >
                  View Listing
                </Link>
                <button
                  onClick={() => setActiveModal("market-momentum")}
                  className="inline-flex items-center justify-center rounded-full border border-[#ECE9E7]/55 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#ECE9E7] hover:bg-[#ECE9E7]/12 transition-colors"
                >
                  Why This Matters
                </button>
              </div>
            </div>
          </motion.article>
        )}

        <div className="mt-8 grid lg:grid-cols-[290px_1fr] gap-6">
          <aside className="lg:sticky lg:top-28 h-fit rounded-2xl border border-[#2B2B2B]/12 bg-white/75 backdrop-blur-md p-4 md:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#9D5F36] font-semibold mb-3">Sections</p>
            <nav className="space-y-2">
              {TABS.map((tab) => {
                const active = activeTab === tab.key
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all ${
                      active ? "border-[#9D5F36]/45 text-[#9D5F36]" : "border-[#2B2B2B]/12 text-[#2B2B2B]/70 hover:border-[#9D5F36]/25 hover:text-[#9D5F36]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="real-estate-active-nav"
                        className="absolute inset-0 bg-[#9D5F36]/10"
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2.5">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${active ? "border-[#9D5F36]/30 bg-white/70" : "border-[#2B2B2B]/12 bg-white/65"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12px] uppercase tracking-[0.11em] font-semibold">{tab.label}</span>
                        <span className="block text-[10px] tracking-[0.06em] opacity-70">{tab.hint}</span>
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
            <div className="mt-4 rounded-xl border border-[#BCA28A]/28 bg-[#f8f4ee] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold">Quick Facts</p>
              <ul className="mt-2 space-y-1.5 text-[13px] text-[#2B2B2B]/78">
                <li>20,600 acres</li>
                <li>40 miles in length</li>
                <li>500+ miles of shoreline</li>
                <li>Full pond: 795 ft</li>
              </ul>
            </div>
          </aside>

          <div className="space-y-3">
            <div className="rounded-2xl border border-[#2B2B2B]/12 bg-white/78 p-3 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveModal("sml-deep-dive")}
                className="rounded-full border border-[#9D5F36]/35 bg-[#fff8f2] px-3.5 py-2 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
              >
                Lake Deep Dive
              </button>
              <button
                onClick={() => setActiveModal("distance-access")}
                className="rounded-full border border-[#9D5F36]/35 bg-[#fff8f2] px-3.5 py-2 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
              >
                Distance + Access
              </button>
              <button
                onClick={() => setActiveModal("market-momentum")}
                className="rounded-full border border-[#9D5F36]/35 bg-[#fff8f2] px-3.5 py-2 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
              >
                Market Pulse
              </button>
              <button
                onClick={() => setActiveModal("contact-intent")}
                className="rounded-full border border-[#9D5F36]/35 bg-[#fff8f2] px-3.5 py-2 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
              >
                Contact Guide
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24 }}
                className="rounded-[24px] border border-[#2B2B2B]/12 bg-white/86 p-5 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              >
                {panel}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <footer className="mt-10 rounded-[26px] border border-[#2B2B2B]/12 bg-[#1f1d1a] text-[#ECE9E7] p-6 md:p-8">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-start">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-xl overflow-hidden border border-[#ECE9E7]/25 bg-[#ECE9E7]/8">
                <img src="/real-estate/craig-headshot.jpg" alt="Craig Wilson headshot" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold">Craig Wilson</p>
                <p className="text-xs text-[#ECE9E7]/75 mt-1">Real Estate Developer / Agent / Advisor / Investor</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md border border-[#ECE9E7]/22 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">RE/MAX</span>
                  <span className="rounded-md border border-[#ECE9E7]/22 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">NAR</span>
                  <span className="rounded-md border border-[#ECE9E7]/22 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">RVAR</span>
                </div>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">Contact Info</p>
              <p className="text-[#ECE9E7]/78">16451 Booker T. Washington Hwy. Moneta, VA 24121</p>
              <p className="text-[#ECE9E7]/78">Mobile: 540-281-3188</p>
              <p className="text-[#ECE9E7]/78">Email: craig@wilson-premier.com</p>
              <a
                href="https://www.facebook.com/askcraig"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-1 text-[#D8C6AF] hover:text-white transition-colors"
              >
                Facebook: askcraig
              </a>
            </div>
          </div>
          <div className="mt-6 border-t border-[#ECE9E7]/15 pt-4 text-xs text-[#ECE9E7]/72 leading-relaxed">
            Copyright © 2026 All Rights Reserved | Wilson Premier Properties
            <br />
            Smith Mountain Lake Real Estate | Privacy Policy | Terms &amp; Disclaimers | Sitemap
          </div>
        </footer>
      </div>

      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] rounded-2xl border border-[#2B2B2B]/12 bg-white/90 backdrop-blur-md px-2 py-1.5 shadow-[0_14px_28px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            return (
              <button
                key={`dock-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl p-2.5 transition-colors ${active ? "bg-[#9D5F36] text-white" : "text-[#2B2B2B]/72 hover:bg-[#2B2B2B]/6"}`}
                aria-label={tab.label}
                title={tab.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      </div>

      <NarrativeModals active={activeModal} onClose={() => setActiveModal(null)} onChange={setActiveModal} />
    </section>
  )
}

function AboutCraig({ onOpen, onOpenCareer }: { onOpen: () => void; onOpenCareer: () => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#2B2B2B]/12 bg-[linear-gradient(135deg,#ffffff_0%,#f7f1e8_100%)] p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="h-40 w-40 rounded-2xl overflow-hidden border border-[#2B2B2B]/12 shrink-0">
            <img src="/real-estate/craig-headshot.jpg" alt="Craig Wilson" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-[#2B2B2B]">Craig Wilson</h2>
            <p className="mt-2 text-[#9D5F36] uppercase tracking-[0.14em] text-[11px] font-semibold">
              Real Estate Developer / Agent / Advisor / Investor / Airbnb Host / Landlord
            </p>
            <p className="mt-3 text-[#2B2B2B]/78 leading-relaxed">
              Executive operator turned lake real-estate advisor. Clear process. Fast follow-through. Long-term lens.
            </p>
          </div>
        </div>
      </div>

      <StoryBlock overline="Approach" title="How Craig Works">
        <div className="grid sm:grid-cols-3 gap-2">
          <QuickPill title="Listen First" text="Goals before listings." />
          <QuickPill title="Keep It Clear" text="Straight answers, no noise." />
          <QuickPill title="Execute Tight" text="Timelines and follow-through." />
        </div>
        <button
          onClick={onOpen}
          className="mt-4 rounded-full border border-[#9D5F36]/45 px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
        >
          Open Full Story
        </button>
        <button
          onClick={onOpenCareer}
          className="mt-2 ml-2 rounded-full border border-[#2B2B2B]/25 px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-[#2B2B2B]/80 hover:bg-[#2B2B2B]/8 transition-colors"
        >
          Open Career Highlights
        </button>
      </StoryBlock>

      <StoryBlock overline="Specialties" title="Operational and Advisory Capabilities">
        <div className="flex flex-wrap gap-2">
          {[
            "Program Management",
            "Business Development",
            "Strategy",
            "P&L Oversight",
            "Capture + Delivery",
            "SDLC",
            "Enterprise Applications",
            "Threat Intelligence",
            "Operations (HR/Finance/IT)",
          ].map((skill) => (
            <span key={skill} className="rounded-full border border-[#9D5F36]/28 bg-[#fff8f2] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] font-semibold text-[#9D5F36]">
              {skill}
            </span>
          ))}
        </div>
      </StoryBlock>
    </div>
  )
}

function AboutSml({
  onOpenDeepDive,
  onOpenDistance,
  onOpenMarket,
}: {
  onOpenDeepDive: () => void
  onOpenDistance: () => void
  onOpenMarket: () => void
}) {
  return (
    <div className="space-y-8">
      <StoryBlock overline="SML Snapshot" title="Quick View">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <QuickMetric label="Acres" value="20,600" />
          <QuickMetric label="Length" value="~40 mi" />
          <QuickMetric label="Shoreline" value="500+ mi" />
          <QuickMetric label="Full Pond" value="795 ft" />
        </div>
        <button
          onClick={onOpenDeepDive}
          className="mt-4 rounded-full border border-[#9D5F36]/45 px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
        >
          Open Deep Dive
        </button>
      </StoryBlock>

      <StoryBlock overline="Life at SML" title="Lifestyle Profile">
        <div className="grid md:grid-cols-2 gap-4">
          <Fact icon={<Waves className="h-4 w-4" />} title="Water & Geography" body="20,600 acres, 40-mile length, average depth around 55 ft, maximum depth near 250 ft." />
          <Fact icon={<TreePine className="h-4 w-4" />} title="Parks & Trails" body="State park access, hiking and biking trails, swimming areas, and year-round outdoor activity." />
          <Fact icon={<Fish className="h-4 w-4" />} title="Fishery" body="Strong species diversity including largemouth and smallmouth bass, striped bass, crappie, and catfish." />
          <Fact icon={<Home className="h-4 w-4" />} title="Communities" body="Waterfront neighborhoods, low-maintenance communities, condos, and townhomes." />
        </div>
      </StoryBlock>

      <StoryBlock overline="Accessibility" title="Easy Reach">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Distance city="Lynchburg, VA" miles="~30" time="~45 min" />
          <Distance city="Roanoke, VA" miles="~45" time="~1 hr" />
          <Distance city="Raleigh-Durham, NC" miles="~150" time="~2.5-3 hrs" />
          <Distance city="Charlotte, NC" miles="~190" time="~3.5 hrs" />
          <Distance city="Washington, D.C." miles="~245" time="~4-4.5 hrs" />
          <Distance city="New York, NY" miles="~450" time="~7.5-8 hrs" />
        </div>
        <button
          onClick={onOpenDistance}
          className="mt-4 rounded-full border border-[#9D5F36]/45 px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
        >
          View Full Distance Narrative
        </button>
      </StoryBlock>

      <StoryBlock overline="Market Pulse" title="What Buyers Like">
        <div className="grid sm:grid-cols-2 gap-2">
          <QuickPill title="Choice" text="Waterfront, access, condos, townhomes." />
          <QuickPill title="Taxes" text="Generally favorable county rates." />
          <QuickPill title="Lifestyle" text="Active + quiet balance year-round." />
          <QuickPill title="Value" text="Strong long-term ownership appeal." />
        </div>
        <button
          onClick={onOpenMarket}
          className="mt-4 rounded-full border border-[#9D5F36]/45 px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
        >
          Open Market Insights
        </button>
      </StoryBlock>
    </div>
  )
}

function SmlHappenings() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-[#2B2B2B]">SML Happenings</h2>
      <div className="rounded-xl border border-[#2B2B2B]/10 bg-[#fff8f2] px-3 py-2 text-sm text-[#2B2B2B]/72">
        Seasonality drives timing. Use these windows to plan tours, pricing, and offer strategy.
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {happenings.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.28, delay: i * 0.05 }}
            className="rounded-2xl border border-[#2B2B2B]/12 bg-[#f8f4ee] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif text-xl text-[#2B2B2B]">{item.title}</h3>
              <span className="text-[10px] uppercase tracking-[0.13em] text-[#9D5F36] font-semibold">{item.timing}</span>
            </div>
            <p className="mt-2 text-[#2B2B2B]/76 leading-relaxed">{item.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ContactPanel({
  submitted,
  setSubmitted,
  onOpenIntent,
}: {
  submitted: boolean
  setSubmitted: (value: boolean) => void
  onOpenIntent: () => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-[#2B2B2B]">Contact</h2>
      <div className="rounded-xl border border-[#2B2B2B]/10 bg-[#fff8f2] px-3 py-2 text-sm text-[#2B2B2B]/72">
        Send a quick brief and get a direct callback.
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.2fr_1fr] gap-5">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
          }}
          className="rounded-2xl border border-[#2B2B2B]/12 bg-[#f8f4ee] p-4 md:p-5 space-y-3"
        >
          <Field label="Full Name" placeholder="Your name" />
          <Field label="Email" placeholder="you@example.com" type="email" />
          <Field label="Mobile" placeholder="540-281-3188" />
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9D5F36]">Message</span>
            <textarea
              rows={5}
              placeholder="Tell us what you are looking for..."
              className="w-full rounded-xl border border-[#2B2B2B]/14 bg-white px-3 py-2.5 text-sm text-[#2B2B2B] outline-none focus:border-[#9D5F36]/45"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-[#2B2B2B] text-[#ECE9E7] px-6 py-3 text-[11px] uppercase tracking-[0.13em] font-semibold hover:bg-[#1b1a17] transition-colors"
            >
              Send Inquiry
            </button>
            <button
              type="button"
              onClick={onOpenIntent}
              className="rounded-full border border-[#9D5F36]/45 px-5 py-3 text-[11px] uppercase tracking-[0.13em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
            >
              Inquiry Guide
            </button>
          </div>
          {submitted && <p className="text-sm text-[#2B2B2B]/75">Thanks. We received your request and will follow up shortly.</p>}
        </form>

        <aside className="rounded-2xl border border-[#2B2B2B]/12 bg-white p-4 md:p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.13em] text-[#9D5F36] font-semibold">Contact Info</p>
          <InfoRow icon={<MapPin className="h-4 w-4" />} text="16451 Booker T. Washington Hwy. Moneta, VA 24121" />
          <InfoRow icon={<Phone className="h-4 w-4" />} text="540-281-3188" />
          <InfoRow icon={<Mail className="h-4 w-4" />} text="craig@wilson-premier.com" />
          <div className="pt-2 border-t border-[#2B2B2B]/10">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#9D5F36] font-semibold mb-1.5">Spam Protection Options</p>
            <ul className="text-[13px] text-[#2B2B2B]/75 space-y-1">
              <li>Masked email with server relay form</li>
              <li>CAPTCHA + rate limiting on form endpoint</li>
              <li>Click-to-reveal phone on high-risk pages</li>
            </ul>
          </div>
          <a href="https://www.facebook.com/askcraig" target="_blank" rel="noopener noreferrer" className="inline-flex text-sm text-[#9D5F36] hover:text-[#2B2B2B] transition-colors">
            Facebook: askcraig
          </a>
        </aside>
      </div>
    </div>
  )
}

function NarrativeModals({
  active,
  onClose,
  onChange,
}: {
  active: ModalKey
  onClose: () => void
  onChange: (next: Exclude<ModalKey, null>) => void
}) {
  const modalOrder: Exclude<ModalKey, null>[] = [
    "craig-story",
    "career-highlights",
    "sml-deep-dive",
    "distance-access",
    "market-momentum",
    "contact-intent",
  ]
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    setFocusMode(false)
  }, [active])

  const content: Record<Exclude<ModalKey, null>, { title: string; body: ReactNode }> = {
    "craig-story": {
      title: "About Craig",
      body: (
        <div className="space-y-5 text-[#2B2B2B]/80 leading-relaxed">
          <div className="grid md:grid-cols-[110px_1fr] gap-4 items-start rounded-2xl border border-[#2B2B2B]/10 bg-white p-3">
            <img src="/real-estate/craig-headshot.jpg" alt="Craig Wilson" className="h-[110px] w-[110px] rounded-xl object-cover border border-[#2B2B2B]/12" />
            <div>
              <p className="text-lg font-serif text-[#2B2B2B]">Craig Wilson</p>
              <p className="text-[11px] uppercase tracking-[0.11em] text-[#9D5F36] font-semibold mt-1">
                Real Estate Developer / Agent / Advisor / Investor
              </p>
              <p className="mt-2 text-sm text-[#2B2B2B]/76">
                Executive discipline meets lake-market guidance. The approach is direct: align on goals, frame options, execute with precision.
              </p>
            </div>
          </div>

          <ModalSection title="Operating Style">
            <div className="grid sm:grid-cols-3 gap-2">
              <QuickPill title="Listen First" text="Clarify intent and constraints before touring." />
              <QuickPill title="Structure Fast" text="Prioritize options by fit and timeline." />
              <QuickPill title="Execute Clean" text="Decisions, paperwork, and follow-through." />
            </div>
          </ModalSection>

          <ModalSection title="Background Snapshot">
            <div className="flex flex-wrap gap-2">
              {[
                "Wilson Premier Properties",
                "John Carroll University",
                "Centreville, Virginia",
                "Federal + Commercial Leadership",
                "Residential + Commercial Investor",
              ].map((item) => (
                <span key={item} className="rounded-full border border-[#2B2B2B]/14 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#2B2B2B]/75">
                  {item}
                </span>
              ))}
            </div>
          </ModalSection>

          <ModalSection title="Education">
            <p className="text-sm text-[#2B2B2B]/78">John Carroll University — BSBA, HR Management & Information Systems</p>
          </ModalSection>

          <ModalSection title="Advisory Flow">
            <AdvisoryFlowDiagram />
          </ModalSection>
        </div>
      ),
    },
    "career-highlights": {
      title: "Career Highlights",
      body: (
        <div className="space-y-5">
          <ModalSection title="Current Focus">
            <TimelineRow company="Wilson Premier Properties" role="Real Estate Developer / Agent / Investor" years="2022 - Present" />
          </ModalSection>

          <ModalSection title="Prior Leadership Roles">
            <div className="space-y-2">
              <TimelineRow company="Recorded Future" role="Federal Account Executive" years="2019 - 2022" />
              <TimelineRow company="LookingGlass Cyber Solutions" role="Strategic Account Manager" years="2014 - 2019" />
              <TimelineRow company="SRA International" role="Vice President / Account Manager" years="2012 - 2014" />
              <TimelineRow company="SEKON" role="Chief Operating / Strategy Officer" years="2000 - 2012" />
            </div>
          </ModalSection>

          <ModalSection title="Core Competencies">
            <div className="grid sm:grid-cols-2 gap-2">
              <QuickPill title="Program + Portfolio" text="Governance, execution, and outcomes." />
              <QuickPill title="Growth + Capture" text="Pipeline, positioning, conversion." />
              <QuickPill title="Operations" text="Finance, HR, contracts, delivery." />
              <QuickPill title="Technical Fluency" text="Enterprise systems + implementation." />
            </div>
          </ModalSection>

          <ModalSection title="Career Arc">
            <CareerArcDiagram />
          </ModalSection>
        </div>
      ),
    },
    "sml-deep-dive": {
      title: "About Smith Mountain Lake - Deep Dive",
      body: (
        <div className="space-y-5 text-[#2B2B2B]/80 leading-relaxed">
          <ModalSection title="Core Facts">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <QuickMetric label="Acres" value="20,600" />
              <QuickMetric label="Length" value="~40 mi" />
              <QuickMetric label="Shoreline" value="500+ mi" />
              <QuickMetric label="Full Pond" value="795 ft" />
            </div>
          </ModalSection>

          <ModalSection title="History">
            <p className="text-sm text-[#2B2B2B]/78">
              Created in the early 1960s as a hydroelectric project, Smith Mountain Lake reached full pond in 1966 and evolved into one of Virginia’s strongest recreation-plus-residential destinations.
            </p>
          </ModalSection>

          <ModalSection title="Lifestyle Energy">
            <div className="grid sm:grid-cols-2 gap-2">
              <QuickPill title="Water Activity" text="Boating, paddling, and fishing year-round." />
              <QuickPill title="Land Activity" text="Trails, golf, and community events." />
              <QuickPill title="Social Rhythm" text="Restaurants, marinas, and local gatherings." />
              <QuickPill title="Ownership Appeal" text="Primary home and second-home flexibility." />
            </div>
          </ModalSection>

          <ModalSection title="Lake Profile Diagram">
            <LakeProfileDiagram />
          </ModalSection>
        </div>
      ),
    },
    "distance-access": {
      title: "Distance and Access Context",
      body: (
        <div className="space-y-5 text-[#2B2B2B]/80 leading-relaxed">
          <ModalSection title="Why Access Matters">
            <p className="text-sm text-[#2B2B2B]/78">
              SML feels removed enough to reset, yet close enough for practical repeat use. This is a major reason owners maintain strong year-over-year attachment.
            </p>
          </ModalSection>

          <ModalSection title="Drive-Time Bands">
            <div className="grid sm:grid-cols-2 gap-2">
              <Distance city="Lynchburg / Roanoke" miles="~30-45" time="~45 min - 1 hr" />
              <Distance city="RDU / Charlotte" miles="~150-190" time="~2.5 - 3.5 hrs" />
              <Distance city="DC / Baltimore" miles="~245-275" time="~4 - 5 hrs" />
              <Distance city="New York" miles="~450" time="~7.5 - 8 hrs" />
            </div>
          </ModalSection>

          <ModalSection title="Best-Use Patterns">
            <div className="grid sm:grid-cols-3 gap-2">
              <QuickPill title="Weekend Owners" text="Predictable short-stay travel." />
              <QuickPill title="Seasonal Owners" text="Extended spring/summer occupancy." />
              <QuickPill title="Full-Time Moves" text="Relocation with metro optionality." />
            </div>
          </ModalSection>

          <ModalSection title="Access Bands Diagram">
            <AccessBandsDiagram />
          </ModalSection>
        </div>
      ),
    },
    "market-momentum": {
      title: "Market Momentum at SML",
      body: (
        <div className="space-y-5 text-[#2B2B2B]/80 leading-relaxed">
          <ModalSection title="What Moves Deals">
            <div className="grid sm:grid-cols-2 gap-2">
              <QuickPill title="Positioning" text="Condition, pricing, and presentation alignment." />
              <QuickPill title="Timing" text="Season affects both demand and leverage." />
              <QuickPill title="Product Fit" text="Waterfront vs access vs lock-and-leave." />
              <QuickPill title="Readiness" text="Financing + decision clarity accelerates outcomes." />
            </div>
          </ModalSection>

          <ModalSection title="Inventory Character">
            <p className="text-sm text-[#2B2B2B]/78">
              The market spans custom waterfront estates, planned communities, condos, and townhomes. Strong options exist across multiple price bands when strategy matches goals.
            </p>
          </ModalSection>

          <ModalSection title="Owner Perspective">
            <p className="text-sm text-[#2B2B2B]/78">
              Long-term value at SML is typically tied to usability, access, and flexibility. Buyers who define these early tend to make stronger decisions.
            </p>
          </ModalSection>

          <ModalSection title="Seasonality Cycle">
            <MarketCycleDiagram />
          </ModalSection>
        </div>
      ),
    },
    "contact-intent": {
      title: "Inquiry Guide",
      body: (
        <div className="space-y-5 text-[#2B2B2B]/80 leading-relaxed">
          <ModalSection title="Best First Message">
            <div className="grid sm:grid-cols-2 gap-2">
              <QuickPill title="Timing" text="Target move or purchase window." />
              <QuickPill title="Use Case" text="Primary, second home, or investment." />
              <QuickPill title="Location Fit" text="Preferred area or shoreline type." />
              <QuickPill title="Budget Band" text="Comfort range, not exact target." />
            </div>
          </ModalSection>

          <ModalSection title="What You Get Back">
            <div className="grid sm:grid-cols-3 gap-2">
              <QuickPill title="Clear Shortlist" text="Options mapped to your goals." />
              <QuickPill title="Risk Notes" text="Tradeoffs surfaced early." />
              <QuickPill title="Action Plan" text="Simple next steps with timing." />
            </div>
          </ModalSection>

          <ModalSection title="Contact Channels">
            <div className="rounded-xl border border-[#2B2B2B]/10 bg-white p-3 text-sm text-[#2B2B2B]/76 space-y-1">
              <p>Office: 16451 Booker T. Washington Hwy. Moneta, VA 24121</p>
              <p>Mobile: 540-281-3188</p>
              <p>Email: craig@wilson-premier.com</p>
            </div>
          </ModalSection>

          <ModalSection title="Response Path">
            <ContactPathDiagram />
          </ModalSection>
        </div>
      ),
    },
  }

  const quickActions: Record<Exclude<ModalKey, null>, Array<{ label: string; target: Exclude<ModalKey, null> }>> = {
    "craig-story": [
      { label: "Career Highlights", target: "career-highlights" },
      { label: "SML Deep Dive", target: "sml-deep-dive" },
    ],
    "career-highlights": [
      { label: "About Craig", target: "craig-story" },
      { label: "Market Momentum", target: "market-momentum" },
    ],
    "sml-deep-dive": [
      { label: "Distance + Access", target: "distance-access" },
      { label: "Market Momentum", target: "market-momentum" },
    ],
    "distance-access": [
      { label: "SML Deep Dive", target: "sml-deep-dive" },
      { label: "Contact Guide", target: "contact-intent" },
    ],
    "market-momentum": [
      { label: "Distance + Access", target: "distance-access" },
      { label: "Contact Guide", target: "contact-intent" },
    ],
    "contact-intent": [
      { label: "Market Momentum", target: "market-momentum" },
      { label: "About Craig", target: "craig-story" },
    ],
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            className="relative w-full max-w-3xl max-h-[84vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl border border-[#BCA28A]/35 bg-[#f6efe6]/98 backdrop-blur-md p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 h-9 w-9 rounded-full border border-[#2B2B2B]/15 text-[#2B2B2B]/65 hover:bg-[#2B2B2B]/8 hover:text-[#2B2B2B] transition-colors"
              aria-label="Close"
            >
              ×
            </button>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold">Narrative Detail</p>
            <h3 className="mt-1 text-2xl md:text-3xl font-serif text-[#2B2B2B]">{content[active].title}</h3>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFocusMode((v) => !v)}
                className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.11em] font-semibold transition-colors ${
                  focusMode
                    ? "border-[#9D5F36]/45 bg-[#9D5F36]/10 text-[#9D5F36]"
                    : "border-[#2B2B2B]/18 bg-white text-[#2B2B2B]/72 hover:text-[#9D5F36]"
                }`}
              >
                {focusMode ? "Focus Mode On" : "Focus Mode"}
              </button>
              {quickActions[active].map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setFocusMode(false)
                    onChange(action.target)
                  }}
                  className="rounded-full border border-[#2B2B2B]/18 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#2B2B2B]/72 hover:text-[#9D5F36] transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
            <div className={`mt-4 ${focusMode ? "opacity-[0.96]" : ""}`}>{content[active].body}</div>
            <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#2B2B2B]/10 pt-3">
              <button
                onClick={() => {
                  const idx = modalOrder.indexOf(active)
                  const prev = idx <= 0 ? modalOrder[modalOrder.length - 1] : modalOrder[idx - 1]
                  setFocusMode(false)
                  onChange(prev)
                }}
                className="rounded-full border border-[#2B2B2B]/18 bg-white px-4 py-2 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#2B2B2B]/72 hover:text-[#9D5F36] transition-colors"
              >
                Previous
              </button>
              <button
                onClick={onClose}
                className="rounded-full border border-[#9D5F36]/45 bg-[#fff8f2] px-4 py-2 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const idx = modalOrder.indexOf(active)
                  const next = idx >= modalOrder.length - 1 ? modalOrder[0] : modalOrder[idx + 1]
                  setFocusMode(false)
                  onChange(next)
                }}
                className="rounded-full border border-[#2B2B2B]/18 bg-white px-4 py-2 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#2B2B2B]/72 hover:text-[#9D5F36] transition-colors"
              >
                Next
              </button>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StoryBlock({ overline, title, children }: { overline: string; title: string; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.28 }}
      className="rounded-2xl border border-[#2B2B2B]/12 bg-[#f8f4ee] p-4 md:p-5"
    >
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold">{overline}</p>
      <h3 className="mt-1 text-xl md:text-2xl font-serif text-[#2B2B2B]">{title}</h3>
      <div className="mt-3">{children}</div>
    </motion.section>
  )
}

function ModalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-[#2B2B2B]/12 bg-[#fffaf4] p-3.5 shadow-[0_6px_16px_rgba(0,0,0,0.04)]"
    >
      <p className="text-[10px] uppercase tracking-[0.13em] text-[#9D5F36] font-semibold">{title}</p>
      <div className="mt-2.5">{children}</div>
    </motion.section>
  )
}

function Fact({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-[#2B2B2B]/12 bg-white p-4">
      <div className="flex items-center gap-2 text-[#9D5F36]">
        {icon}
        <p className="text-[11px] uppercase tracking-[0.13em] font-semibold">{title}</p>
      </div>
      <p className="mt-2 text-[#2B2B2B]/78 leading-relaxed">{body}</p>
    </article>
  )
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9D5F36]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#2B2B2B]/14 bg-white px-3 py-2.5 text-sm text-[#2B2B2B] outline-none focus:border-[#9D5F36]/45"
      />
    </label>
  )
}

function InfoRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-[#2B2B2B]/78">
      <span className="mt-0.5 text-[#9D5F36]">{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function Distance({ city, miles, time }: { city: string; miles: string; time: string }) {
  return (
    <article className="rounded-xl border border-[#2B2B2B]/12 bg-white px-3 py-2.5">
      <p className="text-sm font-semibold text-[#2B2B2B]">{city}</p>
      <p className="mt-1 text-xs text-[#2B2B2B]/72">
        {miles} miles • {time}
      </p>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#BCA28A]/28 bg-[#2B2B2B]/60 p-2.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#BCA28A]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#F2E9DE]">{value}</p>
    </div>
  )
}

function TimelineRow({ company, role, years }: { company: string; role: string; years: string }) {
  return (
    <div className="rounded-xl border border-[#2B2B2B]/10 bg-white px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#2B2B2B]">{company}</p>
        <span className="text-[10px] uppercase tracking-[0.11em] font-semibold text-[#9D5F36]">{years}</span>
      </div>
      <p className="text-xs text-[#2B2B2B]/65 mt-0.5">{role}</p>
    </div>
  )
}

function QuickMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#2B2B2B]/10 bg-white px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-[0.1em] text-[#2B2B2B]/55">{label}</p>
      <p className="text-base font-semibold text-[#2B2B2B]">{value}</p>
    </div>
  )
}

function QuickPill({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-[#2B2B2B]/10 bg-white px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.11em] text-[#9D5F36] font-semibold">{title}</p>
      <p className="mt-1 text-sm text-[#2B2B2B]/72">{text}</p>
    </div>
  )
}

function AdvisoryFlowDiagram() {
  const steps = ["Discover", "Align", "Tour", "Decide", "Execute"]
  return (
    <div className="grid grid-cols-5 gap-2">
      {steps.map((s, i) => (
        <motion.div
          key={s}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: i * 0.05 }}
          className="rounded-lg border border-[#2B2B2B]/10 bg-white p-2 text-center"
        >
          <p className="text-[9px] uppercase tracking-[0.09em] text-[#2B2B2B]/55">{i + 1}</p>
          <p className="mt-1 text-[11px] font-semibold text-[#2B2B2B]">{s}</p>
        </motion.div>
      ))}
    </div>
  )
}

function CareerArcDiagram() {
  const bars = [30, 45, 60, 72, 85]
  return (
    <div className="rounded-xl border border-[#2B2B2B]/10 bg-white p-3">
      <div className="flex items-end gap-2 h-28">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${h}%`, opacity: 1 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="flex-1 rounded-t-md bg-gradient-to-t from-[#9D5F36] to-[#d4b08f]"
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-[#2B2B2B]/62">Leadership depth across operations, growth, and delivery.</p>
    </div>
  )
}

function LakeProfileDiagram() {
  return (
    <div className="rounded-xl border border-[#2B2B2B]/10 bg-white p-3">
      <svg viewBox="0 0 320 120" className="w-full h-28">
        <defs>
          <linearGradient id="lakeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fb9d1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4c7a99" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <path d="M0 70 C 50 40, 100 95, 150 68 C 200 42, 250 92, 320 60 L320 120 L0 120 Z" fill="url(#lakeFill)" />
        <path d="M0 70 C 50 40, 100 95, 150 68 C 200 42, 250 92, 320 60" fill="none" stroke="#2B2B2B" strokeOpacity="0.18" strokeWidth="2" />
      </svg>
      <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-[#2B2B2B]/65">
        <span>20,600 acres</span>
        <span>40 miles</span>
        <span>500+ shoreline</span>
        <span>Full pond 795</span>
      </div>
    </div>
  )
}

function AccessBandsDiagram() {
  const bands = [
    { city: "Roanoke", time: "1h", pct: 20 },
    { city: "Charlotte", time: "3.5h", pct: 55 },
    { city: "DC", time: "4.5h", pct: 70 },
    { city: "New York", time: "8h", pct: 100 },
  ]
  return (
    <div className="space-y-2 rounded-xl border border-[#2B2B2B]/10 bg-white p-3">
      {bands.map((b, i) => (
        <div key={b.city}>
          <div className="flex items-center justify-between text-[11px] text-[#2B2B2B]/72">
            <span>{b.city}</span>
            <span>{b.time}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-[#2B2B2B]/8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${b.pct}%` }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="h-full rounded-full bg-[#9D5F36]"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function MarketCycleDiagram() {
  const phases = ["Prep", "Launch", "Peak", "Negotiate", "Close"]
  return (
    <div className="rounded-xl border border-[#2B2B2B]/10 bg-white p-3">
      <div className="grid grid-cols-5 gap-1">
        {phases.map((p, i) => (
          <motion.div
            key={p}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, delay: i * 0.04 }}
            className="rounded-md border border-[#2B2B2B]/12 bg-[#fff8f2] px-2 py-1.5 text-center text-[10px] uppercase tracking-[0.08em] text-[#9D5F36] font-semibold"
          >
            {p}
          </motion.div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-[#2B2B2B]/62">Seasonality changes pace, not fundamentals.</p>
    </div>
  )
}

function ContactPathDiagram() {
  const nodes = ["Inquiry", "Call", "Match", "Tour", "Action"]
  return (
    <div className="rounded-xl border border-[#2B2B2B]/10 bg-white p-3">
      <div className="flex items-center gap-1.5">
        {nodes.map((n, i) => (
          <div key={n} className="flex items-center gap-1.5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="h-8 px-2.5 rounded-full border border-[#9D5F36]/25 bg-[#fff8f2] text-[10px] uppercase tracking-[0.08em] text-[#9D5F36] font-semibold flex items-center"
            >
              {n}
            </motion.div>
            {i < nodes.length - 1 && <span className="text-[#2B2B2B]/35">→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
