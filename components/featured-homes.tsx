"use client"

import { useEffect, useRef, useState } from "react"
import { PropertyCard } from "./property-card"
import { PropertyModal } from "./property-modal"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

import { properties, Property } from "@/lib/data"

export default function FeaturedHomes() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [startWith3D, setStartWith3D] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handlePropertyClick = (property: Property) => {
    setStartWith3D(false)
    setSelectedProperty(property)
  }

  const handle3DClick = (property: Property) => {
    setStartWith3D(true)
    setSelectedProperty(property)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <>
      <section ref={sectionRef} className="py-20 md:py-32 bg-gradient-to-b from-[#ECE9E7] to-white overflow-hidden border-t border-[#BCA28A]/20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16 md:mb-20 max-w-4xl mx-auto">
            <span className="text-[#BCA28A] text-xs font-bold uppercase tracking-[0.25em] mb-4 block font-serif">
              Reunion Homes & Lakeside Townhomes
            </span>
            <h2
              className={`text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#2B2B2B] mb-6 leading-tight tracking-tight transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              Signature Lakefront Homes
            </h2>
            <p
              className={`text-lg md:text-xl text-[#2B2B2B]/70 max-w-2xl mx-auto mb-8 leading-relaxed font-light transition-all duration-1000 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              Luxuriously appointed residences designed to meet every need with elegant accommodations, serene surroundings, and details that delight. Each home brings families together for memories that last a lifetime.
            </p>

            {/* Benefits List */}
            <div className={`flex flex-wrap justify-center gap-6 md:gap-8 text-sm transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="flex items-center gap-2 text-[#2B2B2B]/80">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9D5F36]"></div>
                <span className="font-medium">Private Docks & Boat Slips</span>
              </div>
              <div className="flex items-center gap-2 text-[#2B2B2B]/80">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9D5F36]"></div>
                <span className="font-medium">Gourmet Kitchens</span>
              </div>
              <div className="flex items-center gap-2 text-[#2B2B2B]/80">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9D5F36]"></div>
                <span className="font-medium">Concierge-Level Service</span>
              </div>
              <div className="flex items-center gap-2 text-[#2B2B2B]/80">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9D5F36]"></div>
                <span className="font-medium">Thoughtful Amenities</span>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-12"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {properties.map((property, index) => (
                <div
                  key={property.id}
                  className={`flex-shrink-0 w-[85vw] md:w-[400px] lg:w-[450px] snap-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                    }`}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                  }}
                >
                  <PropertyCard
                    property={property}
                    onClick={() => handlePropertyClick(property)}
                    on3DClick={() => handle3DClick(property)}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Buttons - Centered and Downwards */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 z-10">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10 shadow-lg text-foreground hover:scale-105 transition-all w-10 h-10"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10 shadow-lg text-foreground hover:scale-105 transition-all w-10 h-10"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Property Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          initialShow3D={startWith3D}
        />
      )}
    </>
  )
}
