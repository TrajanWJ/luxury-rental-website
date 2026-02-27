"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ChevronLeft, ChevronRight, Users, Bed, Bath, Anchor, DoorOpen, Hotel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useConcierge } from "./concierge-context"
import { usePhotoOrder } from "./photo-order-context"
import { usePopupFreeze } from "@/hooks/use-popup-freeze"

import { Property } from "@/lib/data"

interface PropertyModalProps {
  property: Property
  onClose: () => void
  initialShow3D?: boolean
  initialShowVideo?: boolean
}

export function PropertyModal({ property, onClose, initialShow3D = false, initialShowVideo = false }: PropertyModalProps) {
  usePopupFreeze(true)
  const { getOrderedImages } = usePhotoOrder()
  const orderedImages = getOrderedImages(property)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [show3DView, setShow3DView] = useState(initialShow3D)
  const [showVideoView, setShowVideoView] = useState(initialShowVideo)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false)
  const [showPhotoGrid, setShowPhotoGrid] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { openContactModal } = useConcierge()
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

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
    setCurrentImageIndex((prev) => (prev === orderedImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? orderedImages.length - 1 : prev - 1))
  }

  return (
    <div
      data-popup-root
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-white/98 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide animate-in zoom-in-95 duration-300 border border-white/20"
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
        <div
          className="relative h-[300px] md:h-[400px] bg-slate-100"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchMove={(e) => { touchEndX.current = e.touches[0].clientX }}
          onTouchEnd={() => {
            const diff = touchStartX.current - touchEndX.current
            if (Math.abs(diff) > 50) {
              if (diff > 0) nextImage()
              else prevImage()
            }
          }}
        >
          <Image
            src={orderedImages[currentImageIndex] || "/placeholder.svg"}
            alt={`${property.name} - Image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
          />

          {/* Sunset Filter for Milan Manor */}
          {property.name === "Milan Manor" && (
            <div className="absolute inset-0 bg-[#FFD700]/10 mix-blend-overlay pointer-events-none z-[5]" />
          )}

          {/* Gallery Navigation */}
          {orderedImages.length > 1 && (
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
                  {orderedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "rounded-full transition-all flex-shrink-0 bg-white/50 hover:bg-white/90",
                        index === currentImageIndex
                          ? orderedImages.length > 20
                            ? "w-2 h-2 md:w-2.5 md:h-2.5 bg-white"
                            : orderedImages.length > 10
                              ? "w-2 h-2 md:w-3 md:h-3 bg-white"
                              : "w-2.5 h-2.5 md:w-3 md:h-3 bg-white"
                          : orderedImages.length > 20
                            ? "w-1 h-1 md:w-1.5 md:h-1.5"
                            : orderedImages.length > 10
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-balance font-serif">{property.name}</h2>
            <button
              onClick={() => setShowPhotoGrid(true)}
              className="shrink-0 ml-4 px-4 py-2 rounded-full border border-[#9D5F36]/30 text-[#9D5F36] text-xs font-bold uppercase tracking-[0.12em] hover:bg-[#9D5F36]/8 transition-colors"
            >
              All Photos
            </button>
          </div>

          {/* Property Stats */}
          <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">{property.sleeps} Guests</span>
            </div>
            {property.name === "Suite Retreat" && (
              <>
                <div className="flex items-center gap-2 text-slate-700">
                  <DoorOpen className="h-5 w-5 text-primary" />
                  <span className="font-semibold">7 Suites</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Hotel className="h-5 w-5 text-primary" />
                  <span className="font-semibold">2 Bunk Rooms</span>
                </div>
              </>
            )}
            {property.name === "Suite View" && (
              <>
                <div className="flex items-center gap-2 text-slate-700">
                  <DoorOpen className="h-5 w-5 text-primary" />
                  <span className="font-semibold">8 Suites</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Hotel className="h-5 w-5 text-primary" />
                  <span className="font-semibold">1 Bunk Room</span>
                </div>
              </>
            )}
            {property.name === "Milan Manor" && (
              <div className="flex items-center gap-2 text-slate-700">
                <DoorOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">5 Bedrooms</span>
              </div>
            )}
            {property.name === "Penthouse View" && (
              <div className="flex items-center gap-2 text-slate-700">
                <DoorOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">3 Bedrooms</span>
              </div>
            )}
            {property.name === "Lake View" && (
              <div className="flex items-center gap-2 text-slate-700">
                <DoorOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">2 Bedrooms</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-700">
              <Bed className="h-5 w-5 text-primary" />
              <span className="font-semibold">{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Bath className="h-5 w-5 text-primary" />
              <span className="font-semibold">{property.bathrooms} Baths</span>
            </div>
            {property.amenities?.some((a: string) => a?.toLowerCase().includes('dock')) && (
              <div className="flex items-center gap-2 text-slate-700">
                <Anchor className="h-5 w-5 text-primary" />
                <span className="font-semibold">Private Dock</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className={cn(
              "text-slate-600 leading-relaxed",
              !descriptionExpanded && "line-clamp-3"
            )}>
              {property.description}
            </p>
            {property.description.length > 200 && (
              <button
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="text-primary hover:text-primary/80 text-sm font-medium mt-1.5 transition-colors"
              >
                {descriptionExpanded ? "Show less" : "Show more..."}
              </button>
            )}
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Featured Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {(amenitiesExpanded ? property.amenities : property.amenities.slice(0, 3)).map((amenity) => (
                <span key={amenity} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                  {amenity}
                </span>
              ))}
            </div>
            {property.amenities.length > 3 && (
              <button
                onClick={() => setAmenitiesExpanded(!amenitiesExpanded)}
                className="text-primary hover:text-primary/80 text-sm font-medium mt-2.5 transition-colors"
              >
                {amenitiesExpanded ? "Show less" : "..."}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 h-12 sm:h-12 py-0 leading-none rounded-xl border border-[#9D5F36] bg-[#9D5F36] hover:bg-[#874E2B] text-white shadow-sm hover:shadow-md transition-all font-semibold text-sm"
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
                className="flex-1 h-12 sm:h-12 py-0 leading-none rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md transition-all font-semibold text-sm"
                onClick={() => setShowVideoView(true)}
              >
                Video Preview
              </Button>
            )}
            {property.matterportUrl && (
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-12 sm:h-12 py-0 leading-none rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md transition-all font-semibold text-sm"
                onClick={() => setShow3DView(true)}
              >
                3D View
              </Button>
            )}
            <Link href={`/properties/${property.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex-1">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 sm:h-12 py-0 leading-none rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all bg-transparent font-semibold text-sm"
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
              className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9D5F36] border-[#9D5F36] hover:bg-[#9D5F36]/8 transition-colors"
            >
              Contact Concierge about this home
            </button>
          </div>
        </div>
      </div>

      {/* 3D View Modal Overlay */}
      {show3DView && property.matterportUrl && (
        <div data-popup-root className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
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
        <div data-popup-root className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
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

      {/* Photo Gallery Overlay */}
      {showPhotoGrid && (
        <div
          data-popup-root
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
          onClick={() => { setShowPhotoGrid(false); setLightboxIndex(null) }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 py-4 bg-black/80 backdrop-blur-md flex items-center justify-between">
            <h3 className="text-white font-serif text-lg">
              {property.name}
              <span className="text-white/40 font-sans text-sm ml-2">{orderedImages.length} photos</span>
            </h3>
            <button
              onClick={(e) => { e.stopPropagation(); setShowPhotoGrid(false); setLightboxIndex(null) }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Photo Grid */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {orderedImages.map((src, i) => (
              <button
                key={src}
                onClick={() => setLightboxIndex(i)}
                className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
              >
                <Image
                  src={src}
                  alt={`${property.name} photo ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>

          {/* Lightbox */}
          {lightboxIndex !== null && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null) }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(null) }}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                aria-label="Close lightbox"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Prev */}
              {orderedImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex(lightboxIndex === 0 ? orderedImages.length - 1 : lightboxIndex - 1)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Image */}
              <div className="relative max-w-[90vw] max-h-[85vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
                <Image
                  src={orderedImages[lightboxIndex]}
                  alt={`${property.name} photo ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Next */}
              {orderedImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex(lightboxIndex === orderedImages.length - 1 ? 0 : lightboxIndex + 1)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 rounded-full text-white/70 text-sm">
                {lightboxIndex + 1} / {orderedImages.length}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
