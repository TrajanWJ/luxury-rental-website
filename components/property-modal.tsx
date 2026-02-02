"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ChevronLeft, ChevronRight, Users, Bed, Bath, Anchor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useConcierge } from "./concierge-context"

import { Property } from "@/lib/data"

interface PropertyModalProps {
  property: Property
  onClose: () => void
  initialShow3D?: boolean
  initialShowVideo?: boolean
}

export function PropertyModal({ property, onClose, initialShow3D = false, initialShowVideo = false }: PropertyModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [show3DView, setShow3DView] = useState(initialShow3D)
  const [showVideoView, setShowVideoView] = useState(initialShowVideo)
  const { openContactModal } = useConcierge()

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
        className="relative bg-white/98 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/5 hover:bg-black/10 backdrop-blur-sm rounded-full shadow-lg text-slate-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image Gallery */}
        <div className="relative h-[300px] md:h-[400px] bg-slate-100">
          <Image
            src={property.images[currentImageIndex] || "/placeholder.svg"}
            alt={`${property.name} - Image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
          />

          {/* Sunset Filter for Milan Manor House */}
          {property.name === "Milan Manor House" && (
            <div className="absolute inset-0 bg-[#FFD700]/10 mix-blend-overlay pointer-events-none z-[5]" />
          )}

          {/* Gallery Navigation */}
          {property.images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:bg-white h-8 w-8"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:bg-white h-8 w-8"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[200px] px-4">
                <div className="flex gap-1.5 overflow-x-auto pb-2 justify-start md:justify-center scrollbar-hide mask-linear-fade">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "rounded-full transition-all flex-shrink-0 bg-white/50 hover:bg-white/90",
                        index === currentImageIndex
                          ? property.images.length > 20
                            ? "w-2 h-2 md:w-2.5 md:h-2.5 bg-white"
                            : property.images.length > 10
                              ? "w-2 h-2 md:w-3 md:h-3 bg-white"
                              : "w-2.5 h-2.5 md:w-3 md:h-3 bg-white"
                          : property.images.length > 20
                            ? "w-1 h-1 md:w-1.5 md:h-1.5"
                            : property.images.length > 10
                              ? "w-1.5 h-1.5 md:w-2 md:h-2"
                              : "w-1.5 h-1.5 md:w-2 md:h-2"
                      )}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 text-balance font-serif">{property.name}</h2>

          {/* Property Stats */}
          <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sleeps {property.sleeps}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Bed className="h-5 w-5 text-primary" />
              <span className="font-semibold">{property.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Bath className="h-5 w-5 text-primary" />
              <span className="font-semibold">{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Anchor className="h-5 w-5 text-primary" />
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
                <span key={amenity} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-booking", { detail: { propertyName: property.name } }))
                onClose()
              }}
            >
              Book This Home
            </Button>
            {property.videoUrl && (
              <Button
                size="lg"
                variant="outline"
                className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold"
                onClick={() => setShowVideoView(true)}
              >
                Video Preview
              </Button>
            )}
            {property.matterportUrl && (
              <Button
                size="lg"
                variant="outline"
                className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold"
                onClick={() => setShow3DView(true)}
              >
                3D View
              </Button>
            )}
            <Link href={`/properties/${property.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex-1">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all bg-transparent"
              >
                View Full Details
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                onClose()
                setTimeout(() => openContactModal(property.name), 300)
              }}
              className="text-xs font-bold uppercase tracking-[0.2em] text-[#BCA28A] hover:text-[#9D5F36] transition-colors"
            >
              Contact Concierge about this home
            </button>
          </div>
        </div>
      </div>

      {/* 3D View Modal Overlay */}
      {show3DView && property.matterportUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setShow3DView(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
              aria-label="Close 3D view"
            >
              <X className="h-6 w-6" />
            </button>
            <iframe
              width="100%"
              height="100%"
              src={property.matterportUrl}
              frameBorder="0"
              allowFullScreen
              allow="xr-spatial-tracking"
            ></iframe>
          </div>
        </div>
      )}

      {/* Video View Modal Overlay */}
      {showVideoView && property.videoUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setShowVideoView(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
              aria-label="Close video view"
            >
              <X className="h-6 w-6" />
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${property.videoUrl.split('v=')[1]?.slice(0, 11)}?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  )
}
