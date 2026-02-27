"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { experiences, Experience } from "@/lib/experiences"
import { ArrowRight, ChevronLeft, ChevronRight, X, Globe, Phone, Mail, User, Check, Sparkles, Anchor, UtensilsCrossed, CalendarDays, Compass, HelpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useConcierge } from "./concierge-context"
import { usePopupFreeze } from "@/hooks/use-popup-freeze"

// ─── Insider's Guide Categories ───
const insiderCategories = [
  {
    id: "events-festivals",
    name: "Events & Festivals",
    icon: CalendarDays,
    image: "/bridgewater-plaza.png",
    description: "Seasonal celebrations, live music, and community gatherings around the lake.",
    items: [
      "Smith Mountain Lake Wine Festival",
      "SML Charity Home Tour",
      "Lighthouse Music Fest",
      "Fourth of July Fireworks on the Lake",
      "Fall Foliage Cruise Weekend",
      "Lake Christmas Boat Parade",
      "Bridgewater Plaza Summer Concert Series",
    ],
  },
  {
    id: "boating",
    name: "Boating",
    icon: Anchor,
    image: "/boating-water-sports.png",
    description: "Pontoon rentals, guided fishing trips, sunset cruises, and everything on the water.",
    items: [
      "Pontoon & Boat Rentals",
      "Guided Fishing Charters",
      "Sunset & Sightseeing Cruises",
      "Jet Ski & Kayak Rentals",
      "Wakeboarding & Tubing",
      "Dock & Swim Access",
      "Sailing Lessons",
    ],
  },
  {
    id: "dining",
    name: "Dining",
    icon: UtensilsCrossed,
    image: "/waterfront-dining.png",
    description: "Lakeside restaurants, private chefs, and the best places to eat at Smith Mountain Lake.",
    items: [
      "Mango\u2019s Bar & Grill",
      "The Landing Restaurant",
      "Cafe del Lago",
      "Napoli at the Lake (Private Chef)",
      "Bridgewater Plaza Dining",
      "Local Wineries & Breweries",
      "Catering & Private Events",
    ],
  },
  {
    id: "activities-experiences",
    name: "Activities & Experiences",
    icon: Compass,
    image: "/state-park-beach.png",
    description: "Hiking, golf, spa days, live entertainment, and family-friendly adventures.",
    items: [
      "Smith Mountain Lake State Park",
      "Hiking & Nature Trails",
      "Golf Courses Nearby",
      "In-Home Spa & Wellness",
      "Live Entertainment & Shows",
      "Horseback Riding",
      "Shopping & Local Boutiques",
    ],
  },
  {
    id: "essentials-faq",
    name: "Essentials / FAQ",
    icon: HelpCircle,
    image: "/marina-docks.png",
    description: "Grocery stores, marinas, gas stations, pharmacies, and everything you need to know.",
    items: [
      "Nearest Grocery Stores",
      "Gas Stations & Marinas",
      "Urgent Care & Pharmacies",
      "ATMs & Banks",
      "Weather & Lake Conditions",
      "Directions & Getting Here",
      "Emergency Contacts",
    ],
  },
]

// ─── Colors (matching the /experiences standalone page) ───
const COLORS = {
  linen: "#EAE8E4",
  charcoal: "#1C1C1C",
  stone: "#8C8984",
  brass: "#A4907C",
}


// ─── Main Experiences Component (used on homepage) ───
export default function Experiences() {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<typeof insiderCategories[number] | null>(null)
  const [isListExpanded, setIsListExpanded] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [descExpanded, setDescExpanded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { openContactModal } = useConcierge()
  usePopupFreeze(!!selectedExperience || !!selectedCategory)

  // Get unique experience types for filter buttons
  const experienceTypes = Array.from(new Set(experiences.map(e => e.type)))

  // Reset description expanded and image index state when experience changes
  useEffect(() => {
    setDescExpanded(false)
    setCurrentImageIndex(0)
  }, [selectedExperience])

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedExperience(null)
        setSelectedCategory(null)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          PART 1 & 2: Combined Concierge Headers
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="experiences" className="relative px-5 md:px-12 overflow-hidden pt-12 pb-6 md:pt-14 md:pb-6" style={{ backgroundColor: COLORS.linen }}>
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4 max-w-2xl"
          >
            <div>
              <span className="block text-xs md:text-xs font-bold tracking-[0.2em] mb-3 uppercase" style={{ color: COLORS.brass }}>
                Smith Mountain Lake
              </span>
              <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                <h2
                  className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-[0.95]"
                  style={{ color: COLORS.charcoal }}
                >
                  Insider&apos;s <span className="italic">Guide</span>
                </h2>
              </div>
            </div>
            <p className="text-lg md:text-lg font-light max-w-xl leading-relaxed" style={{ color: COLORS.stone }}>
              From boat rentals to live entertainment — discover the best of Smith Mountain Lake.
            </p>
          </motion.div>
        </div>

        {/* Subtle Grain/Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Category Cards Grid */}
      <div className="container mx-auto mt-8 md:mt-10 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {insiderCategories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                onClick={() => setSelectedCategory(category)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#BCA28A]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/5 group-hover:from-black/70 transition-all duration-500" />

                  {/* Icon + Title overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm">
                        <IconComponent className="h-4 w-4 text-white" />
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-serif font-medium text-white leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-[11px] md:text-xs text-white/70 font-light mt-1 leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Subtle hint */}
      <div className="text-center mt-5 pb-2">
        <p className="text-[11px] md:text-xs uppercase tracking-[0.16em]" style={{ color: COLORS.brass }}>
          Click a category to explore
        </p>
      </div>
    </section>

    {/* Category Popup */}
    <AnimatePresence>
      {selectedCategory && (
        <div data-popup-root className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedCategory(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[560px] bg-[#ECE9E7] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85dvh] flex flex-col"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedCategory(null)}
              className="absolute top-4 right-4 z-30 h-9 w-9 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm flex items-center justify-center text-[#2B2B2B] transition-all duration-200 shadow-sm"
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* Header Image */}
            <div className="relative w-full aspect-[16/7] shrink-0 overflow-hidden">
              <Image
                src={selectedCategory.image}
                alt={selectedCategory.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-14">
                <div className="flex items-center gap-2.5 mb-1.5">
                  {(() => { const Icon = selectedCategory.icon; return <Icon className="h-5 w-5 text-white/80" /> })()}
                  <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white leading-tight">
                    {selectedCategory.name}
                  </h2>
                </div>
                <p className="text-xs text-white/70 font-light">{selectedCategory.description}</p>
              </div>
            </div>

            {/* Items List */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: COLORS.brass }}>
                What to Explore
              </p>
              <div className="space-y-2.5">
                {selectedCategory.items.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/50 border border-[#BCA28A]/10 hover:bg-white/80 transition-colors duration-200"
                  >
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#9D5F36]/10 shrink-0">
                      <ArrowRight className="h-3 w-3 text-[#9D5F36]" />
                    </span>
                    <span className="text-sm font-light" style={{ color: COLORS.charcoal }}>
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs font-light text-center mt-6 italic" style={{ color: COLORS.stone }}>
                Full details coming soon — ask us anything during your stay.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

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
          <span className="block text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: COLORS.brass }}>
            Exclusive to Wilson Premier Guests
          </span>
          <h2 className="text-4xl md:text-4xl font-serif font-medium leading-tight" style={{ color: COLORS.charcoal }}>
            Concierge Partners Directory
          </h2>
          <p className="text-base md:text-base font-light mt-2 max-w-md leading-relaxed" style={{ color: COLORS.stone }}>
            Our hand-picked local partners are available exclusively to Wilson Premier guests — from private chefs to lakefront adventures.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onClick={() => setIsListExpanded(!isListExpanded)}
          className="inline-flex items-center gap-3 px-7 py-4 rounded-full text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:scale-105 shadow-md shrink-0 self-start md:self-auto"
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
        className="flex flex-wrap gap-2.5 md:gap-3"
      >
        <button
          onClick={() => { setActiveFilter('all'); setIsListExpanded(true) }}
          className={`px-4 py-2.5 rounded-full text-[11px] md:text-[10px] font-bold uppercase tracking-[0.12em] border transition-all duration-200 hover:scale-105 ${activeFilter === 'all'
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
              className={`px-4 py-2.5 rounded-full text-[11px] md:text-[10px] font-bold uppercase tracking-[0.12em] border transition-all duration-200 hover:scale-105 ${isActive
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

        {/* Collapsible Experience Grid Directory */}
        <AnimatePresence>
          {isListExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="container mx-auto px-6 md:px-12 pb-20 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
                  {experiences
                    .filter(exp => activeFilter === 'all' || exp.type === activeFilter)
                    .map((experience, index) => (
                      <motion.div
                        key={experience.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => setSelectedExperience(experience)}
                        className="group cursor-pointer rounded-2xl p-6 md:p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: `1px solid rgba(140,137,132,0.12)` }}
                      >
                        <div className="flex gap-4 md:gap-4">
                          {/* Image */}
                          <div className="relative h-24 w-24 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-xl">
                            <Image
                              src={experience.imageUrl || "/images/placeholder.jpg"}
                              alt={experience.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="80px"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3
                              className="text-lg md:text-base font-serif font-medium leading-snug line-clamp-1 transition-colors duration-200 group-hover:text-[#A4907C]"
                                style={{ color: COLORS.charcoal }}
                              >
                                {experience.name}
                              </h3>
                            </div>

                            {/* Type badge */}
                            <span
                              className="inline-block text-[10px] md:text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1 md:px-2.5 md:py-0.5 rounded-full"
                              style={{ backgroundColor: `${COLORS.brass}18`, color: COLORS.brass }}
                            >
                              {experience.type}
                            </span>

                            <p
                              className="text-sm md:text-xs font-light leading-relaxed line-clamp-3 md:line-clamp-2"
                              style={{ color: COLORS.stone }}
                            >
                              {experience.description}
                            </p>
                          </div>
                        </div>

                        {/* Footer: contact & action */}
                        <div className="mt-4 pt-3 flex items-center justify-between gap-3" style={{ borderTop: `1px solid ${COLORS.stone}15` }}>
                          <div className="min-w-0">
                            {experience.contactName && (
                              <p className="text-sm md:text-xs font-medium truncate" style={{ color: COLORS.charcoal }}>
                                {experience.contactName}
                              </p>
                            )}
                            {experience.phone && (
                              <a
                                href={`tel:${experience.phone.replace(/[^+\d]/g, "")}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs md:text-[11px] mt-0.5 transition-colors hover:opacity-70"
                                style={{ color: COLORS.stone }}
                              >
                                <Phone className="h-3 w-3" />
                                {experience.phone}
                              </a>
                            )}
                          </div>

                          <span
                            className="shrink-0 inline-flex items-center gap-1.5 text-[11px] md:text-[10px] font-bold uppercase tracking-[0.08em] transition-all duration-200 group-hover:gap-2.5"
                            style={{ color: COLORS.brass }}
                          >
                            View Details
                            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Experience Details Popup */}
      <AnimatePresence>
        {selectedExperience && (
          <div data-popup-root className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedExperience(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[920px] bg-[#ECE9E7] rounded-2xl sm:rounded-3xl md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92dvh] md:max-h-[88dvh]"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedExperience(null)}
                className="absolute top-4 right-4 md:top-5 md:right-5 z-30 h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm flex items-center justify-center text-[#2B2B2B] transition-all duration-200 shadow-sm"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </motion.button>

              {/* Left Side: Image Gallery */}
              {(() => {
                const galleryImages = selectedExperience.images && selectedExperience.images.length > 0
                  ? selectedExperience.images
                  : [selectedExperience.imageUrl || "/images/placeholder.jpg"]
                const hasMultiple = galleryImages.length > 1
                return (
                  <div className="relative w-full md:w-[38%] shrink-0 aspect-[16/10] sm:aspect-[16/9] md:aspect-auto md:min-h-full overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={galleryImages[currentImageIndex]}
                          alt={`${selectedExperience.name} ${currentImageIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 38vw"
                        />
                      </motion.div>
                    </AnimatePresence>
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/[0.06]" />

                    {/* Type Badge */}
                    <div className="absolute top-4 left-4 md:top-5 md:left-5">
                      <span className="bg-[#463930]/90 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] shadow-md">
                        {selectedExperience.type}
                      </span>
                    </div>

                    {/* Gallery Navigation */}
                    {hasMultiple && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? galleryImages.length - 1 : prev - 1) }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-[#1C1C1C] hover:bg-white/80 transition-all shadow-md"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === galleryImages.length - 1 ? 0 : prev + 1) }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-[#1C1C1C] hover:bg-white/80 transition-all shadow-md"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        {/* Dot indicators */}
                        <div className="absolute bottom-14 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                          {galleryImages.map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i) }}
                              className={`h-2 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'}`}
                              aria-label={`View image ${i + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Service Offered pill on image */}
                    {selectedExperience.serviceOffered && (
                      <div className={`absolute left-4 md:left-5 right-16 md:right-5 ${hasMultiple ? 'bottom-10 md:bottom-12' : 'bottom-4 md:bottom-5'}`}>
                        <span className="inline-flex items-center gap-1.5 bg-white/85 backdrop-blur-sm text-[#463930] px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm">
                          <Sparkles className="h-3 w-3 text-[#9D5F36] shrink-0" />
                          <span className="truncate">{selectedExperience.serviceOffered}</span>
                        </span>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Right Side: Content */}
              <div className="w-full md:w-[62%] overflow-y-auto scrollbar-hide overscroll-contain">
                <div className="p-6 sm:p-8 md:p-10 lg:p-12">

                  {/* Section 1: Title & Description */}
                  <div className="space-y-3 md:space-y-4">
                    <h2 className="text-2xl sm:text-3xl md:text-[2.25rem] font-serif font-medium leading-[1.1] tracking-tight" style={{ color: '#2B2B2B' }}>
                      {selectedExperience.name}
                    </h2>
                    <p className={`text-sm sm:text-[15px] font-light leading-relaxed ${descExpanded ? "" : "line-clamp-3"}`} style={{ color: 'rgba(43,43,43,0.7)' }}>
                      {selectedExperience.description}
                    </p>
                    {!descExpanded && (
                      <button onClick={() => setDescExpanded(true)} className="text-xs text-[#9D5F36] font-medium mt-1 hover:underline">
                        Show more...
                      </button>
                    )}
                    {descExpanded && (
                      <button onClick={() => setDescExpanded(false)} className="text-xs text-[#9D5F36] font-medium mt-1 hover:underline">
                        Show less
                      </button>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="my-6 md:my-8 h-px" style={{ background: 'linear-gradient(to right, #BCA28A40, #BCA28A20, transparent)' }} />

                  {/* Section 2: What to Expect */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-5" style={{ color: '#BCA28A' }}>
                      What to Expect
                    </h4>
                    <div className="space-y-3">
                      {selectedExperience.details.split('. ').map((point, i) => point.trim() && (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
                          className="flex gap-3 group/item"
                        >
                          <span
                            className="flex items-center justify-center h-5 w-5 rounded-full shrink-0 mt-0.5 transition-colors duration-200 group-hover/item:bg-[#9D5F36]/15"
                            style={{ backgroundColor: 'rgba(157,95,54,0.08)' }}
                          >
                            <Check className="h-3 w-3 text-[#9D5F36]" />
                          </span>
                          <span className="text-[13px] font-light leading-relaxed" style={{ color: 'rgba(43,43,43,0.75)' }}>
                            {point.endsWith('.') ? point : `${point}.`}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-6 md:my-8 h-px" style={{ background: 'linear-gradient(to right, #BCA28A40, #BCA28A20, transparent)' }} />

                  {/* Section 3: Contact Info (compact card layout) */}
                  {(selectedExperience.contactName || selectedExperience.phone || selectedExperience.email) && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#BCA28A' }}>
                        Get in Touch
                      </h4>
                      <div className="rounded-xl bg-white/50 border border-[#BCA28A]/10 p-4 sm:p-5">
                        {/* Contact name and title */}
                        {selectedExperience.contactName && (
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className="flex items-center justify-center h-8 w-8 rounded-full shrink-0"
                              style={{ backgroundColor: 'rgba(188,162,138,0.15)' }}
                            >
                              <User className="h-3.5 w-3.5 text-[#BCA28A]" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-snug" style={{ color: '#2B2B2B' }}>
                                {selectedExperience.contactName}
                              </p>
                              {selectedExperience.contactTitle && (
                                <p className="text-[11px] font-light leading-snug" style={{ color: 'rgba(43,43,43,0.5)' }}>
                                  {selectedExperience.contactTitle}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Phone and email inline */}
                        {(selectedExperience.phone || selectedExperience.email) && (
                          <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${selectedExperience.contactName ? 'pt-3 border-t border-[#BCA28A]/10' : ''}`}>
                            {selectedExperience.phone && (
                              <a
                                href={`tel:${selectedExperience.phone.replace(/[^+\d]/g, "")}`}
                                className="inline-flex items-center gap-2 text-xs font-medium transition-colors duration-200 hover:text-[#9D5F36]"
                                style={{ color: '#2B2B2B' }}
                              >
                                <Phone className="h-3.5 w-3.5 text-[#BCA28A]" />
                                {selectedExperience.phone}
                              </a>
                            )}
                            {selectedExperience.email && (
                              <a
                                href={`mailto:${selectedExperience.email}`}
                                className="inline-flex items-center gap-2 text-xs font-medium transition-colors duration-200 hover:text-[#9D5F36] break-all"
                                style={{ color: '#2B2B2B' }}
                              >
                                <Mail className="h-3.5 w-3.5 text-[#BCA28A]" />
                                {selectedExperience.email}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-6 md:my-8 h-px" style={{ background: 'linear-gradient(to right, #BCA28A40, #BCA28A20, transparent)' }} />

                  {/* Section 4: Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={selectedExperience.website || "https://smith-mountain-lake.com/things-to-do/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 bg-[#463930] text-[#ECE9E7] px-6 py-3.5 rounded-xl font-bold uppercase tracking-[0.12em] text-[10px] hover:bg-[#2B2B2B] transition-colors duration-300 group shadow-lg flex-1"
                    >
                      <Globe className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                      Visit Website
                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </motion.a>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedExperience(null)
                        setTimeout(() => openContactModal(selectedExperience.name), 300)
                      }}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold uppercase tracking-[0.12em] text-[10px] border transition-all duration-300 hover:bg-[#BCA28A]/10 flex-1"
                      style={{ color: '#463930', borderColor: '#463930' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Ask Concierge
                    </motion.button>
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
