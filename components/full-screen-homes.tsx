"use client"

import { useState, useRef } from "react"
import { PropertyPanel } from "./property-panel"
import { PropertyModal } from "./property-modal"
import { properties, Property } from "@/lib/data"

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
