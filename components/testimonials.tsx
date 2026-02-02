"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, Quote } from "lucide-react"

export default function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const testimonials = [
    {
      quote: "It wasn’t just a rental. It was a complete reset. The attention to detail—from the linens to the concierge service—was impeccable.",
      author: "The Harrison Family",
      location: "Stayed at Milan Manor"
    },
    {
      quote: "A truly world-class experience. The property exceeded every expectation and the location is unmatched.",
      author: "James & Sarah",
      location: "Stayed at Suite Retreat"
    },
    {
      quote: "Perfect for our corporate retreat. Privacy, luxury, and flawless execution by the Wilson Premier team.",
      author: "Tech Solutions Inc.",
      location: "Stayed at The Point"
    }
  ]

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = direction === "left" ? -400 : 400
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section id="testimonials" className="py-24 bg-[var(--color-brand-linen)] border-t border-[var(--color-brand-taupe)]/20 relative overflow-hidden">
      <div className="container mx-auto px-6 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="brand-overline">Guest Book</span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-[var(--color-brand-charcoal)] mb-4 brand-section-heading-accent">
              Stories from the Lake
            </h2>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => scroll("left")}
              className="h-12 w-12 rounded-full border border-[var(--color-brand-charcoal)]/10 flex items-center justify-center hover:bg-[var(--color-brand-charcoal)] hover:text-[var(--color-brand-linen)] transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="h-12 w-12 rounded-full border border-[var(--color-brand-charcoal)]/10 flex items-center justify-center hover:bg-[var(--color-brand-charcoal)] hover:text-[var(--color-brand-linen)] transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 mt-16"
        >
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="min-w-[85vw] md:min-w-[600px] snap-center bg-white p-10 md:p-14 brand-card-premium flex flex-col justify-between"
            >
              <Quote className="h-8 w-8 text-[var(--color-brand-rust)] mb-8 opacity-40 shrink-0" />

              <blockquote className="text-xl md:text-2xl font-serif font-light leading-relaxed text-[var(--color-brand-charcoal)] mb-10">
                "{item.quote}"
              </blockquote>

              <div className="border-t border-[var(--color-brand-taupe)]/10 pt-6">
                <cite className="not-italic text-sm font-bold uppercase tracking-[0.2em] block text-[var(--color-brand-charcoal)] mb-2">
                  {item.author}
                </cite>
                <span className="text-[var(--color-brand-taupe)] text-[10px] font-bold uppercase tracking-[0.15em]">
                  {item.location}
                </span>
              </div>
            </div>
          ))}

          {/* Spacer for right padding */}
          <div className="min-w-[1px] opacity-0"></div>
        </div>

      </div>
    </section>
  )
}
