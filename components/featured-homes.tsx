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
      <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-b from-[var(--color-brand-linen)] to-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className={`text-4xl md:text-5xl font-bold text-foreground mb-4 transition-all duration-1000 font-serif ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              Signature Lakefront Homes
            </h2>
            <p
              className={`text-lg text-muted-foreground/80 max-w-2xl mx-auto transition-all duration-1000 delay-100 font-sans ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              Discover our exclusive collection of luxury vacation homes at Smith Mountain Lake
            </p>
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
