"use client"

import { useState, useEffect, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Phone, Mail, MapPin } from "lucide-react"

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
   Shared sub-components
   ───────────────────────────────────────────── */

export function TimelineRow({ company, role, years }: { company: string; role: string; years: string }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#BCA28A]/15 last:border-0">
      <div className="w-2 h-2 rounded-full bg-[#9D5F36] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#2B2B2B]">{company}</p>
        <p className="text-xs text-[#2B2B2B]/60">{role}</p>
      </div>
      <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[#9D5F36] shrink-0">{years}</span>
    </div>
  )
}

export function AdvisoryFlowDiagram() {
  const steps = ["Discover", "Align", "Tour", "Decide", "Execute"]
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="rounded-full border border-[#9D5F36]/25 bg-[#9D5F36]/8 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.1em] font-semibold text-[#9D5F36]"
          >
            {s}
          </motion.div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-3 w-3 text-[#BCA28A]" />
          )}
        </div>
      ))}
    </div>
  )
}

export function CareerArcDiagram() {
  const bars = [
    { h: 24, label: "'00", role: "SEKON" },
    { h: 38, label: "'06", role: "COO" },
    { h: 52, label: "'12", role: "SRA VP" },
    { h: 64, label: "'19", role: "Recorded Future" },
    { h: 80, label: "Now", role: "WPP" },
  ]
  return (
    <div className="rounded-xl border border-[#BCA28A]/20 bg-white p-4">
      <div className="flex items-end gap-2" style={{ height: 96 }}>
        {bars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: bar.h, opacity: 1 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="w-full rounded-t-md bg-gradient-to-t from-[#9D5F36] to-[#d4b08f] relative group cursor-default"
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-[#9D5F36] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {bar.role}
              </span>
            </motion.div>
            <span className="text-[9px] text-[#2B2B2B]/50 font-medium">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ContactPathDiagram() {
  const nodes = ["Inquiry", "Call", "Match", "Tour", "Action"]
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {nodes.map((n, i) => (
        <div key={n} className="flex items-center gap-1.5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="h-8 px-3 rounded-full border border-[#9D5F36]/25 bg-[#9D5F36]/8 text-[10px] uppercase tracking-[0.08em] text-[#9D5F36] font-semibold flex items-center"
          >
            {n}
          </motion.div>
          {i < nodes.length - 1 && <ChevronRight className="h-3 w-3 text-[#BCA28A]" />}
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab toggle — reusable within modals
   ───────────────────────────────────────────── */

function TabToggle<T extends string>({ tabs, active, onChange }: { tabs: { key: T; label: string }[]; active: T; onChange: (key: T) => void }) {
  return (
    <div className="flex gap-1 rounded-full border border-[#BCA28A]/25 bg-white/60 p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.1em] font-semibold transition-all duration-200 ${
            active === tab.key
              ? "bg-[#9D5F36] text-white shadow-sm"
              : "text-[#2B2B2B]/50 hover:text-[#9D5F36]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Access bar
   ───────────────────────────────────────────── */

function AccessBar({ city, time, pct, delay = 0 }: { city: string; time: string; pct: number; delay?: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#2B2B2B]">{city}</span>
        <span className="text-sm text-[#9D5F36] font-semibold">{time}</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#2B2B2B]/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, delay }}
          className="h-full rounded-full bg-gradient-to-r from-[#9D5F36] to-[#d4b08f]"
        />
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════
   1. ABOUT CRAIG — Interactive body
   ═════════════════════════════════════════════════ */

function CraigStoryBody() {
  const [tab, setTab] = useState<"story" | "approach" | "values">("story")

  return (
    <div className="-m-6 md:-m-8">
      {/* Dark header band */}
      <div className="bg-[#2B2B2B] px-6 md:px-8 pt-12 pb-8">
        <div className="flex items-center gap-5">
          <img
            src="/real-estate/craig-headshot.jpg"
            alt="Craig Wilson"
            className="h-20 w-20 rounded-xl object-cover border-2 border-[#BCA28A]/30 shadow-lg"
          />
          <div>
            <h3 className="text-2xl font-serif text-[#ECE9E7]">Craig Wilson</h3>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#BCA28A] font-semibold mt-1">
              Real Estate Developer &middot; Agent &middot; Investor
            </p>
            <p className="text-[10px] text-[#ECE9E7]/40 mt-1">RE/MAX Lakefront Realty &middot; Moneta, VA</p>
          </div>
        </div>
      </div>

      {/* Tabs + Body */}
      <div className="px-6 md:px-8 pt-5 pb-6 space-y-5">
        <TabToggle
          tabs={[
            { key: "story" as const, label: "Story" },
            { key: "approach" as const, label: "Approach" },
            { key: "values" as const, label: "Values" },
          ]}
          active={tab}
          onChange={setTab}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "story" && (
              <div className="space-y-5">
                <p className="text-sm text-[#2B2B2B]/80 leading-relaxed">
                  Craig grew up in Ohio and earned his BSBA from John Carroll University. He spent over two decades in federal and commercial leadership roles in Northern Virginia&mdash;from COO at SEKON to Vice President at SRA International to strategic account work in cybersecurity at LookingGlass and Recorded Future.
                </p>
                <p className="text-sm text-[#2B2B2B]/80 leading-relaxed">
                  In 2022, Craig transitioned fully into real estate at Smith Mountain Lake, combining his executive background&mdash;program management, business development, P&amp;L oversight&mdash;with a deep personal connection to the lake. He and his wife Angela now live at SML, where Craig operates as a licensed agent, developer, and investor focused on lakefront properties.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "John Carroll University — BSBA",
                    "Virginia Licensed Agent",
                    "NAR Member",
                    "RVAR Member",
                    "Father of Four",
                  ].map((item) => (
                    <span key={item} className="rounded-full border border-[#BCA28A]/25 bg-[#f8f4ee] px-3 py-1.5 text-[10px] font-medium text-[#2B2B2B]/70">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tab === "approach" && (
              <div className="space-y-5">
                <p className="text-sm text-[#2B2B2B]/80 leading-relaxed">
                  Craig runs real estate the way he ran enterprise programs: define the objective, eliminate ambiguity, then execute. No fluff, no pressure. Every client engagement follows the same five-phase advisory process:
                </p>
                <AdvisoryFlowDiagram />
                <div className="space-y-3">
                  {[
                    { num: "01", title: "Discover", desc: "Understand your goals, timeline, and what matters most. Buying for weekends? Full-time relocation? Investment? The answer shapes every recommendation." },
                    { num: "02", title: "Align", desc: "Match priorities to the market. Craig narrows the field to properties that fit your criteria — waterfront access, dock quality, depth, views, county tax implications." },
                    { num: "03", title: "Tour", desc: "Focused property visits, not open-house tours. Each showing is structured around your stated goals, with honest assessments of both strengths and trade-offs." },
                    { num: "04", title: "Decide", desc: "A clear comparison of options, risk factors surfaced early, and a recommendation based on what Craig knows about the property, the market, and your goals." },
                    { num: "05", title: "Execute", desc: "Offer strategy, negotiation, inspection coordination, and follow-through from contract to close. Nothing gets dropped." },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-3">
                      <span className="text-[10px] font-bold text-[#BCA28A] mt-1 shrink-0">{step.num}</span>
                      <div>
                        <p className="text-sm font-semibold text-[#2B2B2B]">{step.title}</p>
                        <p className="text-xs text-[#2B2B2B]/60 mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "values" && (
              <div className="space-y-4">
                {[
                  { title: "Steady Guidance", desc: "Real estate decisions at this level deserve a thoughtful, unhurried approach. Craig doesn't rush timelines or push urgency. The goal is a sound decision, not a fast one." },
                  { title: "Clear Communication", desc: "Transparent, responsive, and straightforward. No jargon, no pressure, no ambiguity. You'll know where things stand at every stage." },
                  { title: "Attention to Detail", desc: "Nothing gets overlooked — from dock permitting and water depth to septic inspections and county zoning. The details that matter to long-term ownership get flagged early." },
                  { title: "Genuinely Invested", desc: "Craig takes personal pride in every client relationship. This isn't transactional work. He lives at the lake, he builds at the lake, and his reputation is tied to every outcome." },
                ].map((value, i) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="rounded-xl border border-[#BCA28A]/20 bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-[#2B2B2B]">{value.title}</p>
                    <p className="text-xs text-[#2B2B2B]/65 mt-1 leading-relaxed">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="pt-1">
          <a
            href="/real-estate/about"
            className="inline-flex items-center justify-center rounded-md bg-[#9D5F36] hover:bg-[#874E2B] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-white transition-colors duration-300 shadow-sm"
          >
            Full Bio &amp; Career History
          </a>
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════
   2. CAREER HIGHLIGHTS — Interactive body
   ═════════════════════════════════════════════════ */

function CareerHighlightsBody() {
  const [tab, setTab] = useState<"timeline" | "skills" | "credentials">("timeline")

  return (
    <div className="-m-6 md:-m-8">
      {/* Dark header — current role */}
      <div className="bg-gradient-to-br from-[#2B2B2B] to-[#3a3530] px-6 md:px-8 pt-12 pb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#BCA28A] font-semibold mb-1">Current Role</p>
        <h3 className="text-2xl font-serif text-[#ECE9E7]">Wilson Premier Properties</h3>
        <p className="text-sm text-[#ECE9E7]/55 mt-1">Real Estate Developer / Agent / Investor &mdash; 2022&ndash;Present</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["20+ Yrs Executive Leadership", "Licensed VA Agent", "Developer & Investor"].map((tag) => (
            <span key={tag} className="rounded-full border border-[#ECE9E7]/15 bg-[#ECE9E7]/6 px-3 py-1.5 text-[10px] font-medium text-[#ECE9E7]/65">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-8 pt-5 pb-6 space-y-5">
      <TabToggle
        tabs={[
          { key: "timeline" as const, label: "Timeline" },
          { key: "skills" as const, label: "Skills" },
          { key: "credentials" as const, label: "Credentials" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "timeline" && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#BCA28A] font-semibold mb-2">Prior Leadership</p>
                <div className="border-l-2 border-[#BCA28A]/25 ml-1 pl-4 space-y-0">
                  {[
                    { co: "Recorded Future", role: "Federal Account Executive — Threat intelligence platform sales to federal agencies", yr: "2019–2022" },
                    { co: "LookingGlass Cyber Solutions", role: "Strategic Account Manager — Enterprise cybersecurity for government and defense", yr: "2014–2019" },
                    { co: "SRA International", role: "Vice President / Account Manager — Federal IT services and consulting delivery", yr: "2012–2014" },
                    { co: "SEKON", role: "COO / Chief Strategy Officer — Built operations from startup through acquisition", yr: "2000–2012" },
                  ].map((entry, i) => (
                    <motion.div
                      key={entry.co}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                      className="relative py-3 border-b border-[#BCA28A]/10 last:border-0"
                    >
                      <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-[#BCA28A] border-2 border-[#f6efe6]" />
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-[#2B2B2B]">{entry.co}</p>
                          <span className="text-[10px] font-medium text-[#2B2B2B]/45 shrink-0">{entry.yr}</span>
                        </div>
                        <p className="text-xs text-[#2B2B2B]/55 mt-0.5">{entry.role}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Growth trajectory */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#BCA28A] font-semibold mb-3">Growth Trajectory</p>
                <CareerArcDiagram />
              </div>
            </div>
          )}

          {tab === "skills" && (
            <div className="space-y-4">
              <p className="text-sm text-[#2B2B2B]/75 leading-relaxed">
                20+ years of executive leadership translated into a disciplined, client-first real estate practice.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { skill: "Program & Portfolio Management", desc: "Coordinated multimillion-dollar delivery programs across agencies and timelines" },
                  { skill: "Business Development", desc: "Built client relationships and pipelines in competitive federal and commercial markets" },
                  { skill: "P&L / Operations", desc: "Managed full P&L responsibility, HR, finance, and IT infrastructure" },
                  { skill: "Strategy & Planning", desc: "Designed go-to-market strategies and long-term positioning for growth" },
                  { skill: "Negotiation & Capture", desc: "Led proposal development and contract negotiation at the enterprise level" },
                  { skill: "Market Analysis", desc: "Evaluates SML inventory, pricing trends, and seasonal patterns for buyers and sellers" },
                ].map((item, i) => (
                  <motion.div
                    key={item.skill}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    className="rounded-xl border border-[#BCA28A]/20 bg-white p-3"
                  >
                    <p className="text-xs font-semibold text-[#2B2B2B]">{item.skill}</p>
                    <p className="text-[10px] text-[#2B2B2B]/55 mt-0.5 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tab === "credentials" && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {[
                  { label: "License", value: "Commonwealth of Virginia — Real Estate Agent" },
                  { label: "Brokerage", value: "RE/MAX Lakefront Realty Inc., Moneta, VA" },
                  { label: "Education", value: "John Carroll University — Bachelor of Science in Business Administration" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#BCA28A]/20 bg-white p-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#9D5F36] font-semibold">{item.label}</p>
                    <p className="text-sm text-[#2B2B2B]/80 mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#BCA28A] font-semibold mb-3">Associations</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "National Association of Realtors (NAR)",
                    "Roanoke Valley Association of REALTORS (RVAR)",
                    "RE/MAX Lakefront Realty Inc.",
                  ].map((item) => (
                    <span key={item} className="rounded-full border border-[#BCA28A]/25 bg-[#f8f4ee] px-3 py-1.5 text-[10px] font-medium text-[#2B2B2B]/70">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════
   3. SML DEEP DIVE — Interactive body
   ═════════════════════════════════════════════════ */

function SmlDeepDiveBody({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"lake" | "activities" | "community">("lake")

  return (
    <div className="-m-6 md:-m-8">
      {/* Hero metrics band */}
      <div className="bg-gradient-to-br from-[#1a2e3d] to-[#2B2B2B] px-6 md:px-8 pt-12 pb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#BCA28A] font-semibold mb-1">Deep Dive</p>
        <h3 className="text-2xl md:text-3xl font-serif text-[#ECE9E7]">Virginia&apos;s Premier Lake</h3>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "20,600", label: "Acres" },
            { value: "40 mi", label: "Length" },
            { value: "500+", label: "Shoreline Miles" },
            { value: "795 ft", label: "Full Pond Elevation" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="text-center"
            >
              <p className="text-xl md:text-2xl font-serif text-[#ECE9E7]">{stat.value}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[#ECE9E7]/45 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs + Body */}
      <div className="px-6 md:px-8 pt-5 pb-6 space-y-5">
        <TabToggle
          tabs={[
            { key: "lake" as const, label: "The Lake" },
            { key: "activities" as const, label: "Activities" },
            { key: "community" as const, label: "Community" },
          ]}
          active={tab}
          onChange={setTab}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "lake" && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold mb-2">Origin</p>
                  <p className="text-sm text-[#2B2B2B]/80 leading-relaxed">
                    Smith Mountain Lake was created when Smith Mountain Dam was built across the Roanoke River for hydroelectric power. Construction ran from 1960 to 1963, and the lake reached its full elevation of 795 feet above sea level in 1966. It is the largest lake entirely contained within Virginia and the state&apos;s second-largest freshwater reservoir.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold mb-3">Key Facts</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Surface Area", value: "20,600 acres" },
                      { label: "Avg Depth", value: "~55 feet" },
                      { label: "Max Depth", value: "~250 feet" },
                      { label: "Counties", value: "Bedford, Franklin, Pittsylvania" },
                      { label: "Dam", value: "Smith Mountain Dam" },
                      { label: "River Source", value: "Roanoke River" },
                    ].map((fact) => (
                      <div key={fact.label} className="rounded-lg border border-[#BCA28A]/20 bg-white p-2.5 text-center">
                        <p className="text-xs font-semibold text-[#2B2B2B]">{fact.value}</p>
                        <p className="text-[9px] uppercase tracking-[0.08em] text-[#2B2B2B]/50 mt-0.5">{fact.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold mb-3">Seasons</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { title: "Spring & Summer", desc: "Peak season. Water temps in the 70s\u00B0F. Boating, swimming, and outdoor events." },
                      { title: "Fall", desc: "Vibrant foliage, crisp skies. Ideal for hiking, golf, and quieter boating." },
                      { title: "Winter", desc: "Mild climate, rare snowfall. Lake rarely freezes — permanent docks are common." },
                    ].map((season) => (
                      <div key={season.title} className="rounded-xl border border-[#BCA28A]/20 bg-white p-3">
                        <p className="text-xs font-semibold text-[#2B2B2B]">{season.title}</p>
                        <p className="text-[10px] text-[#2B2B2B]/60 mt-1 leading-relaxed">{season.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "activities" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "Boating & Water Sports", desc: "With 20,600 acres and scenic coves, waterskiing, kayaking, paddleboarding, and jet skiing are common pastimes. Full-service marinas dot the shoreline." },
                    { title: "Fishing", desc: "The lake supports a robust fishery: largemouth and smallmouth bass, striped bass, crappie, sunfish, and catfish. Seasonal tournaments attract anglers from across the region." },
                    { title: "Parks & Trails", desc: "Smith Mountain Lake State Park offers swimming areas, hiking and biking trails, picnic sites, cabin rentals, and seasonal naturalist programs along the shoreline." },
                    { title: "Community Events", desc: "Seasonal festivals, regattas, fishing tournaments, farmers markets, and live music bring locals and visitors together year-round." },
                  ].map((activity, i) => (
                    <motion.div
                      key={activity.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className="rounded-xl border border-[#BCA28A]/20 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-[#2B2B2B]">{activity.title}</p>
                      <p className="text-xs text-[#2B2B2B]/60 mt-1 leading-relaxed">{activity.desc}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="rounded-xl border border-[#BCA28A]/25 bg-[#f8f4ee] p-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#BCA28A] font-semibold mb-1">Pop Culture</p>
                  <p className="text-sm text-[#2B2B2B]/75 leading-relaxed">
                    Smith Mountain Lake was featured in the 1991 film <em>What About Bob?</em> starring Bill Murray, and has appeared in regional television coverage highlighting Virginia lake life.
                  </p>
                </div>
              </div>
            )}

            {tab === "community" && (
              <div className="space-y-5">
                {/* Community snapshot */}
                <div className="rounded-xl border-l-4 border-l-[#9D5F36] bg-[#9D5F36]/6 px-5 py-4">
                  <p className="text-sm text-[#2B2B2B]/80 leading-relaxed">
                    Approximately <strong>22,000 permanent residents</strong> live around SML, with over 65,000 within five miles. Communities include Moneta, Huddleston, Union Hall, Penhook, and Goodview.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold mb-3">Golf Courses</p>
                  <div className="space-y-2">
                    {[
                      { name: "Water\u2019s Edge Country Club", desc: "Lakeside championship course with rolling terrain and water views. Open to the public." },
                      { name: "The Waterfront Country Club", desc: "Private course with clubhouse dining, tennis, pool, and an active social calendar." },
                      { name: "Mariners Landing Country Club", desc: "Within a gated community. Popular with residents and second-home owners." },
                    ].map((course, i) => (
                      <motion.div
                        key={course.name}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="rounded-xl border border-[#BCA28A]/20 bg-white p-3"
                      >
                        <p className="text-sm font-semibold text-[#2B2B2B]">{course.name}</p>
                        <p className="text-xs text-[#2B2B2B]/60 mt-0.5 leading-relaxed">{course.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold mb-3">Wine, Beer &amp; Dining</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Hickory Hill Vineyards", desc: "Estate-grown, award-winning wines with lake views" },
                      { name: "White Rock Winery", desc: "Wine and craft beer in one lakeside venue" },
                      { name: "Sunken City Brewing", desc: "8,800 sq ft brewery, tap room, and seasonal craft beers" },
                    ].map((venue) => (
                      <div key={venue.name} className="rounded-xl border border-[#BCA28A]/20 bg-white p-3">
                        <p className="text-xs font-semibold text-[#2B2B2B]">{venue.name}</p>
                        <p className="text-[10px] text-[#2B2B2B]/55 mt-0.5 leading-relaxed">{venue.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold mb-3">Services &amp; Infrastructure</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { title: "Shopping", desc: "Westlake Corner is the primary hub: groceries, restaurants, banks, and retail along Route 122" },
                      { title: "Medical", desc: "On-lake urgent care, medical helicopter. Regional hospitals in Roanoke and Lynchburg 30\u201345 min away" },
                      { title: "Marinas", desc: "Full-service marinas with slips, fuel, boat rentals, and charter services around the lake" },
                      { title: "Education", desc: "Bedford and Franklin County public schools. Private options in Roanoke and Lynchburg" },
                    ].map((item) => (
                      <div key={item.title} className="rounded-xl border border-[#BCA28A]/20 bg-white p-3">
                        <p className="text-xs font-semibold text-[#2B2B2B]">{item.title}</p>
                        <p className="text-[10px] text-[#2B2B2B]/55 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="flex gap-3 pt-1">
          <a
            href="#about-sml"
            onClick={(e) => {
              e.preventDefault()
              onClose()
              setTimeout(() => document.getElementById("about-sml")?.scrollIntoView({ behavior: "smooth" }), 300)
            }}
            className="inline-flex items-center justify-center rounded-md bg-[#2B2B2B] hover:bg-[#1a1a1a] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#ECE9E7] transition-colors duration-300"
          >
            Read Full Overview
          </a>
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════
   4. DISTANCE + ACCESS — Interactive body
   ═════════════════════════════════════════════════ */

function DistanceAccessBody({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"nearby" | "regional" | "owners">("regional")

  return (
    <div className="-m-6 md:-m-8">
      {/* Tinted header */}
      <div className="bg-gradient-to-br from-[#3a4a3e] to-[#2B2B2B] px-6 md:px-8 pt-12 pb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#BCA28A] font-semibold mb-1">Location</p>
        <h3 className="text-2xl md:text-3xl font-serif text-[#ECE9E7]">Distance &amp; Access</h3>
        <p className="mt-3 text-sm text-[#ECE9E7]/60 leading-relaxed max-w-lg">
          Smith Mountain Lake sits in the Blue Ridge foothills&mdash;far enough to feel like a true escape, close enough for regular visits. Many owners split time between the lake and cities within a 3&ndash;5 hour drive.
        </p>
      </div>

      <div className="px-6 md:px-8 pt-5 pb-6 space-y-5">
      <TabToggle
        tabs={[
          { key: "nearby" as const, label: "Under 3 hrs" },
          { key: "regional" as const, label: "3–6 hrs" },
          { key: "owners" as const, label: "Who Lives Here" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "nearby" && (
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold">Quick Access — Day-Trip Range</p>
              <div className="space-y-4">
                <AccessBar city="Lynchburg, VA" time="~45 min" pct={15} delay={0} />
                <AccessBar city="Roanoke, VA" time="~1 hr" pct={20} delay={0.05} />
                <AccessBar city="Raleigh\u2013Durham, NC" time="~2.5\u20133 hrs" pct={55} delay={0.1} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="rounded-xl border border-[#BCA28A]/20 bg-white p-3">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[#9D5F36] font-semibold">Roanoke (~100K)</p>
                  <p className="text-[10px] text-[#2B2B2B]/60 mt-0.5 leading-relaxed">Regional airport (ROA) with nonstop flights to Charlotte, Atlanta, and Chicago. Full medical services, retail, and dining.</p>
                </div>
                <div className="rounded-xl border border-[#BCA28A]/20 bg-white p-3">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[#9D5F36] font-semibold">Lynchburg (~85K)</p>
                  <p className="text-[10px] text-[#2B2B2B]/60 mt-0.5 leading-relaxed">Regional airport (LYH), university-town character. Nearest urgent care and hospitals 30&ndash;45 min from the lake.</p>
                </div>
              </div>
            </div>
          )}

          {tab === "regional" && (
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold">Weekend &amp; Second-Home Drive Range</p>
              <div className="space-y-4">
                <AccessBar city="Charlotte, NC" time="~3.5 hrs" pct={54} delay={0} />
                <AccessBar city="Charleston, WV" time="~3.5\u20134 hrs" pct={58} delay={0.04} />
                <AccessBar city="Fairfax / Northern VA" time="~4 hrs" pct={62} delay={0.08} />
                <AccessBar city="Washington, DC" time="~4\u20134.5 hrs" pct={68} delay={0.12} />
                <AccessBar city="Baltimore, MD" time="~5 hrs" pct={76} delay={0.16} />
                <AccessBar city="Pittsburgh, PA" time="~5.5 hrs" pct={84} delay={0.2} />
                <AccessBar city="Philadelphia, PA" time="~5.5\u20136 hrs" pct={88} delay={0.24} />
                <AccessBar city="Cincinnati, OH" time="~6 hrs" pct={92} delay={0.28} />
                <AccessBar city="Atlanta, GA" time="~6\u20136.5 hrs" pct={100} delay={0.32} />
              </div>
              <div className="rounded-xl border border-[#BCA28A]/20 bg-white p-3">
                <p className="text-[10px] text-[#2B2B2B]/60 leading-relaxed">
                  The DC&ndash;NoVA corridor is the single largest source of SML second-home buyers. A Friday afternoon departure puts you at the dock before dark.
                </p>
              </div>
            </div>
          )}

          {tab === "owners" && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: "Weekend", desc: "Owners within the 2\u20133 hour drive radius. Friday evening to Sunday afternoon is the typical rhythm." },
                  { type: "Seasonal", desc: "Spring through fall residency. Many come from the Carolinas, DC, and Northern Virginia." },
                  { type: "Full-Time", desc: "Relocated from metro areas. The mild climate, low taxes, and lake access make it a year-round destination." },
                ].map((item, i) => (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="rounded-xl border border-[#BCA28A]/20 bg-white p-3"
                  >
                    <p className="text-sm font-semibold text-[#2B2B2B] text-center">{item.type}</p>
                    <p className="text-[10px] text-[#2B2B2B]/55 mt-1 leading-relaxed text-center">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-xl border border-[#BCA28A]/25 bg-[#f8f4ee] p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#9D5F36] font-semibold mb-2">Air Access</p>
                <p className="text-sm text-[#2B2B2B]/75 leading-relaxed">
                  Roanoke&ndash;Blacksburg Regional Airport (ROA) is the closest commercial airport, about an hour from the lake. It offers daily nonstop service to Charlotte, Atlanta, Chicago, and other connecting hubs. Lynchburg Regional Airport (LYH) is about 45 minutes away with limited service.
                </p>
              </div>
              <div className="rounded-xl border border-[#BCA28A]/25 bg-[#f8f4ee] p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#9D5F36] font-semibold mb-2">What Owners Say</p>
                <p className="text-sm text-[#2B2B2B]/75 leading-relaxed italic font-serif">
                  &ldquo;It feels like a true escape, yet it&apos;s close enough to make regular visits practical. Friends and family can reach us with relative ease&mdash;that&apos;s what makes SML work as a second home.&rdquo;
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <div className="pt-1">
        <a
          href="#driving-distances"
          onClick={(e) => {
            e.preventDefault()
            onClose()
            setTimeout(() => document.getElementById("driving-distances")?.scrollIntoView({ behavior: "smooth" }), 300)
          }}
          className="inline-flex items-center justify-center rounded-md border border-[#2B2B2B]/20 bg-white hover:bg-[#f8f4ee] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2B2B2B]/80 transition-colors duration-300"
        >
          See Full Distance Table
        </a>
      </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════
   5. MARKET MOMENTUM — Interactive body
   ═════════════════════════════════════════════════ */

function MarketMomentumBody({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "seasonal" | "counties">("overview")

  return (
    <div className="-m-6 md:-m-8">
      {/* Dark dashboard header */}
      <div className="bg-[#2B2B2B] px-6 md:px-8 pt-12 pb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#BCA28A] font-semibold mb-1">SML Real Estate</p>
        <h3 className="text-2xl md:text-3xl font-serif text-[#ECE9E7]">Market Momentum</h3>

        {/* Live market snapshot */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Avg Sale Price", value: "$1.16M" },
            { label: "Sale-to-List", value: "98%" },
            { label: "Days on Market", value: "62" },
            { label: "Active Listings", value: "44" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="rounded-lg border border-[#ECE9E7]/10 bg-[#ECE9E7]/5 px-3 py-3"
            >
              <p className="text-[9px] uppercase tracking-[0.1em] text-[#ECE9E7]/45 font-medium">{item.label}</p>
              <p className="text-xs text-[#ECE9E7]/80 mt-1 font-medium">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs + Body */}
      <div className="px-6 md:px-8 pt-5 pb-6 space-y-5">
        <TabToggle
          tabs={[
            { key: "overview" as const, label: "Overview" },
            { key: "seasonal" as const, label: "Seasonal" },
            { key: "counties" as const, label: "Counties" },
          ]}
          active={tab}
          onChange={setTab}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "overview" && (
              <div className="space-y-5">
                <p className="text-sm text-[#2B2B2B]/80 leading-relaxed">
                  Smith Mountain Lake&apos;s real estate market spans three counties and includes everything from custom waterfront estates and lakefront cottages to condominiums, townhomes, and undeveloped land. The variety of property types and price points makes the lake accessible to a wide range of buyers.
                </p>

                {/* Inventory snapshot */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold mb-3">Current Inventory Snapshot</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: "Waterfront Homes", active: "44 active", avg: "Avg $1.72M", sqft: "~3,700 sq ft" },
                      { type: "Condos & Townhomes", active: "33 active", avg: "Avg $666K", sqft: "~1,740 sq ft" },
                      { type: "Waterfront Lots", active: "91 active", avg: "$100K–$500K+", sqft: "Build-ready" },
                    ].map((seg, i) => (
                      <motion.div
                        key={seg.type}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="rounded-xl border border-[#BCA28A]/20 bg-white p-3"
                      >
                        <p className="text-xs font-semibold text-[#2B2B2B]">{seg.type}</p>
                        <p className="text-[11px] text-[#9D5F36] font-semibold mt-1">{seg.active}</p>
                        <p className="text-[10px] text-[#2B2B2B]/55 mt-0.5">{seg.avg}</p>
                        <p className="text-[10px] text-[#2B2B2B]/45">{seg.sqft}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9D5F36] font-semibold mb-3">What Drives Value</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { factor: "Dock & Water Access", desc: "Quality dock permits, deep-water access, and usable shoreline are the strongest value drivers at SML." },
                      { factor: "Views & Orientation", desc: "Long-range water views, sunset orientation, and privacy from neighboring properties command premiums." },
                      { factor: "Positioning & Timing", desc: "How a property is priced and presented relative to seasonal demand patterns directly impacts days on market." },
                      { factor: "Condition & Readiness", desc: "Turnkey properties with updated systems, clear inspections, and financing-ready status attract the strongest offers." },
                    ].map((item, i) => (
                      <motion.div
                        key={item.factor}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="rounded-xl border border-[#BCA28A]/20 bg-white p-3"
                      >
                        <p className="text-xs font-semibold text-[#2B2B2B]">{item.factor}</p>
                        <p className="text-[10px] text-[#2B2B2B]/55 mt-1 leading-relaxed">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-[#BCA28A]/25 bg-[#f8f4ee] p-4">
                  <p className="text-sm text-[#2B2B2B]/80 leading-relaxed italic font-serif">
                    &ldquo;Long-term value at SML is tied to usability, access, and flexibility. Buyers who define these priorities early make stronger decisions and avoid overpaying for features they won&apos;t use.&rdquo;
                  </p>
                </div>
              </div>
            )}

            {tab === "seasonal" && (
              <div className="space-y-5">
                <p className="text-sm text-[#2B2B2B]/75 leading-relaxed">
                  The SML market follows a distinct seasonal rhythm. Understanding it helps both buyers and sellers time their decisions for the best outcomes.
                </p>
                {/* Seasonal phases */}
                <div className="grid grid-cols-5 gap-1.5">
                  {["Prep", "Launch", "Peak", "Negotiate", "Close"].map((phase, i) => (
                    <motion.div
                      key={phase}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className={`rounded-lg px-2 py-2.5 text-center text-[10px] uppercase tracking-[0.08em] font-semibold ${
                        phase === "Peak"
                          ? "bg-[#9D5F36] text-white"
                          : "border border-[#BCA28A]/25 bg-white text-[#2B2B2B]/65"
                      }`}
                    >
                      {phase}
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Winter Planning (Dec\u2013Feb)", desc: "Seller prep and property positioning. Early-buyer strategy sessions. Inventory is thinnest but motivated sellers may offer flexibility." },
                    { title: "Spring Home Showcase (Mar\u2013Apr)", desc: "New listings hit the market. Private tours and curated previews for serious buyers. The strongest inventory of the year appears in this window." },
                    { title: "Summer Peak Season (May\u2013Aug)", desc: "Peak boating season drives active buyer traffic. Strong demand around premium shoreline inventory. Competition is highest, but so is selection." },
                    { title: "Fall Strategy Window (Sep\u2013Nov)", desc: "Foliage season and calmer inventory cycles. Ideal for deliberate acquisition decisions with less competition and more negotiating room." },
                  ].map((period, i) => (
                    <motion.div
                      key={period.title}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className="rounded-xl border border-[#BCA28A]/20 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-[#2B2B2B]">{period.title}</p>
                      <p className="text-xs text-[#2B2B2B]/60 mt-1 leading-relaxed">{period.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {tab === "counties" && (
              <div className="space-y-5">
                <p className="text-sm text-[#2B2B2B]/75 leading-relaxed">
                  Smith Mountain Lake spans three Virginia counties, each with different tax rates, zoning rules, and neighborhood character.
                </p>
                <div className="space-y-3">
                  {[
                    {
                      county: "Bedford County",
                      rate: "~$0.41 / $100",
                      desc: "The largest share of SML shoreline. Home to popular communities like The Water\u2019s Edge, Mariners Landing, and numerous custom waterfront homes. Generally the most active market segment.",
                    },
                    {
                      county: "Franklin County",
                      rate: "~$0.43 / $100",
                      desc: "Covers the southern shore including Hales Ford Bridge area and much of the main channel. Known for a mix of established neighborhoods and newer development. The town of Moneta serves as a commercial hub.",
                    },
                    {
                      county: "Pittsylvania County",
                      rate: "Varies by district",
                      desc: "A smaller share of the SML shoreline, primarily on the eastern reaches. Often features larger lots and more rural character. Tax rates and services vary by district.",
                    },
                  ].map((county, i) => (
                    <motion.div
                      key={county.county}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.06 }}
                      className="rounded-xl border border-[#BCA28A]/20 bg-white p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-[#2B2B2B]">{county.county}</p>
                        <span className="rounded-full border border-[#9D5F36]/25 bg-[#9D5F36]/8 px-2.5 py-1 text-[10px] font-semibold text-[#9D5F36]">
                          {county.rate}
                        </span>
                      </div>
                      <p className="text-xs text-[#2B2B2B]/60 leading-relaxed">{county.desc}</p>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-[#2B2B2B]/55 leading-relaxed">
                  All three counties offer rates well below most urban and suburban areas in Virginia, contributing to the lake&apos;s appeal as a primary or secondary home destination.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="flex gap-3 pt-1">
          <a
            href="/real-estate/contact"
            className="inline-flex items-center justify-center rounded-md bg-[#9D5F36] hover:bg-[#874E2B] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.13em] text-white transition-colors duration-300 shadow-sm"
          >
            Discuss Strategy with Craig
          </a>
          <a
            href="#market"
            onClick={(e) => {
              e.preventDefault()
              onClose()
              setTimeout(() => document.getElementById("market")?.scrollIntoView({ behavior: "smooth" }), 300)
            }}
            className="inline-flex items-center justify-center rounded-md border border-[#2B2B2B]/20 bg-white hover:bg-[#f8f4ee] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2B2B2B]/80 transition-colors duration-300"
          >
            Market Details
          </a>
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════
   6. CONTACT INTENT — Interactive body
   ═════════════════════════════════════════════════ */

function ContactIntentBody() {
  const [tab, setTab] = useState<"share" | "expect" | "contact">("contact")

  return (
    <div className="-m-6 md:-m-8">
      {/* Rust-tinted header */}
      <div className="bg-gradient-to-br from-[#9D5F36] to-[#7a4829] px-6 md:px-8 pt-12 pb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold mb-1">Connect</p>
        <h3 className="text-2xl md:text-3xl font-serif text-white">Get in Touch</h3>
        <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-lg">
          Whether you&apos;re ready to make a move or just beginning to explore, Craig responds personally to every inquiry.
        </p>
      </div>

      <div className="px-6 md:px-8 pt-5 pb-6 space-y-5">
      <TabToggle
        tabs={[
          { key: "contact" as const, label: "Contact" },
          { key: "share" as const, label: "What to Share" },
          { key: "expect" as const, label: "What to Expect" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "share" && (
            <div className="space-y-5">
              <p className="text-sm text-[#2B2B2B]/80 leading-relaxed">
                The more context Craig has up front, the more useful your first conversation will be. You don&apos;t need to have everything figured out&mdash;but sharing what you know helps him tailor his guidance.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: "Timing", desc: "Are you looking to move in the next few months, or is this a 1\u20132 year plan? Knowing the timeline shapes which properties and strategies make sense." },
                  { title: "Use Case", desc: "Primary home, second/weekend home, vacation rental investment, or some combination? Each has different implications for location, features, and financing." },
                  { title: "Location Preference", desc: "Do you have a preferred area, shoreline type, or community? Or are you open and looking for guidance on which part of the lake fits your lifestyle?" },
                  { title: "Budget Range", desc: "A comfort range is more useful than an exact target. Craig can frame realistic options across the price spectrum and flag where value concentrates." },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="rounded-xl border border-[#9D5F36]/15 bg-[#9D5F36]/4 p-4"
                  >
                    <p className="text-xs font-semibold text-[#9D5F36]">{item.title}</p>
                    <p className="text-[11px] text-[#2B2B2B]/60 mt-1 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tab === "expect" && (
            <div className="space-y-5">
              <p className="text-sm text-[#2B2B2B]/80 leading-relaxed">
                Craig responds personally to every inquiry. Here&apos;s what the process looks like after you reach out:
              </p>
              <ContactPathDiagram />
              <div className="space-y-3">
                {[
                  { step: "01", title: "Initial Response", desc: "Craig will reply within 24 hours, typically same-day. He'll ask clarifying questions if needed and outline initial thoughts." },
                  { step: "02", title: "Strategy Call", desc: "A 20\u201330 minute phone or video call to discuss your goals in detail. No sales pitch\u2014just honest conversation about what the lake market looks like for your situation." },
                  { step: "03", title: "Curated Shortlist", desc: "A focused set of properties matched to your criteria, with Craig's notes on each: strengths, trade-offs, and how they align with your stated goals." },
                  { step: "04", title: "Structured Tours", desc: "In-person property visits organized around your priorities. Craig walks each property with you, pointing out things you might not notice and flagging long-term considerations." },
                  { step: "05", title: "Decision & Execution", desc: "When you're ready, Craig handles offer strategy, negotiation, inspections, and closing coordination. Nothing gets dropped between steps." },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="flex gap-3"
                  >
                    <span className="text-[10px] font-bold text-[#BCA28A] mt-1 shrink-0">{item.step}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#2B2B2B]">{item.title}</p>
                      <p className="text-xs text-[#2B2B2B]/60 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tab === "contact" && (
            <div className="space-y-5">
              {/* Contact card */}
              <div className="rounded-xl border border-[#BCA28A]/25 bg-[#2B2B2B] p-5">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="/real-estate/craig-headshot.jpg"
                    alt="Craig Wilson"
                    className="h-14 w-14 rounded-lg object-cover border border-[#BCA28A]/30"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#ECE9E7]">Craig Wilson</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#BCA28A] font-medium mt-0.5">RE/MAX Lakefront Realty Inc.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <a href="tel:+15402813188" className="flex items-center gap-3 text-sm text-[#ECE9E7]/80 hover:text-[#ECE9E7] transition-colors">
                    <Phone className="h-4 w-4 text-[#BCA28A]" />
                    540-281-3188
                  </a>
                  <a href="mailto:craig@wilson-premier.com" className="flex items-center gap-3 text-sm text-[#ECE9E7]/80 hover:text-[#ECE9E7] transition-colors">
                    <Mail className="h-4 w-4 text-[#BCA28A]" />
                    craig@wilson-premier.com
                  </a>
                  <div className="flex items-center gap-3 text-sm text-[#ECE9E7]/60">
                    <MapPin className="h-4 w-4 text-[#BCA28A]" />
                    16451 Booker T. Washington Hwy, Moneta, VA 24121
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Response Time", value: "Same day, typically within hours" },
                  { label: "Best For", value: "Buyers, sellers, and long-term planners" },
                  { label: "Service Area", value: "All of Smith Mountain Lake — Bedford, Franklin, Pittsylvania counties" },
                  { label: "Availability", value: "Evenings and weekends by appointment" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#BCA28A]/20 bg-white p-3">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[#9D5F36] font-semibold">{item.label}</p>
                    <p className="text-xs text-[#2B2B2B]/70 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <a
          href="/real-estate/contact"
          className="inline-flex items-center justify-center rounded-md bg-[#9D5F36] hover:bg-[#874E2B] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-white transition-colors duration-300 shadow-sm flex-1 sm:flex-none"
        >
          Send Craig a Message
        </a>
        <a
          href="tel:+15402813188"
          className="inline-flex items-center justify-center rounded-md border border-[#2B2B2B]/20 bg-white hover:bg-[#f8f4ee] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2B2B2B]/80 transition-colors duration-300 flex-1 sm:flex-none"
        >
          Call 540-281-3188
        </a>
      </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════
   Modal Content — wires body components
   ═════════════════════════════════════════════════ */

const MODAL_ORDER: Exclude<ModalKey, null>[] = [
  "craig-story",
  "career-highlights",
  "sml-deep-dive",
  "distance-access",
  "market-momentum",
  "contact-intent",
]

function getModalContent(onClose: () => void): Record<Exclude<ModalKey, null>, { title: string; body: ReactNode }> {
  return {
    "craig-story": {
      title: "About Craig",
      body: <CraigStoryBody />,
    },
    "career-highlights": {
      title: "Career Highlights",
      body: <CareerHighlightsBody />,
    },
    "sml-deep-dive": {
      title: "Smith Mountain Lake",
      body: <SmlDeepDiveBody onClose={onClose} />,
    },
    "distance-access": {
      title: "Distance & Access",
      body: <DistanceAccessBody onClose={onClose} />,
    },
    "market-momentum": {
      title: "Market Pulse",
      body: <MarketMomentumBody onClose={onClose} />,
    },
    "contact-intent": {
      title: "Get in Touch",
      body: <ContactIntentBody />,
    },
  }
}

/* ─────────────────────────────────────────────
   Quick-nav between modals
   ───────────────────────────────────────────── */

const MODAL_LABELS: Record<Exclude<ModalKey, null>, string> = {
  "craig-story": "About Craig",
  "career-highlights": "Career",
  "sml-deep-dive": "The Lake",
  "distance-access": "Access",
  "market-momentum": "Market",
  "contact-intent": "Contact",
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
  const content = getModalContent(onClose)

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

  const currentIdx = activeModal ? MODAL_ORDER.indexOf(activeModal) : -1
  const prevKey = currentIdx > 0 ? MODAL_ORDER[currentIdx - 1] : MODAL_ORDER[MODAL_ORDER.length - 1]
  const nextKey = currentIdx < MODAL_ORDER.length - 1 ? MODAL_ORDER[currentIdx + 1] : MODAL_ORDER[0]

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
            key={activeModal}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            className="relative w-full max-w-2xl max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-2xl bg-[#f6efe6] shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-[#BCA28A]/25">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-sm text-white mix-blend-difference flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal body */}
              <div className="p-6 md:p-8">
                {content[activeModal].body}
              </div>

              {/* Footer — prev/next navigation */}
              <div className="border-t border-[#BCA28A]/15 px-6 md:px-8 py-3 flex items-center justify-between bg-white/50">
                <button
                  onClick={() => onOpen(prevKey)}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] font-semibold text-[#2B2B2B]/50 hover:text-[#9D5F36] transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {MODAL_LABELS[prevKey]}
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-1.5">
                  {MODAL_ORDER.map((key) => (
                    <button
                      key={key}
                      onClick={() => onOpen(key)}
                      className={`rounded-full transition-all ${
                        key === activeModal
                          ? "w-5 h-2 bg-[#9D5F36]"
                          : "w-2 h-2 bg-[#BCA28A]/35 hover:bg-[#BCA28A]/60"
                      }`}
                      aria-label={MODAL_LABELS[key]}
                    />
                  ))}
                </div>

                <button
                  onClick={() => onOpen(nextKey)}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] font-semibold text-[#2B2B2B]/50 hover:text-[#9D5F36] transition-colors"
                >
                  {MODAL_LABELS[nextKey]}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
