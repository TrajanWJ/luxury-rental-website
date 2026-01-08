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
  position?: string
  matterportUrl?: string
}

const properties: Property[] = [
  {
    id: "6",
    name: "Milan Manor House",
    teaser: "Enchanting 1940s historic manor on 30 private acres",
    image: "https://wilson-premier.com/wp-content/uploads/2024/08/BackOfHouse-495x400.jpg",
    sleeps: 14,
    bedrooms: 5,
    bathrooms: 8,
    amenities: ["30 Private Acres", "Speakeasy Bar", "Pickleball Court", "Piano", "650ft Shoreline", "Historic Charm"],
    description:
      "Set your sights on a truly luxurious lake experience. Escape to an enchanting private manor on 30 acres of secluded beauty along Smith Mountain Lake. Immerse yourself in 1940s charm elegantly blended with midcentury modern style, offering bespoke surprises around every corner.",
    images: ["https://wilson-premier.com/wp-content/uploads/2024/08/BackOfHouse-495x400.jpg"],
  },
  {
    id: "1",
    name: "Suite Retreat",
    teaser: "14,000 sq ft ultimate entertainment estate for large groups",
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
    position: "center 70%",
  },
  {
    id: "2",
    name: "Suite View",
    teaser: "13,000+ sq ft of luxury for large groups and multifamily retreats",
    image: "/sunset-shores-manor-night.jpg",
    sleeps: 28,
    bedrooms: 8,
    bathrooms: 9,
    amenities: ["7 Private Suites", "Large Bunkrooms", "Game Room", "Commercial Kitchen", "400ft Shoreline", "Spa", "Boat Dock"],
    description:
      "Over 13,000 square feet of vacation home living built for multifamily and large groups (28 person Capacity). Featuring 7 suites with attached bathrooms, large bunkrooms, and extensive indoor and outdoor entertainment areas including a spa and private dock.",
    images: ["/sunset-shores-manor-night.jpg", "/luxury-bedroom-lake-view.jpg", "/outdoor-patio-fire-pit-lake.jpg"],
  },
  {
    id: "5",
    name: "Lake View",
    teaser: "Luxury 2-bedroom condo with stunning waterfront views and 3D tour",
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
  const [startWith3D, setStartWith3D] = useState(false)
  const containerRef = useRef<HTMLElement>(null)

  const handlePropertyClick = (property: Property) => {
    setStartWith3D(false)
    setSelectedProperty(property)
  }

  const handle3DClick = (property: Property) => {
    setStartWith3D(true)
    setSelectedProperty(property)
  }

  return (
    <>
      <section id="homes" ref={containerRef} className="relative bg-slate-950">
        {properties.map((property, index) => (
          <PropertyPanel
            key={property.id}
            property={property}
            index={index}
            total={properties.length}
            onClick={() => handlePropertyClick(property)}
            on3DClick={() => handle3DClick(property)}
          />
        ))}
      </section>

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
