"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Users, ChevronLeft, ChevronRight } from "lucide-react"

import { Property } from "@/lib/data"
import { usePhotoOrder } from "./photo-order-context"

interface PropertyCardProps {
  property: Property
  onClick: () => void
  on3DClick?: (e: React.MouseEvent) => void
}

const MAX_PREVIEW_IMAGES = 8

export function PropertyCard({ property, onClick, on3DClick }: PropertyCardProps) {
  const { getOrderedImages } = usePhotoOrder()
  const previewImages = getOrderedImages(property).slice(0, MAX_PREVIEW_IMAGES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const swiping = useRef(false)

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === previewImages.length - 1 ? 0 : prev + 1))
  }, [previewImages.length])

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? previewImages.length - 1 : prev - 1))
  }, [previewImages.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    swiping.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
    const diff = Math.abs(touchStartX.current - touchEndX.current)
    if (diff > 20) swiping.current = true
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev === previewImages.length - 1 ? 0 : prev + 1))
      } else {
        setCurrentIndex((prev) => (prev === 0 ? previewImages.length - 1 : prev - 1))
      }
    }
  }

  const handleCardClick = () => {
    if (!swiping.current) onClick()
  }

  return (
    <Card
      className="group overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-card rounded-2xl relative"
      onClick={handleCardClick}
    >
      <div
        className="relative h-[500px] md:h-[650px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={previewImages[currentIndex] || property.image || "/placeholder.svg"}
          alt={`${property.name} - Image ${currentIndex + 1}`}
          fill
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105 sepia-[.15] brightness-[1.02] contrast-[1.05]"
          style={{ objectPosition: property.position || 'center' }}
        />

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

        {/* Carousel Navigation Arrows — visible on hover (desktop) */}
        {previewImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {previewImages.length > 1 && (
          <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {previewImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={`rounded-full transition-all ${
                  index === currentIndex
                    ? "w-2.5 h-2.5 bg-white shadow-md"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Gradient Overlay - Warm Charcoal/Navy for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/90 via-[#2B2B2B]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h3 className="text-3xl font-bold mb-3 text-balance font-serif">{property.name}</h3>

          <div className="flex items-center gap-3 text-sm md:text-base text-white/90 font-sans">
            <Users className="h-5 w-5 opacity-80" />
            <span className="font-medium">Sleeps {property.sleeps}</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>{property.bedrooms} Beds</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>{property.bathrooms} Baths</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
