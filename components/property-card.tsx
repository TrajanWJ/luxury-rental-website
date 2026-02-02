"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"

import { Property } from "@/lib/data"

interface PropertyCardProps {
  property: Property
  onClick: () => void
  on3DClick?: (e: React.MouseEvent) => void
}

export function PropertyCard({ property, onClick, on3DClick }: PropertyCardProps) {
  return (
    <Card
      className="group overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-card rounded-2xl relative"
      onClick={onClick}
    >
      <div className="relative h-[500px] md:h-[650px] overflow-hidden">
        <Image
          src={property.image || "/placeholder.svg"}
          alt={property.name}
          fill
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105 sepia-[.15] brightness-[1.02] contrast-[1.05]"
        />

        {/* Sunset Filter for Milan Manor House */}


        {/* 3D View Button Overlay */}
        {property.matterportUrl && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                on3DClick?.(e);
              }}
              className="bg-black/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-medium tracking-wide border border-white/20 hover:bg-black/40 transition-all hover:scale-105"
            >
              3D View
            </button>
          </div>
        )}

        {/* Gradient Overlay - Warm Charcoal/Navy for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/90 via-[#2B2B2B]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h3 className="text-3xl font-bold mb-3 text-balance font-serif">{property.name}</h3>

          <div className="flex items-center gap-3 text-sm md:text-base text-white/90 font-sans">
            <Users className="h-5 w-5 opacity-80" />
            <span className="font-medium">Sleeps {property.sleeps}</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>{property.bedrooms} Bedrooms</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>{property.bathrooms} Baths</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
