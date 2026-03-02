"use client"

import { useState, useRef } from "react"
import { PropertyPanel } from "./property-panel"
import { PropertyModal } from "./property-modal"
import { properties, Property } from "@/lib/data"

import { useDemo } from "@/components/demo-context"
import { useSiteConfig } from "@/components/site-config-context"

export default function FullScreenHomes() {
  const { isDemoMode } = useDemo()
  const { getPropertyConfig, getPropertyOrder } = useSiteConfig()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [startWith3D, setStartWith3D] = useState(false)
  const [startWithVideo, setStartWithVideo] = useState(false)
  const containerRef = useRef<HTMLElement>(null)

  // Filter properties based on Demo Mode and site config visibility
  const baseProperties = isDemoMode
    ? properties
    : properties.filter(p => !!p.hostawayId)

  // Apply site-config visibility (showOnHomepage)
  const visibleProperties = baseProperties.filter(p => {
    const cfg = getPropertyConfig(p.name.toLowerCase().replace(/\s+/g, "-"))
    return cfg.showOnHomepage !== false
  })

  // Apply site-config property order
  const propertyOrder = getPropertyOrder()
  const displayProperties = propertyOrder.length > 0
    ? propertyOrder
        .map(id => visibleProperties.find(p => p.id === id))
        .filter(Boolean)
        .concat(visibleProperties.filter(p => !propertyOrder.includes(p.id))) as Property[]
    : visibleProperties

  const handlePropertyClick = (property: Property) => {
    setStartWith3D(false)
    setStartWithVideo(false)
    setSelectedProperty(property)
  }

  const handle3DClick = (property: Property) => {
    setStartWith3D(true)
    setStartWithVideo(false)
    setSelectedProperty(property)
  }

  const handleVideoClick = (property: Property) => {
    setStartWithVideo(true)
    setStartWith3D(false)
    setSelectedProperty(property)
  }

  return (
    <>
      <section id="homes" ref={containerRef} className="relative bg-depth-linen border-t border-[var(--color-brand-taupe)]/20 pt-16">
        <div className="container mx-auto px-6 mb-12 text-center">
          <span className="brand-overline">Premier Lakefront Retreats</span>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-[var(--color-brand-charcoal)] mb-4">Available for Your Private Retreats and Stays</h2>
          <div className="h-0.5 w-12 bg-[var(--color-brand-rust)] mx-auto"></div>
        </div>
        {displayProperties.map((property, index) => (
          <div
            key={property.id}
            className={`sticky top-0 ${index === displayProperties.length - 1 ? "h-[100vh]" : "h-[135vh]"}`}
            style={{ zIndex: index + 1 }}
          >
            <PropertyPanel
              property={property}
              index={index}
              total={displayProperties.length}
              onClick={() => handlePropertyClick(property)}
              on3DClick={() => handle3DClick(property)}
              onVideoClick={() => handleVideoClick(property)}
            />
          </div>
        ))}
      </section>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          initialShow3D={startWith3D}
          initialShowVideo={startWithVideo}
        />
      )}
    </>
  )
}
