"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { experiences, Experience } from "@/lib/experiences"
import { ArrowRight, ChevronRight, ChevronLeft, X, Globe, MapPin, Clock, Phone, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useConcierge } from "./concierge-context"

export default function Experiences() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const { openContactModal } = useConcierge()

  // Map the new data structure to match what the UI expects
  const mappedExperiences = experiences.map(exp => ({
    ...exp,
    title: exp.name,
    image: exp.imageUrl || "/images/placeholder.jpg",
  }))

  // Create a tripled list for seamless infinite scrolling
  const extendedExperiences = [...mappedExperiences, ...mappedExperiences, ...mappedExperiences]

  // Initialize scroll position to the middle set
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const initializeScroll = () => {
        const w = container.scrollWidth
        container.scrollLeft = w / 3
      }
      const timeout = setTimeout(initializeScroll, 100)
      return () => clearTimeout(timeout)
    }
  }, [])

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedExperience(null)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollLeft = container.scrollLeft
      const scrollWidth = container.scrollWidth
      const oneSetWidth = scrollWidth / 3

      // If we've scrolled into the first set (too far left), jump to the middle set
      if (scrollLeft < 10) {
        container.scrollLeft = oneSetWidth + scrollLeft
      }
      // If we've scrolled into the third set (too far right), jump to the middle set
      else if (scrollLeft >= oneSetWidth * 2) {
        container.scrollLeft = scrollLeft - oneSetWidth
      }
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = direction === "left" ? -450 : 450
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section id="experiences" className="py-24 bg-depth-taupe-subtle border-y border-[var(--color-brand-taupe)]/10 overflow-hidden">
      <div className="container mx-auto px-6 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="brand-overline">Curated Discovery</span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-[var(--color-brand-charcoal)] mb-4 brand-section-heading-accent">
              Unforgettable Experiences
            </h2>
            <p className="text-lg text-[var(--color-brand-charcoal)]/70 font-light leading-relaxed mt-6">
              From adrenaline-pumping water sports to serene vineyard tastings, discover the very best of Smith Mountain Lake.
            </p>
          </div>
        </div>

        {/* Horizontal Infinite Carousel */}
        <div className="relative group mt-12">
          {/* Navigation Buttons - Visible on all screens, liquid glass style */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 md:-left-4 lg:-left-12 top-[40%] -translate-y-1/2 z-20 h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/30 backdrop-blur-xl border border-white/30 flex items-center justify-center text-[#1C1C1C] hover:bg-white/50 transition-all duration-300 shadow-[0_8px_32px_rgba(31,38,135,0.15)]"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-2 md:-right-4 lg:-right-12 top-[40%] -translate-y-1/2 z-20 h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/30 backdrop-blur-xl border border-white/30 flex items-center justify-center text-[#1C1C1C] hover:bg-white/50 transition-all duration-300 shadow-[0_8px_32px_rgba(31,38,135,0.15)]"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
          >
            {extendedExperiences.map((exp, index) => (
              <div
                key={`${index}-${exp.title}`}
                onClick={() => setSelectedExperience(exp)}
                className="min-w-[85vw] md:min-w-[400px] lg:min-w-[450px] snap-center group cursor-pointer block p-4 brand-card-premium bg-white/50 backdrop-blur-sm shadow-sm"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[var(--color-brand-taupe)] mb-6">
                  {exp ? (
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />

                  <div className="absolute top-4 left-4">
                    <span className="bg-[#ECE9E7]/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2B2B2B] rounded-full">
                      {exp.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 px-2">
                  <h3 className="text-xl font-serif font-medium text-[var(--color-brand-charcoal)] group-hover:text-[var(--color-brand-rust)] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-[var(--color-brand-charcoal)]/70 text-sm leading-relaxed font-light line-clamp-2">
                    {exp.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-charcoal)] group-hover:text-[var(--color-brand-rust)] group-hover:translate-x-2 transition-all duration-300">
                    Learn More <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BCA28A]">Experience Highlights</h4>
                    <ul className="space-y-4">
                      {selectedExperience.details.split('. ').map((point, i) => point.trim() && (
                        <li key={i} className="flex gap-4 text-sm font-light text-[#2B2B2B]/80 leading-relaxed">
                          <Check className="h-4 w-4 text-[#9D5F36] shrink-0 mt-0.5" />
                          <span>{point.endsWith('.') ? point : `${point}.`}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-[#BCA28A]/20">
                    {selectedExperience.address && (
                      <div className="flex items-start gap-4">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#BCA28A]" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-[#BCA28A]">Location</p>
                          <p className="text-xs font-medium text-[#2B2B2B] leading-snug">{selectedExperience.address}</p>
                        </div>
                      </div>
                    )}

                    {selectedExperience.hours && (
                      <div className="flex items-start gap-4">
                        <Clock className="h-4 w-4 mt-0.5 shrink-0 text-[#BCA28A]" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-[#BCA28A]">Hours</p>
                          <p className="text-xs font-medium text-[#2B2B2B] leading-snug">{selectedExperience.hours}</p>
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
                      Explore Now
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </a>

                    <button
                      onClick={() => {
                        setSelectedExperience(null)
                        setTimeout(() => openContactModal(selectedExperience.name), 300)
                      }}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BCA28A] hover:text-[#9D5F36] transition-colors py-2"
                    >
                      Contact Concierge about this experience
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
