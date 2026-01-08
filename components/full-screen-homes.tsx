"use client"

import { useState, useRef } from "react"
import { PropertyPanel } from "./property-panel"
import { PropertyModal } from "./property-modal"

interface Property {
  id: string
  name: string
  teaser: string
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
    teaser: "Unparalleled luxury with breathtaking panoramic lake views",
    image: "/luxury-lakefront-estate-sunset-view.jpg",
    sleeps: 36,
    bedrooms: 12,
    bathrooms: 10,
    amenities: ["Private Dock", "Infinity Pool", "Hot Tub", "Game Room", "Chef Kitchen"],
    description:
      "Experience unparalleled luxury at our crown jewel property. This magnificent estate offers breathtaking panoramic lake views, resort-style amenities, and spacious accommodations perfect for large family reunions and corporate retreats.",
    images: [
      "/luxury-lakefront-estate-sunset-view.jpg",
      "/modern-luxury-living-room-lake-view.jpg",
      "/gourmet-kitchen-marble-countertops.jpg",
    ],
  },
  {
    id: "2",
    name: "Sunset Shores Manor",
    teaser: "Modern elegance meets spectacular sunset views",
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
    teaser: "Charming waterfront escape with rustic elegance",
    image: "/cozy-lakefront-cabin-private-dock.jpg",
    sleeps: 16,
    bedrooms: 6,
    bathrooms: 5,
    amenities: ["Private Dock", "Hot Tub", "Kayaks", "BBQ Area", "Lake Access"],
    description:
      "Charming waterfront escape combining rustic elegance with modern comforts. Ideal for intimate family gatherings with direct lake access, water sports equipment, and peaceful surroundings.",
    images: [
      "/cozy-lakefront-cabin-private-dock.jpg",
      "/rustic-dining-room-wooden-beams.jpg",
      "/deck-with-hot-tub-lake-view.jpg",
    ],
  },
  {
    id: "4",
    name: "Blue Water Retreat",
    teaser: "Contemporary luxury with state-of-the-art amenities",
    image: "/contemporary-lake-house-boat-dock.jpg",
    sleeps: 20,
    bedrooms: 7,
    bathrooms: 6,
    amenities: ["Private Dock", "Pool & Hot Tub", "Theater Room", "Wine Cellar", "Gym"],
    description:
      "Contemporary luxury meets lakeside living in this architectural masterpiece. Features state-of-the-art entertainment spaces, fitness facilities, and premium outdoor living areas for the ultimate vacation experience.",
    images: [
      "/contemporary-lake-house-boat-dock.jpg",
      "/home-theater-room-luxury.jpg",
      "/infinity-pool-overlooking-lake.jpg",
    ],
  },
]

export default function FullScreenHomes() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const containerRef = useRef<HTMLElement>(null)

  return (
    <>
      <section id="homes" ref={containerRef} className="relative bg-slate-950">
        {properties.map((property, index) => (
          <PropertyPanel
            key={property.id}
            property={property}
            index={index}
            total={properties.length}
            onClick={() => setSelectedProperty(property)}
          />
        ))}
      </section>

      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </>
  )
}
