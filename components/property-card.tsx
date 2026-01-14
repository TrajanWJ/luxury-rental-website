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
      className="group overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white rounded-2xl relative"
      onClick={onClick}
    >
      <div className="relative h-[300px] md:h-[350px] overflow-hidden">
        <Image
          src={property.image || "/placeholder.svg"}
          alt={property.name}
          fill
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* 3D View Button Overlay */}
        {property.matterportUrl && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                on3DClick?.(e);
              }}
              className="bg-white/90 backdrop-blur-sm text-blue-600 px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-white transition-all transform hover:scale-110"
            >
              3D View
            </button>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2 text-balance">{property.name}</h3>

          <div className="flex items-center gap-2 text-sm text-white/90">
            <Users className="h-4 w-4" />
            <span className="font-medium">Sleeps {property.sleeps}</span>
            <span className="mx-2">•</span>
            <span>{property.bedrooms} Bedrooms</span>
            <span className="mx-2">•</span>
            <span>{property.bathrooms} Baths</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
