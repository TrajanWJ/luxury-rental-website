"use client"

import { useState, useEffect, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

export type ModalKey =
  | "craig-story"
  | "career-highlights"
  | "sml-deep-dive"
  | "distance-access"
  | "market-momentum"
  | "contact-intent"
  | null

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

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

function QuickPill({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-[#2B2B2B]/10 bg-white px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.11em] text-[#9D5F36] font-semibold">{title}</p>
      <p className="mt-1 text-sm text-[#2B2B2B]/72">{text}</p>
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

export function TimelineRow({ company, role, years }: { company: string; role: string; years: string }) {
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

function Distance({ city, miles, time }: { city: string; miles: string; time: string }) {
  return (
    <article className="rounded-xl border border-[#2B2B2B]/12 bg-white px-3 py-2.5">
      <p className="text-sm font-semibold text-[#2B2B2B]">{city}</p>
      <p className="mt-1 text-xs text-[#2B2B2B]/72">
        {miles} miles &bull; {time}
      </p>
    </article>
  )
}

/* ─────────────────────────────────────────────
   SVG Diagrams
   ───────────────────────────────────────────── */

export function AdvisoryFlowDiagram() {
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

export function CareerArcDiagram() {
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

export function ContactPathDiagram() {
  const nodes = ["Inquiry", "Call", "Match", "Tour", "Action"]
  return (
    <div className="rounded-xl border border-[#2B2B2B]/10 bg-white p-3">
      <div className="flex items-center gap-1.5 flex-wrap">
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
            {i < nodes.length - 1 && <span className="text-[#2B2B2B]/35">&rarr;</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Modal Content
   ───────────────────────────────────────────── */

const MODAL_ORDER: Exclude<ModalKey, null>[] = [
  "craig-story",
  "career-highlights",
  "sml-deep-dive",
  "distance-access",
  "market-momentum",
  "contact-intent",
]

function getModalContent(): Record<Exclude<ModalKey, null>, { title: string; body: ReactNode }> {
  return {
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
            <p className="text-sm text-[#2B2B2B]/78">John Carroll University &mdash; BSBA, HR Management &amp; Information Systems</p>
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
              Created in the early 1960s as a hydroelectric project, Smith Mountain Lake reached full pond in 1966 and evolved into one of Virginia&apos;s strongest recreation-plus-residential destinations.
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
}

const QUICK_ACTIONS: Record<Exclude<ModalKey, null>, Array<{ label: string; target: Exclude<ModalKey, null> }>> = {
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

/* ═══════════════════════════════════════════════
   NarrativeModals — Main export
   ═══════════════════════════════════════════════ */

export function NarrativeModals({
  activeModal,
  onClose,
  onOpen,
}: {
  activeModal: ModalKey
  onClose: () => void
  onOpen: (key: Exclude<ModalKey, null>) => void
}) {
  const [focusMode, setFocusMode] = useState(false)
  const content = getModalContent()

  useEffect(() => {
    setFocusMode(false)
  }, [activeModal])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [activeModal])

  return (
    <AnimatePresence>
      {activeModal && (
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
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 h-9 w-9 rounded-full border border-[#2B2B2B]/15 text-[#2B2B2B]/65 hover:bg-[#2B2B2B]/8 hover:text-[#2B2B2B] transition-colors flex items-center justify-center text-lg"
                aria-label="Close"
              >
                &times;
              </button>

              {/* Header */}
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold">Narrative Detail</p>
              <h3 className="mt-1 text-2xl md:text-3xl font-serif text-[#2B2B2B]">{content[activeModal].title}</h3>

              {/* Action bar */}
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
                {QUICK_ACTIONS[activeModal].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      setFocusMode(false)
                      onOpen(action.target)
                    }}
                    className="rounded-full border border-[#2B2B2B]/18 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.11em] font-semibold text-[#2B2B2B]/72 hover:text-[#9D5F36] transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className={`mt-4 ${focusMode ? "opacity-[0.96]" : ""}`}>{content[activeModal].body}</div>

              {/* Prev / Close / Next */}
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#2B2B2B]/10 pt-3">
                <button
                  onClick={() => {
                    const idx = MODAL_ORDER.indexOf(activeModal)
                    const prev = idx <= 0 ? MODAL_ORDER[MODAL_ORDER.length - 1] : MODAL_ORDER[idx - 1]
                    setFocusMode(false)
                    onOpen(prev)
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
                    const idx = MODAL_ORDER.indexOf(activeModal)
                    const next = idx >= MODAL_ORDER.length - 1 ? MODAL_ORDER[0] : MODAL_ORDER[idx + 1]
                    setFocusMode(false)
                    onOpen(next)
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
