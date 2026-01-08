"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Users, Bed, Bath, Anchor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
}

interface PropertyModalProps {
  property: Property
  onClose: () => void
}

export function PropertyModal({ property, onClose }: PropertyModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-slate-700" />
        </button>

        {/* Image Gallery */}
        <div className="relative h-[300px] md:h-[400px] bg-slate-100">
          <Image
            src={property.images[currentImageIndex] || "/placeholder.svg"}
            alt={`${property.name} - Image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
          />

          {/* Gallery Navigation */}
          {property.images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentImageIndex ? "bg-white w-8" : "bg-white/60 hover:bg-white/80",
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">{property.name}</h2>

          {/* Property Stats */}
          <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Sleeps {property.sleeps}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Bed className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">{property.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Bath className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Anchor className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Private Dock</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-600 leading-relaxed mb-6">{property.description}</p>

          {/* Amenities */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Featured Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <span key={amenity} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Book This Home
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-all bg-transparent"
            >
              View Full Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
