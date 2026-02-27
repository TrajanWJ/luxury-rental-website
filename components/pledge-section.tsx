"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useScroll, useTransform, useMotionValue, useSpring, useInView } from "framer-motion"
import { ArrowUpRight, X } from "lucide-react"
import { usePopupFreeze } from "@/hooks/use-popup-freeze"

/* ── word-by-word stagger reveal ── */
function AnimatedHeading({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ")
  return (
    <motion.h2
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 18, filter: "blur(5px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.45, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-block mr-[0.28em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.h2>
  )
}

/* ── 3D tilt card (desktop only) ── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 200, damping: 20 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── animated draw-in line ── */
function DrawLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`origin-left ${className}`}
    />
  )
}

const values = [
  { name: "Be Authentic", desc: "Simple, elegant, and genuine — never pretentious." },
  { name: "Be Thoughtful", desc: "Luxury at every touchpoint, so you don't have to think." },
  { name: "Be Extraordinary", desc: "If it's expected, we go a step beyond." },
  { name: "Have Humility", desc: "Honored to host you, grateful for every opportunity." },
  { name: "Act with Integrity", desc: "We operate with honesty, transparency, and respect in every interaction." },
]

export default function PledgeSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
  const lastScrollYRef = useRef(0)
  const [activePopup, setActivePopup] = useState<"mission" | "pledge" | null>(null)
  const [revealedMissionSteps, setRevealedMissionSteps] = useState(1)
  const [revealedPledgeSteps, setRevealedPledgeSteps] = useState(1)
  const [revealedValues, setRevealedValues] = useState(0)
  usePopupFreeze(!!activePopup)
  const [hoveredValueIndex, setHoveredValueIndex] = useState<number | null>(null)
  const [scrollingDown, setScrollingDown] = useState(true)
  const valuesInView = useInView(valuesRef, { once: false, amount: 0.35 })
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] })

  /* parallax transforms for background orbs */
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, 70])
  const orb3Y = useTransform(scrollYProgress, [0, 1], [30, -50])
  const missionSteps = [
    {
      title: "Designed for Togetherness",
      body: "Every layout is chosen to foster natural connection, shared moments, and seamless comfort.",
    },
    {
      title: "Elevated Service Standard",
      body: "From inquiry to departure, concierge support is responsive, practical, and detail-driven.",
    },
    {
      title: "Thoughtful Details",
      body: "Every amenity is prepared with care so guests can arrive and immediately feel at home.",
    },
    {
      title: "Consistently Refined",
      body: "We hold high standards across every stay, so your experience feels effortless and refined.",
    },
  ]
  const missionTotalUnfoldSteps = missionSteps.length + 2
  const openMissionPopup = () => {
    setRevealedMissionSteps(1)
    setActivePopup("mission")
  }
  const openPledgePopup = () => {
    setRevealedPledgeSteps(1)
    setActivePopup("pledge")
  }
  const closeActivePopup = () => {
    setActivePopup(null)
    setRevealedMissionSteps(1)
    setRevealedPledgeSteps(1)
  }

  const pledgeSteps = [
    {
      title: "Prepared Before Arrival",
      body: "From essentials to in-home readiness, your stay is set before you walk in.",
    },
    {
      title: "Low-Friction Experience",
      body: "Check-in, navigation, and key amenities are designed to feel intuitive from minute one.",
    },
    {
      title: "Group-First Comfort",
      body: "Spaces, service, and support are tuned for families and larger groups to reconnect effortlessly.",
    },
    {
      title: "Consistent Follow-Through",
      body: "The same standards hold across every touchpoint so each stay feels calm, polished, and reliable.",
    },
  ]

  useEffect(() => {
    if (activePopup !== "pledge") return
    const timer = window.setInterval(() => {
      setRevealedPledgeSteps((prev) => (prev < pledgeSteps.length ? prev + 1 : prev))
    }, 800)
    return () => window.clearInterval(timer)
  }, [activePopup, pledgeSteps.length])

  useEffect(() => {
    if (activePopup !== "mission") return
    const timer = window.setInterval(() => {
      setRevealedMissionSteps((prev) => (prev < missionTotalUnfoldSteps ? prev + 1 : prev))
    }, 800)
    return () => window.clearInterval(timer)
  }, [activePopup, missionTotalUnfoldSteps])

  useEffect(() => {
    const handleScrollDirection = () => {
      const currentY = window.scrollY
      setScrollingDown(currentY >= lastScrollYRef.current)
      lastScrollYRef.current = currentY
    }

    lastScrollYRef.current = window.scrollY
    window.addEventListener("scroll", handleScrollDirection, { passive: true })
    return () => window.removeEventListener("scroll", handleScrollDirection)
  }, [])

  useEffect(() => {
    if (!valuesInView) {
      if (scrollingDown) {
        setRevealedValues(0)
        setHoveredValueIndex(null)
      }
      return
    }

    // Do not activate/replay values when entering while scrolling upward.
    if (!scrollingDown) {
      setRevealedValues(values.length)
      return
    }

    if (revealedValues >= values.length) return
    const timer = window.setTimeout(() => {
      setRevealedValues((prev) => Math.min(prev + 1, values.length))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [valuesInView, revealedValues, scrollingDown])

  /* auto-cycling removed — values stay calm unless hovered */

  return (
    <section ref={sectionRef} id="pledge" className="relative overflow-hidden bg-[#efe9e1] pt-14 pb-24 md:pt-20 md:pb-36">

      {/* ── Parallax background orbs ── */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div style={{ y: orb1Y }} className="absolute -top-24 left-[-8%] h-[400px] w-[400px] rounded-full bg-[#9D5F36]/[0.14] blur-[100px]" />
        <motion.div style={{ y: orb2Y }} className="absolute right-[-10%] top-[24%] h-[340px] w-[340px] rounded-full bg-[#2B2B2B]/[0.07] blur-[90px]" />
        <motion.div style={{ y: orb3Y }} className="absolute bottom-[-60px] left-[28%] h-[340px] w-[340px] rounded-full bg-[#BCA28A]/[0.2] blur-[100px]" />
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #2B2B2B 0.8px, transparent 0)", backgroundSize: "24px 24px" }} />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* ═══════════════ HEADER ═══════════════ */}
        <div className="max-w-5xl mx-auto text-center mb-14 md:mb-16">
          <AnimatedHeading
            text="Our Mission, Promise, and Pledge"
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-[#2B2B2B] leading-[1.05]"
          />

          <DrawLine className="h-[3px] w-16 bg-[#9D5F36] mx-auto mt-6 rounded-full" delay={0.55} />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-5 text-base md:text-lg text-[#2B2B2B]/70 max-w-2xl mx-auto leading-relaxed"
          >
            A high-touch hospitality approach designed to make luxury lake stays effortless, elevated, and deeply memorable.
          </motion.p>
        </div>

        {/* ═══════════════ MISSION + VALUES ROW ═══════════════ */}
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10">

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="group rounded-[24px] border border-[#ECE9E7]/20 bg-[#2B2B2B] p-5 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] cursor-pointer transition-all duration-300 hover:border-[#BCA28A]/45 hover:shadow-[0_16px_52px_rgba(0,0,0,0.32)]"
              role="button"
              tabIndex={0}
              onClick={openPledgePopup}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openPledgePopup()
                }
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BCA28A]">Pledge</p>
              <p className="mt-2 text-lg md:text-xl font-serif text-[#ECE9E7] leading-snug">
                They Thought of Everything, every detail prepared for ease, comfort, and memorable stays.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#ECE9E7]/12 bg-white/5 px-3.5 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#ECE9E7]/75">
                  Pledge Journey
                </p>
                <ArrowUpRight className="h-4 w-4 text-[#BCA28A] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.div>

            {/* MISSION — tilt card */}
            <TiltCard
              className="rounded-[28px] border border-white/55 bg-white/65 backdrop-blur-lg p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.05)] transition-shadow duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] cursor-pointer"
            >
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-7"
                role="button"
                tabIndex={0}
                onClick={openMissionPopup}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    openMissionPopup()
                  }
                }}
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9D5F36]">Our Mission</p>
                  <DrawLine className="h-[2px] w-10 bg-[#BCA28A] mt-2.5 rounded-full" delay={0.15} />
                  <p className="mt-5 text-lg md:text-xl font-light leading-relaxed text-[#2B2B2B]/80">
                    Our mission is to help families and groups experience everything Smith Mountain Lake has to offer, together. We provide thoughtfully designed experiences, elevated service, and details that make reconnecting effortless.
                  </p>

                  <div className="mt-6">
                    <div className="rounded-2xl border border-[#2B2B2B]/12 bg-[#2B2B2B] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BCA28A]">Promise</p>
                      <p className="mt-2 text-base md:text-lg font-serif text-[#ECE9E7] leading-snug">
                        To go beyond the ordinary and create extraordinary luxury rentals and experiences.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#2B2B2B]/45">Click for interactive details</p>
              </motion.div>
            </TiltCard>
          </div>

          {/* VALUES — staggered spring cards */}
          <motion.div
            ref={valuesRef}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <div className="rounded-[24px] border border-[#2B2B2B]/12 bg-white/65 backdrop-blur-md p-5 md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9D5F36] mb-4">Our Values</p>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {values.slice(0, revealedValues).map((value, i) => {
                    const isActive = hoveredValueIndex === i
                    return (
                    <motion.div
                      key={value.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      whileHover={{ y: -2, transition: { duration: 0.3 } }}
                      onMouseEnter={() => setHoveredValueIndex(i)}
                      onMouseLeave={() => setHoveredValueIndex(null)}
                      className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm px-4 py-4 group/v cursor-default transition-all duration-500 ease-out ${
                        isActive
                          ? "border-[#9D5F36]/35 bg-[#FFF8F3] ring-1 ring-[#9D5F36]/12"
                          : "border-[#2B2B2B]/10 bg-white/75"
                      }`}
                    >
                      <motion.div
                        aria-hidden
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 0.85 : 0.35 }}
                        transition={{ duration: 0.5 }}
                        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#9D5F36] via-[#BCA28A] to-transparent"
                      />
                      <div className="flex items-center gap-2.5">
                        <motion.span
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.45, ease: "easeOut", delay: 0.04 * i }}
                          className="flex items-center justify-center w-7 h-7 rounded-full bg-[#9D5F36] text-white text-[11px] font-bold shadow-md shadow-[#9D5F36]/15 ring-2 ring-[#9D5F36]/20"
                        >
                          {i + 1}
                        </motion.span>
                        <p className={`text-base font-serif transition-colors duration-500 ${isActive ? "text-[#9D5F36]" : "text-[#2B2B2B] group-hover/v:text-[#9D5F36]"}`}>{value.name}</p>
                      </div>
                      <p className="mt-1.5 text-sm text-[#2B2B2B]/55 leading-relaxed pl-[38px]">{value.desc}</p>
                    </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      <AnimatePresence>
        {activePopup && (
          <motion.div
            data-popup-root
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-[#2B2B2B]/45 backdrop-blur-sm p-2 md:p-4 flex items-center justify-center"
            onClick={closeActivePopup}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative overflow-hidden w-full max-h-[76vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl text-[#2B2B2B] ${
                activePopup === "pledge"
                  ? "md:max-w-3xl bg-transparent border-0 p-0 shadow-none"
                  : "md:max-w-4xl bg-transparent border-0 p-0 shadow-none"
              }`}
            >
              {activePopup === "mission" ? (
                <div className="relative rounded-[28px] border border-white/55 bg-white/65 backdrop-blur-lg p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.05)]">
                  <button
                    onClick={closeActivePopup}
                    aria-label="Close mission details"
                    className="absolute top-3 right-3 rounded-full p-2 text-[#2B2B2B]/65 hover:bg-[#2B2B2B]/10 hover:text-[#2B2B2B]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9D5F36]">Our Mission</p>
                  <DrawLine className="h-[2px] w-10 bg-[#BCA28A] mt-2.5 rounded-full" delay={0.05} />
                  <p className="mt-5 text-lg md:text-xl font-light leading-relaxed text-[#2B2B2B]/80">
                    Our mission is to help families and groups experience everything Smith Mountain Lake has to offer, together. We provide thoughtfully designed experiences, elevated service, and details that make reconnecting effortless.
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[#2B2B2B]/12 bg-[#2B2B2B] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BCA28A]">Promise</p>
                      <p className="mt-2 text-base md:text-lg font-serif text-[#ECE9E7] leading-snug">
                        To go beyond the ordinary and create extraordinary luxury rentals and experiences.
                      </p>
                      <AnimatePresence initial={false}>
                        {revealedMissionSteps >= 5 && (
                          <motion.p
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.06 }}
                            className="overflow-hidden mt-3 rounded-xl border border-[#ECE9E7]/14 bg-white/5 px-3 py-2.5 text-sm text-[#ECE9E7]/82"
                          >
                            Promise In Practice: extraordinary outcomes come from deliberate standards in preparation, service, and follow-through.
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="rounded-2xl border border-[#9D5F36]/30 bg-white/75 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9D5F36]">Pledge</p>
                      <p className="mt-2 text-base md:text-lg font-serif text-[#2B2B2B] leading-snug">
                        They Thought of Everything, every detail prepared for ease, comfort, and memorable stays.
                      </p>
                      <AnimatePresence initial={false}>
                        {revealedMissionSteps >= 6 && (
                          <motion.p
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.06 }}
                            className="overflow-hidden mt-3 rounded-xl border border-[#2B2B2B]/10 bg-white/70 px-3 py-2.5 text-sm text-[#2B2B2B]/82"
                          >
                            Pledge In Practice: we operationalize "They Thought of Everything" through details that make every stay feel effortless.
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#ECE9E7]/20 bg-[#2B2B2B] p-4 md:p-5 text-[#ECE9E7]">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#BCA28A]">Mission Journey</p>
                    <div className="mt-3 space-y-3">
                      <AnimatePresence initial={false}>
                        {missionSteps.slice(0, revealedMissionSteps).map((step, index) => (
                          <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 14, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.06, delay: index * 0.006 }}
                            className={`overflow-hidden rounded-xl border px-4 py-3 ${
                              index === revealedMissionSteps - 1
                                ? "border-[#BCA28A]/45 bg-[#BCA28A]/10"
                                : "border-[#ECE9E7]/12 bg-white/5"
                            }`}
                          >
                            <h4 className="text-base md:text-lg font-serif text-[#ECE9E7]">{step.title}</h4>
                            <p className="mt-1.5 text-sm md:text-base leading-relaxed text-[#ECE9E7]/82">{step.body}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-[24px] border border-[#ECE9E7]/20 bg-[#2B2B2B] p-6 md:p-8 text-[#ECE9E7] shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
                  <button
                    onClick={closeActivePopup}
                    aria-label="Close pledge details"
                    className="absolute top-3 right-3 rounded-full p-2 text-[#ECE9E7]/70 hover:bg-white/10 hover:text-[#ECE9E7]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BCA28A]">Pledge</p>
                  <p className="mt-3 text-xl md:text-2xl font-serif leading-snug">
                    They Thought of Everything, every detail prepared for ease, comfort, and memorable stays.
                  </p>

                  <div className="mt-6 rounded-2xl border border-[#ECE9E7]/12 bg-white/5 p-4 md:p-5">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#BCA28A]">Pledge Journey</p>
                    <div className="mt-3 space-y-3">
                      <AnimatePresence initial={false}>
                        {pledgeSteps.slice(0, revealedPledgeSteps).map((step, index) => (
                          <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 14, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.06, delay: index * 0.006 }}
                            className={`overflow-hidden rounded-xl border px-4 py-3 ${
                              index === revealedPledgeSteps - 1
                                ? "border-[#BCA28A]/45 bg-[#BCA28A]/10"
                                : "border-[#ECE9E7]/12 bg-white/5"
                            }`}
                          >
                            <h4 className="text-base md:text-lg font-serif text-[#ECE9E7]">{step.title}</h4>
                            <p className="mt-1.5 text-sm md:text-base leading-relaxed text-[#ECE9E7]/82">{step.body}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
