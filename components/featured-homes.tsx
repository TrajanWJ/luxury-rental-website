"use client"

import { useEffect, useRef, useState } from "react"
import { PropertyCard } from "./property-card"
import { PropertyModal } from "./property-modal"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Property {
  id: string
  name: string
  image: string
  sleeps: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  description: string
  images: string[]
}

const properties: Property[] = [
  {
    id: "1",
    name: "The Grand Vista Estate",
    image: "/luxury-lakefront-estate-sunset-view.jpg",
    sleeps: 36,
    bedrooms: 12,
    bathrooms: 10,
    amenities: ["Private Dock", "Infinity Pool", "Hot Tub", "Game Room", "Chef Kitchen"],
    description:
      "Experience unparalleled luxury at our crown jewel property. This magnificent estate offers breathtaking panoramic lake views, resort-style amenities, and spacious accommodations perfect for large family reunions and corporate retreats.",
    images: ["/luxury-lakefront-estate-sunset-view.jpg", "/modern-luxury-living-room-lake-view.jpg", "/gourmet-kitchen-marble-countertops.jpg"],
  },
  {
    id: "2",
    name: "Sunset Shores Manor",
    image: "/modern-lakefront-home-dock.jpg",
    sleeps: 24,
    bedrooms: 8,
    bathrooms: 7,
    amenities: ["Private Dock", "Pool", "Fire Pit", "Game Room", "Boat Slip"],
    description:
      "A stunning modern retreat with floor-to-ceiling windows showcasing spectacular lake sunsets. Perfect for weddings, family gatherings, and special celebrations with its elegant design and premium amenities.",
    images: ["/modern-lakefront-home-dock.jpg", "/luxury-bedroom-lake-view.jpg", "/outdoor-patio-fire-pit-lake.jpg"],
  },
  {
    id: "3",
    name: "Lakeside Haven",
    image: "/cozy-lakefront-cabin-private-dock.jpg",
    sleeps: 16,
    bedrooms: 6,
    bathrooms: 5,
    amenities: ["Private Dock", "Hot Tub", "Kayaks", "BBQ Area", "Lake Access"],
    description:
      "Charming waterfront escape combining rustic elegance with modern comforts. Ideal for intimate family gatherings with direct lake access, water sports equipment, and peaceful surroundings.",
    images: ["/cozy-lakefront-cabin-private-dock.jpg", "/rustic-dining-room-wooden-beams.jpg", "/deck-with-hot-tub-lake-view.jpg"],
  },
  {
    id: "4",
    name: "Blue Water Retreat",
    image: "/contemporary-lake-house-boat-dock.jpg",
    sleeps: 20,
    bedrooms: 7,
    bathrooms: 6,
    amenities: ["Private Dock", "Pool & Hot Tub", "Theater Room", "Wine Cellar", "Gym"],
    description:
      "Contemporary luxury meets lakeside living in this architectural masterpiece. Features state-of-the-art entertainment spaces, fitness facilities, and premium outdoor living areas for the ultimate vacation experience.",
    images: ["/contemporary-lake-house-boat-dock.jpg", "/home-theater-room-luxury.jpg", "/infinity-pool-overlooking-lake.jpg"],
  },
]

export default function FeaturedHomes() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
      <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className={`text-4xl md:text-5xl font-bold text-slate-900 mb-4 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Signature Lakefront Homes
            </h2>
            <p
              className={`text-lg text-slate-600 max-w-2xl mx-auto transition-all duration-1000 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Discover our exclusive collection of luxury vacation homes at Smith Mountain Lake
            </p>
          </div>

          <div className="relative">
            {/* Desktop Navigation Buttons */}
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg hover:bg-white hover:scale-110 transition-all"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-6 w-6 text-slate-700" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg hover:bg-white hover:scale-110 transition-all"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-6 w-6 text-slate-700" />
              </Button>
            </div>

            {/* Carousel Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {properties.map((property, index) => (
                <div
                  key={property.id}
                  className={`flex-shrink-0 w-[85vw] md:w-[400px] lg:w-[450px] snap-center transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                  }`}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                  }}
                >
                  <PropertyCard property={property} onClick={() => setSelectedProperty(property)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Modal */}
      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </>
  )
}
