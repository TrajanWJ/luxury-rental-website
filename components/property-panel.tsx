"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"

import { BedDouble, Users, Bath, Anchor, Trees, Waves, DoorOpen, Hotel } from "lucide-react"

import { Property } from "@/lib/data"
import { usePhotoOrder } from "./photo-order-context"

interface PropertyPanelProps {
  property: Property
  index: number
  total: number
  onClick: () => void
  on3DClick?: (e: React.MouseEvent) => void
  onVideoClick?: (e: React.MouseEvent) => void
}

export function PropertyPanel({ property, index, total, onClick, on3DClick, onVideoClick }: PropertyPanelProps) {
  const container = useRef<HTMLDivElement>(null)
  const propertySlug = property.name.toLowerCase().replace(/\s+/g, "-")
  const { getHeroImage } = usePhotoOrder()
  const heroImage = getHeroImage(property)

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end start']
  })

  // Calculate scale based on index and scroll progress
  // As the section scrolls up, it scales down slightly
  // Disable scale/opacity animations for the last property
  const isLast = index === total - 1
  const scale = useTransform(scrollYProgress, [0, 1], isLast ? [1, 1] : [1, 0.9])
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], isLast ? [1, 1, 1] : [1, 1, 0.6])

  // Helper to pick a featured icon based on amenities or property specific features
  // Helper to pick featured icons
  const getFeaturedIcons = (prop: Property) => {
    const icons = []
    if (prop.amenities?.some((a: string) => a?.toLowerCase().includes('dock') || a?.toLowerCase().includes('shoreline'))) {
      icons.push({ icon: Anchor, label: "Private Dock" })
    }
    if (prop.amenities?.some((a: string) => a?.toLowerCase().includes('acre'))) {
      icons.push({ icon: Trees, label: "Acreage" })
    }
    if (prop.amenities?.some((a: string) => a?.toLowerCase().includes('view') || a?.toLowerCase().includes('waterfront'))) {
      icons.push({ icon: Waves, label: "Lake Views" })
    }
    return icons.slice(0, 2) // Limit to top 2 features
  }


  const features = getFeaturedIcons(property)

  return (
    <div
      ref={container}
      data-property-slug={propertySlug}
      className="h-screen w-full flex items-center justify-center sticky top-0 overflow-hidden"
    >
      <motion.div
        style={{
          scale,
          opacity,
          zIndex: index,
        }}
        className={`relative h-screen w-full overflow-hidden cursor-pointer group origin-center ${isLast ? "" : "shadow-2xl"}`}
        onClick={onClick}
      >
        {/* Background Image */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('${heroImage}')`,
            backgroundPosition: property.position || 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-slate-900/10" />
        </motion.div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center gap-[6vh] h-full">
          {/* Top group: Name + Teaser */}
          <div className="flex flex-col items-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-7xl font-bold text-white mb-6"
            >
              {property.name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-white/90 max-w-2xl font-light leading-relaxed"
            >
              {property.teaser}
            </motion.p>
          </div>

          {/* Bottom group: Buttons + Stats */}
          <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-5 items-center justify-center mb-8"
          >
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full w-[240px] h-[52px] text-lg shadow-lg hover:scale-105 transition-transform"
            >
              Explore {property.name}
            </Button>
            {property.videoUrl && (
              <Button
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onVideoClick?.(e);
                }}
                className="bg-white text-primary hover:bg-white/90 rounded-full w-[240px] h-[52px] text-lg shadow-lg hover:scale-105 transition-transform border-0"
              >
                Video Preview
              </Button>
            )}
            {property.matterportUrl && (
              <Button
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  on3DClick?.(e);
                }}
                className="bg-white text-primary hover:bg-white/90 rounded-full w-[240px] h-[52px] text-lg shadow-lg hover:scale-105 transition-transform border-0"
              >
                3D View
              </Button>
            )}
          </motion.div>

          {/* Stats Bar moved BELOW Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center gap-4 md:gap-8 text-white/90"
          >
            {/* Quick Stats Bar */}
            <div className="flex items-center flex-nowrap whitespace-nowrap bg-white/10 backdrop-blur-md py-2.5 md:py-3 rounded-full border border-white/20 shadow-lg gap-2 md:gap-5 px-3 md:px-6">
              <div className="flex items-center gap-1 md:gap-1.5">
                <Users className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                <span className="text-[11px] md:text-sm font-medium">{property.sleeps} Guests</span>
              </div>
              {property.name === "Suite Retreat" && (
                <>
                  <div className="w-px h-3 md:h-4 bg-white/20 shrink-0" />
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <DoorOpen className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                    <span className="text-[11px] md:text-xs font-medium">7 Suites</span>
                  </div>
                  <div className="w-px h-3 md:h-4 bg-white/20 shrink-0 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-1 md:gap-1.5">
                    <Hotel className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                    <span className="text-[11px] md:text-xs font-medium">2 Bunks</span>
                  </div>
                </>
              )}
              {property.name === "Suite View" && (
                <>
                  <div className="w-px h-3 md:h-4 bg-white/20 shrink-0" />
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <DoorOpen className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                    <span className="text-[11px] md:text-xs font-medium">8 Suites</span>
                  </div>
                  <div className="w-px h-3 md:h-4 bg-white/20 shrink-0 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-1 md:gap-1.5">
                    <Hotel className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                    <span className="text-[11px] md:text-xs font-medium">1 Bunk</span>
                  </div>
                </>
              )}
              {property.name === "Milan Manor" && (
                <>
                  <div className="w-px h-3 md:h-4 bg-white/20 shrink-0" />
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <DoorOpen className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                    <span className="text-[11px] md:text-xs font-medium">5 Beds</span>
                  </div>
                </>
              )}
              {property.name === "Penthouse View" && (
                <>
                  <div className="w-px h-3 md:h-4 bg-white/20 shrink-0" />
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <DoorOpen className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                    <span className="text-[11px] md:text-xs font-medium">3 Beds</span>
                  </div>
                </>
              )}
              {property.name === "Lake View" && (
                <>
                  <div className="w-px h-3 md:h-4 bg-white/20 shrink-0" />
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <DoorOpen className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                    <span className="text-[11px] md:text-xs font-medium">2 Beds</span>
                  </div>
                </>
              )}
              <div className="w-px h-3 md:h-4 bg-white/20 shrink-0" />
              <div className="flex items-center gap-1 md:gap-1.5">
                <BedDouble className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                <span className="text-[11px] md:text-sm font-medium">{property.bedrooms} Beds</span>
              </div>
              <div className="w-px h-3 md:h-4 bg-white/20 shrink-0" />
              <div className="flex items-center gap-1 md:gap-1.5">
                <Bath className="h-3 w-3 md:h-4 md:w-4 opacity-80 shrink-0" />
                <span className="text-[11px] md:text-sm font-medium">{property.bathrooms} Baths</span>
              </div>
            </div>

            {/* Special Feature Icons Bubble (Mobile hidden or stacked) */}
            {features.map((feat, i) => (
              <div key={i} className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-3 rounded-full border border-white/10">
                <feat.icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{feat.label}</span>
              </div>
            ))}

          </motion.div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
