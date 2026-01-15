"use client"

import { useState, useRef } from "react"
import { PropertyPanel } from "./property-panel"
import { PropertyModal } from "./property-modal"
import { properties, Property } from "@/lib/data"

import { useDemo } from "@/components/demo-context"

export default function FullScreenHomes() {
  const { isDemoMode } = useDemo()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [startWith3D, setStartWith3D] = useState(false)
  const containerRef = useRef<HTMLElement>(null)

  // Filter properties based on Demo Mode
  // If Demo Mode is ON (isDemoMode = true): Show ALL properties
  // If Demo Mode is OFF (isDemoMode = false): Show ONLY properties with hostawayId
  const displayProperties = isDemoMode
    ? properties
    : properties.filter(p => !!p.hostawayId)

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
        {displayProperties.map((property, index) => (
          <PropertyPanel
            key={property.id}
            property={property}
            index={index}
            total={displayProperties.length}
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
