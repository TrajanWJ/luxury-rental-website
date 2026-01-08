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
  matterportUrl?: string
}

const properties: Property[] = [
  {
    id: "6",
    name: "Milan Manor House",
    image: "https://wilson-premier.com/wp-content/uploads/2024/08/BackOfHouse-495x400.jpg",
    sleeps: 14,
    bedrooms: 5,
    bathrooms: 8,
    amenities: ["30 Private Acres", "Speakeasy Bar", "Pickleball Court", "Piano", "650ft Shoreline", "Historic Charm"],
    description:
      "Escape to an enchanting private manor on 30 acres of secluded beauty along Smith Mountain Lake. Immerse yourself in 1940s charm elegantly blended with midcentury modern style, offering 6,900 sq ft of bespoke luxury perfect for weddings and family travel.",
    images: ["https://wilson-premier.com/wp-content/uploads/2024/08/BackOfHouse-495x400.jpg"],
  },
  {
    id: "1",
    name: "Suite Retreat",
    image: "/backcove-estate-primary.jpg",
    sleeps: 32,
    bedrooms: 9,
    bathrooms: 11,
    amenities: ["7 Suites", "2 Bunkrooms", "Bowling Alley", "Golf Simulator", "Pool & Spa", "Home Theater"],
    description:
      "A massive 14,000 sq ft luxury estate built for the ultimate group getaway. Features 7 private suites, 2 bunkrooms sleeping 12 each, an elevator, and a world-class entertainment wing with a bowling alley, golf simulator, and theater.",
    images: [
      "/backcove-estate-primary.jpg",
      "/PHOTOS FROM PHOTOGRAPHER/399 Backcove_website-05.jpg",
      "/PHOTOS FROM PHOTOGRAPHER/399 Backcove_website-06.jpg",
      "/PHOTOS FROM PHOTOGRAPHER/399 Backcove_website-09.jpg",
      "/PHOTOS FROM PHOTOGRAPHER/399 Backcove_website-10.jpg",
    ],
  },
  {
    id: "2",
    name: "Suite View",
    image: "/modern-lakefront-home-dock.jpg",
    sleeps: 28,
    bedrooms: 8,
    bathrooms: 9,
    amenities: ["7 Private Suites", "Large Bunkrooms", "Game Room", "Commercial Kitchen", "400ft Shoreline", "Spa", "Boat Dock"],
    description:
      "Over 13,000 square feet of vacation home living built for multifamily and large groups (28 person Capacity). Featuring 7 suites with attached bathrooms, large bunkrooms, and extensive indoor and outdoor entertainment areas including a spa and private dock.",
    images: ["/modern-lakefront-home-dock.jpg", "/luxury-bedroom-lake-view.jpg", "/outdoor-patio-fire-pit-lake.jpg"],
  },
  {
    id: "5",
    name: "Lake View",
    image: "https://wilson-premier.com/wp-content/uploads/2024/01/309-Living-Room-With-Patio-Lake-Views-1.jpg",
    sleeps: 6,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["Waterfront Views", "3D Tour", "Screened Decks", "Traeger Grill", "Swim Dock", "Wi-Fi"],
    description:
      "Beautiful 2-bedroom, 2-bath ground floor condo offering 1,040 sq ft of comfortable living space. Features stunning waterfront views, fully equipped kitchen, private decks, and access to a swim dock and boat docking.",
    images: ["https://wilson-premier.com/wp-content/uploads/2024/01/309-Living-Room-With-Patio-Lake-Views-1.jpg"],
    matterportUrl: "https://my.matterport.com/show/?m=vih9WU3PNQj"
  },
  {
    id: "7",
    name: "Penthouse View",
    image: "https://wilson-premier.com/wp-content/uploads/2024/01/313_GreatRoomFacingUpstairsKitchen-495x400.jpg",
    sleeps: 8,
    bedrooms: 3,
    bathrooms: 3,
    amenities: ["Penthouse Views", "3D Tour", "Traeger Grill", "Swim Dock", "Elevator", "Screened Decks"],
    description:
      "Stunning 3-bedroom penthouse condo featuring 1,453 sq ft of luxury living. Enjoy breathtaking long water views from private screened and open-air decks, a fully equipped gourmet kitchen, and direct access to swimming and fishing docks.",
    images: ["https://wilson-premier.com/wp-content/uploads/2024/01/313_GreatRoomFacingUpstairsKitchen-495x400.jpg"],
    matterportUrl: "https://my.matterport.com/show/?m=bRM4Kkhfu6T"
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
      <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className={`text-4xl md:text-5xl font-bold text-slate-900 mb-4 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              Signature Lakefront Homes
            </h2>
            <p
              className={`text-lg text-slate-600 max-w-2xl mx-auto transition-all duration-1000 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
