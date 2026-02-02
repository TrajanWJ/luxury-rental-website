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
    <section
      className="py-32 md:py-40 bg-[#ebe0d4] text-[#1C1C1C] overflow-hidden border-t border-[#1C1C1C]/5 relative"
    >
      <div className="container mx-auto px-6 md:px-12">

        {/* Header with Controls */}
        <div className="flex justify-between items-end mb-20">
          <div className="max-w-md">
            <span className="text-[#A4907C] text-xs font-bold uppercase tracking-[0.25em] mb-4 block">
              Guest Book
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#1C1C1C] leading-tight">
              Stories from the Lake
            </h2>
          </div>

          <div className="flex gap-4 hidden md:flex">
            <button
              onClick={() => scroll("left")}
              className="h-12 w-12 rounded-full border border-[#1C1C1C]/10 flex items-center justify-center hover:bg-[#1C1C1C] hover:text-[#ebe0d4] transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="h-12 w-12 rounded-full border border-[#1C1C1C]/10 flex items-center justify-center hover:bg-[#1C1C1C] hover:text-[#ebe0d4] transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
        >
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="min-w-[85vw] md:min-w-[600px] snap-center bg-white p-12 md:p-16 rounded-none flex flex-col justify-between border border-[#1C1C1C]/5 shadow-sm"
            >
              <Quote className="h-8 w-8 text-[#A4907C] mb-8 opacity-50" />

              <blockquote className="text-2xl md:text-3xl font-serif font-regular leading-[1.4] text-[#1C1C1C] mb-12">
                "{item.quote}"
              </blockquote>

              <div>
                <cite className="not-italic text-sm font-bold uppercase tracking-[0.15em] block text-[#1C1C1C] mb-2">
                  {item.author}
                </cite>
                <span className="text-[#8C8984] text-xs uppercase tracking-widest">
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
