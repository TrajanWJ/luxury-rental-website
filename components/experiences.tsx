"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { experiences } from "@/lib/experiences-data"
import { ArrowRight, ChevronRight, ChevronLeft } from "lucide-react"

export default function Experiences() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Map the new data structure to match what the UI expects
  const mappedExperiences = experiences.map(exp => ({
    title: exp.title,
    type: exp.type,
    image: exp.image || "/images/placeholder.jpg",
    description: exp.description
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
    <section id="experiences" className="py-24 md:py-32 bg-[#ECE9E7] text-[#2B2B2B] overflow-hidden border-t border-[#2B2B2B]/5">
      <div className="container mx-auto px-6 md:px-12">

        {/* Header with Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <span className="text-[#BCA28A] text-xs font-bold uppercase tracking-[0.25em] mb-4 block">
              Curated Lifestyle
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight text-[#2B2B2B]">
              Life on the Water
            </h2>
          </div>
        </div>

        {/* Horizontal Infinite Carousel */}
        <div className="relative group">
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
              <a
                key={`${index}-${exp.title}`}
                href="https://smith-mountain-lake.com/things-to-do/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[85vw] md:min-w-[400px] lg:min-w-[450px] snap-center group cursor-pointer block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#BCA28A] mb-8">
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
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />

                  <div className="absolute top-6 left-6">
                    <span className="bg-[#ECE9E7]/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2B2B2B]">
                      {exp.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pr-8">
                  <h3 className="text-2xl font-serif font-medium text-[#2B2B2B] group-hover:text-[#9D5F36] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-[#2B2B2B]/70 text-base leading-relaxed font-light line-clamp-2">
                    {exp.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2B2B2B] group-hover:translate-x-2 transition-transform duration-300">
                    Explore Now <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
