"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { experiences, Experience } from "@/lib/experiences"
import { ArrowRight, ChevronLeft, ChevronRight, X, Globe, Phone, Mail, User, Check, Sparkles } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

import { useConcierge } from "./concierge-context"

// ─── Colors (matching the /experiences standalone page) ───
const COLORS = {
  linen: "#EAE8E4",
  charcoal: "#1C1C1C",
  stone: "#8C8984",
  brass: "#A4907C",
}

// ─── Editorial Experience Item (from the /experiences page) ───
function EditorialExperience({ item, index }: { item: Experience; index: number }) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1])

  const isEven = index % 2 === 0

  return (
    <section
      ref={containerRef}
      className="min-h-[60vh] flex items-center justify-center py-14 relative overflow-hidden"
    >
      <div className={`container mx-auto px-6 md:px-12 flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 md:gap-16 items-center`}>

        {/* Text Side */}
        <motion.div
          style={{ opacity }}
          className="flex-1 space-y-5 z-10"
        >
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: COLORS.brass }}>
              0{index + 1}
            </span>
            <div className="h-px w-12 bg-current opacity-20" style={{ color: COLORS.charcoal }} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: COLORS.stone }}>
              {item.type}
            </span>
          </div>

          <h2
            className="text-3xl md:text-5xl font-serif font-medium leading-[0.95]"
            style={{ color: COLORS.charcoal }}
          >
            {item.name}
          </h2>

          <p
            className="text-base md:text-lg font-light leading-relaxed max-w-md"
            style={{ color: COLORS.stone }}
          >
            {item.description}
          </p>

          {/* Contact Info */}
          <div className="space-y-3 pt-2">
            {item.contactName && (
              <p className="text-sm font-medium" style={{ color: COLORS.charcoal }}>
                {item.contactName}
                {item.contactTitle && (
                  <span className="font-light ml-2" style={{ color: COLORS.stone }}>
                    &mdash; {item.contactTitle}
                  </span>
                )}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {item.phone && (
                <Link
                  href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-70"
                  style={{ color: COLORS.stone }}
                >
                  <Phone className="h-3.5 w-3.5" />
                  {item.phone}
                </Link>
              )}
              {item.email && (
                <Link
                  href={`mailto:${item.email}`}
                  className="inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-70"
                  style={{ color: COLORS.stone }}
                >
                  <Mail className="h-3.5 w-3.5" />
                  {item.email}
                </Link>
              )}
            </div>

            {item.serviceOffered && (
              <span
                className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border"
                style={{ color: COLORS.brass, borderColor: `${COLORS.brass}40` }}
              >
                {item.serviceOffered}
              </span>
            )}
          </div>

          {/* CTA */}
          {item.website ? (
            <Link href={item.website} target="_blank" rel="noopener noreferrer">
              <motion.div
                whileHover={{ x: 10 }}
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest cursor-pointer group"
                style={{ color: COLORS.charcoal }}
              >
                Get in Touch
                <Globe className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.div>
            </Link>
          ) : (
            <motion.div
              whileHover={{ x: 10 }}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest cursor-pointer group"
              style={{ color: COLORS.charcoal }}
            >
              Learn More
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.div>
          )}
        </motion.div>

        {/* Image Side */}
        <div className="flex-1 relative aspect-[4/5] md:aspect-square w-full max-w-xl">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              style={{ scale, y }}
              className="w-full h-[120%] relative -top-[10%]"
            >
              <Image
                src={item.imageUrl || "/placeholder.jpg"}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}


// ─── Main Experiences Component (used on homepage) ───
export default function Experiences() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [isListExpanded, setIsListExpanded] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const { openContactModal } = useConcierge()

  // Get unique experience types for filter buttons
  const experienceTypes = Array.from(new Set(experiences.map(e => e.type)))

  // Map experiences to the format we need
  const experienceCards = experiences.map(exp => ({
    ...exp,
    title: exp.name,
    image: exp.imageUrl || "/images/placeholder.jpg",
  }))

  // Duplicate the array multiple times for seamless infinite scroll
  const infiniteExperiences = [
    ...experienceCards,
    ...experienceCards,
    ...experienceCards,
    ...experienceCards
  ]

  // Auto-scroll animation with bidirectional infinite loop
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationFrameId: number
    const scrollSpeed = 0.15
    // Track position locally so fractional pixels accumulate correctly
    // (scrollLeft is rounded to integers by the browser)
    let position = scrollContainer.scrollLeft

    const animate = () => {
      if (scrollContainer) {
        if (!isPaused) {
          position += scrollSpeed
        }

        const exactScrollWidth = scrollContainer.scrollWidth
        const singleSetWidth = exactScrollWidth / 4

        // Bidirectional Infinite Loop Logic
        // Keep the scroll within the middle two sets (Set 2 and Set 3)
        if (singleSetWidth > 0) {
          if (position < singleSetWidth) {
            position += singleSetWidth
          } else if (position >= singleSetWidth * 3) {
            position -= singleSetWidth
          }
        }

        scrollContainer.scrollLeft = position
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    // Start at the beginning of Set 2 so there's content to scroll in both directions
    const initialWidth = scrollContainer.scrollWidth / 4
    if (initialWidth > 0 && position < initialWidth) {
      position = initialWidth
      scrollContainer.scrollLeft = position
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isPaused])

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedExperience(null)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          PART 1 & 2: Combined Concierge Headers
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="experiences" className="relative px-6 md:px-12 overflow-hidden pt-12 pb-6 md:pt-16 md:pb-10" style={{ backgroundColor: COLORS.linen }}>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-end">

            {/* Left Block: At Your Service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div>
                <span className="block text-[10px] md:text-xs font-bold tracking-[0.25em] mb-3 uppercase" style={{ color: COLORS.brass }}>
                  Your Concierge Collection
                </span>
                <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                  <h2
                    className="text-3xl md:text-5xl font-serif font-medium tracking-tight leading-[0.95]"
                    style={{ color: COLORS.charcoal }}
                  >
                    At Your <span className="italic">Service</span>
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openContactModal()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all shadow-lg shrink-0"
                    style={{
                      backgroundColor: COLORS.charcoal,
                      color: COLORS.linen,
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Contact Concierge
                  </motion.button>
                </div>
              </div>
              <p className="text-base md:text-lg font-light max-w-lg leading-relaxed" style={{ color: COLORS.stone }}>
                Private chefs, lake cruises, in-home spa — our hand-picked partners are ready before you arrive.
              </p>
            </motion.div>

            {/* Right Block: Your Personal Concierge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-3 border-l md:border-l-0 lg:border-l border-white/20 pl-6 lg:pl-12"
            >
              <span className="text-xs font-bold uppercase tracking-[0.25em] block font-serif" style={{ color: COLORS.brass }}>
                Your Personal Concierge
              </span>
              <p className="text-sm md:text-base leading-relaxed font-light max-w-xl" style={{ color: COLORS.stone }}>
                From private chefs and in-home spa treatments to boat rentals and live entertainment, our curated concierge partners ensure every moment of your stay is effortless.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Subtle Grain/Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Infinite Auto-Scrolling Carousel */}
      <div
        className="relative group mt-4 md:mt-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Buttons - visible always on touch, on hover for desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
          }}
          className="absolute left-2 md:left-6 top-[40%] -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/50 backdrop-blur-xl border border-white/40 flex items-center justify-center text-[#1C1C1C] hover:bg-white/70 transition-all duration-300 shadow-lg md:opacity-0 md:group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" });
          }}
          className="absolute right-2 md:right-6 top-[40%] -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/50 backdrop-blur-xl border border-white/40 flex items-center justify-center text-[#1C1C1C] hover:bg-white/70 transition-all duration-300 shadow-lg md:opacity-0 md:group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollRef}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-6 md:px-12"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {infiniteExperiences.map((exp, index) => (
            <div
              key={`${exp.id}-${index}`}
              onClick={() => setSelectedExperience(exp)}
              className="flex-shrink-0 w-[240px] md:w-[280px] group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9D5F36] focus:ring-offset-4 rounded-2xl transition-all duration-300"
              tabIndex={0}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#BCA28A] mb-3">
                {exp.image && (
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 group-focus:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent group-focus:bg-transparent transition-colors duration-500" />

                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#2B2B2B] rounded-full">
                    {exp.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5 px-1">
                <h3 className="text-base font-serif font-medium group-hover:text-[#9D5F36] group-focus:text-[#9D5F36] transition-colors line-clamp-1" style={{ color: COLORS.charcoal }}>
                  {exp.title}
                </h3>
                <p className="text-xs leading-relaxed font-light line-clamp-2" style={{ color: COLORS.stone }}>
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle hint */}
      <div className="text-center mt-6">
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: COLORS.brass }}>
          Hover to pause &bull; Click to explore
        </p>
      </div>
    </section>

    {/* ═══════════════════════════════════════════════════════════════════
          PART 3: Collapsible & Filterable Editorial Story Scroll List
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: COLORS.linen }}>
        {/* Visual separator */}
        <div className="container mx-auto px-6 md:px-12">
          <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${COLORS.brass}40, transparent)` }} />
        </div>

        {/* Directory Header */}
        <div className="container mx-auto px-6 md:px-12 py-10 md:py-14">
    <div className="flex flex-col gap-8">
      {/* Hero header area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="block text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: COLORS.brass }}>
            Full Directory
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-medium leading-tight" style={{ color: COLORS.charcoal }}>
            All Concierge Partners
          </h2>
          <p className="text-sm md:text-base font-light mt-2 max-w-md leading-relaxed" style={{ color: COLORS.stone }}>
            Browse our complete collection of hand-picked local partners — from private chefs to lakefront adventures.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onClick={() => setIsListExpanded(!isListExpanded)}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:scale-105 shadow-md shrink-0 self-start md:self-auto"
          style={{
            color: isListExpanded ? COLORS.linen : COLORS.linen,
            backgroundColor: isListExpanded ? COLORS.stone : COLORS.charcoal,
            border: 'none',
          }}
        >
          {isListExpanded ? 'Collapse Directory' : 'Explore All Partners'}
          <motion.svg
            animate={{ rotate: isListExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </motion.button>
      </div>

      {/* Filter Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-wrap gap-2 md:gap-3"
      >
        <button
          onClick={() => { setActiveFilter('all'); setIsListExpanded(true) }}
          className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border transition-all duration-200 hover:scale-105 ${activeFilter === 'all'
            ? 'bg-[#463930] text-[#ECE9E7] border-[#463930] shadow-md'
            : 'bg-white/50 border-[#463930]/15 hover:border-[#463930]/40 hover:bg-white/80'
            }`}
          style={{ color: activeFilter === 'all' ? undefined : COLORS.charcoal }}
        >
          All ({experiences.length})
        </button>
        {experienceTypes.map(type => {
          const count = experiences.filter(e => e.type === type).length
          const isActive = activeFilter === type
          return (
            <button
              key={type}
              onClick={() => { setActiveFilter(type); setIsListExpanded(true) }}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border transition-all duration-200 hover:scale-105 ${isActive
                ? 'bg-[#463930] text-[#ECE9E7] border-[#463930] shadow-md'
                : 'bg-white/50 border-[#463930]/15 hover:border-[#463930]/40 hover:bg-white/80'
                }`}
              style={{ color: isActive ? undefined : COLORS.charcoal }}
            >
              {type} ({count})
            </button>
          )
        })}
      </motion.div>
    </div>
        </div>

        {/* Collapsible Experience List */}
        <AnimatePresence>
          {isListExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden pb-32"
            >
              {experiences
                .filter(exp => activeFilter === 'all' || exp.type === activeFilter)
                .map((experience, index) => (
                  <EditorialExperience key={experience.id} item={experience} index={index} />
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Experience Details Popup */}
      <AnimatePresence>
        {selectedExperience && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedExperience(null)}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-[#ECE9E7] rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90dvh]"
      >
        <button
          onClick={() => setSelectedExperience(null)}
          className="absolute top-6 right-6 z-20 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-[#2B2B2B] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Image */}
        <div className="relative w-full md:w-5/12 aspect-[4/3] md:aspect-auto">
          <Image
            src={selectedExperience.imageUrl || "/images/placeholder.jpg"}
            alt={selectedExperience.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-6 left-6">
            <span className="bg-[#463930] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
              {selectedExperience.type}
            </span>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-7/12 p-8 md:p-14 overflow-y-auto bg-[#ECE9E7]">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#2B2B2B] leading-tight">
                {selectedExperience.name}
              </h2>
              <p className="text-[#2B2B2B]/70 text-base md:text-lg font-light mt-6 leading-relaxed">
                {selectedExperience.description}
              </p>
            </div>

            {selectedExperience.serviceOffered && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#9D5F36]" />
                <span className="bg-[#463930]/10 text-[#463930] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {selectedExperience.serviceOffered}
                </span>
              </div>
            )}

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BCA28A]">What to Expect</h4>
              <ul className="space-y-4">
                {selectedExperience.details.split('. ').map((point, i) => point.trim() && (
                  <li key={i} className="flex gap-4 text-sm font-light text-[#2B2B2B]/80 leading-relaxed">
                    <Check className="h-4 w-4 text-[#9D5F36] shrink-0 mt-0.5" />
                    <span>{point.endsWith('.') ? point : `${point}.`}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-8 border-t border-[#BCA28A]/20">
              {selectedExperience.contactName && (
                <div className="flex items-start gap-4">
                  <User className="h-4 w-4 mt-0.5 shrink-0 text-[#BCA28A]" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-[#BCA28A]">Contact</p>
                    <p className="text-xs font-medium text-[#2B2B2B] leading-snug">{selectedExperience.contactName}</p>
                    {selectedExperience.contactTitle && (
                      <p className="text-[11px] text-[#2B2B2B]/60 mt-0.5">{selectedExperience.contactTitle}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedExperience.phone && (
                <div className="flex items-start gap-4">
                  <Phone className="h-4 w-4 mt-0.5 shrink-0 text-[#BCA28A]" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-[#BCA28A]">Phone</p>
                    <a href={`tel:${selectedExperience.phone}`} className="text-xs font-medium text-[#2B2B2B] leading-snug hover:text-[#9D5F36] transition-colors">
                      {selectedExperience.phone}
                    </a>
                  </div>
                </div>
              )}

              {selectedExperience.email && (
                <div className="flex items-start gap-4">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0 text-[#BCA28A]" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-[#BCA28A]">Email</p>
                    <a href={`mailto:${selectedExperience.email}`} className="text-xs font-medium text-[#2B2B2B] leading-snug hover:text-[#9D5F36] transition-colors break-all">
                      {selectedExperience.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-8 flex flex-col gap-4">
              <a
                href={selectedExperience.website || "https://smith-mountain-lake.com/things-to-do/"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#463930] text-[#ECE9E7] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#2B2B2B] transition-all group w-full shadow-lg"
              >
                <Globe className="h-4 w-4" />
                Visit Website
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </a>

              <button
                onClick={() => {
                  setSelectedExperience(null)
                  setTimeout(() => openContactModal(selectedExperience.name), 300)
                }}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BCA28A] hover:text-[#9D5F36] transition-colors py-2"
              >
                Contact Concierge about this service
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
        )}
      </AnimatePresence>
    </>
  )
}
