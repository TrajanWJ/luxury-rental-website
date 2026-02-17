"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar as CalendarIcon, Users, ArrowRight, Check, Star, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import { Property, properties, isDateUnavailable } from "@/lib/data"
import Image from "next/image"
import { cn } from "@/lib/utils"
import HostawayCalendar from "./hostaway-calendar"
import { useBookingContext } from "@/hooks/use-booking-context"


// Helper to check if a range includes any booked dates
function checkAvailability(propertyId: string, from?: Date, to?: Date): boolean {
    if (!from || !to) return true

    const current = new Date(from)
    const end = new Date(to)

    while (current <= end) {
        if (isDateUnavailable(current, propertyId)) return false
        current.setDate(current.getDate() + 1)
    }
    return true
}

interface AdvancedBookingPopupProps {
    isOpen: boolean
    onClose: () => void
    initialView?: "search" | "results"
    searchParams?: {
        location: string
        checkIn: string
        checkOut: string
        guests: string
    }
}

import { useDemo } from "@/components/demo-context"

export function AdvancedBookingPopup({ isOpen, onClose, searchParams }: AdvancedBookingPopupProps) {
    const { isDemoMode } = useDemo()
    const globalContext = useBookingContext()

    const [matches, setMatches] = useState<Property[]>([])
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
    const [viewMode, setViewMode] = useState<"detail" | "alternatives">("detail")
    const [heroDescExpanded, setHeroDescExpanded] = useState(false)
    const [expandedTeasers, setExpandedTeasers] = useState<Record<string, boolean>>({})
    const router = useRouter()

    // Sync dates from global context (strings "YYYY-MM-DD")
    const from = globalContext.startDate ? new Date(globalContext.startDate + "T00:00:00") : undefined
    const to = globalContext.endDate ? new Date(globalContext.endDate + "T00:00:00") : undefined
    const dateRange = { from, to }

    // Filter properties based on Demo Mode
    const displayProperties = isDemoMode
        ? properties
        : properties.filter(p => !!p.hostawayId)

    // State for guests and UI
    const [guestCount, setGuestCount] = useState(1)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Reset image index and description expand when property changes
    useEffect(() => {
        setCurrentImageIndex(0)
        setHeroDescExpanded(false)
    }, [selectedProperty])

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (!selectedProperty) return
        setCurrentImageIndex((prev) => (prev === (selectedProperty.images?.length || 1) - 1 ? 0 : prev + 1))
    }

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (!selectedProperty) return
        setCurrentImageIndex((prev) => (prev === 0 ? (selectedProperty.images?.length || 1) - 1 : prev - 1))
    }

    // Determine current image source
    const currentImageSrc = selectedProperty ? (selectedProperty.images?.[currentImageIndex] || selectedProperty.image) : ""

    // Effect to calculate "matches" and parse dates when opened
    useEffect(() => {
        if (isOpen && searchParams) {
            const initialGuests = parseInt(searchParams.guests) || 1
            setGuestCount(initialGuests)

            // Parse dates and update global context if they came from search params
            if (searchParams.checkIn) {
                // If we have search params but global context is empty, or they differ, 
                // we should update the global context. For now, we assume search params 
                // were already piped into the context by the trigger.
            }

            // Filter by guests using valid display properties
            let validProps = displayProperties.filter(p => p.sleeps >= initialGuests)

            // Default to Suite Retreat if no location specified
            const targetLocation = (searchParams.location && searchParams.location !== "all")
                ? searchParams.location
                : "Suite Retreat";

            const precise = validProps.find(p => p.name === targetLocation)
            if (precise) {
                // Put chosen/default one first
                validProps = [precise, ...validProps.filter(p => p.id !== precise.id)]
            }

            setMatches(validProps)
            if (validProps.length > 0) {
                setSelectedProperty(validProps[0])
            }
        }
    }, [isOpen, searchParams])

    const nights = dateRange?.from && dateRange?.to
        ? Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
        : 0

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 0 }}
                        className="relative w-full max-w-6xl bg-white/90 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90dvh] md:h-[90vh]"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-20 rounded-full bg-black/5 hover:bg-black/10 text-slate-700 transition-all backdrop-blur-sm"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {/* LEFT PANEL: Visual Hero (Selected Property) */}
                        <div className="w-full md:w-3/5 relative bg-slate-100 shrink-0 h-auto aspect-[4/3] md:aspect-auto md:h-full overflow-hidden group">
                            {selectedProperty ? (
                                <>
                                    <div className="absolute inset-0">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentImageSrc}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="absolute inset-0"
                                            >
                                                <Image
                                                    src={currentImageSrc}
                                                    alt={selectedProperty.name}
                                                    fill
                                                    className="object-cover opacity-100"
                                                    priority
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                                    </div>

                                    {/* Navigation Arrows */}
                                    {(selectedProperty.images?.length || 0) > 1 && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-white/20"
                                            >
                                                <ArrowRight className="h-6 w-6 rotate-180" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-white/20"
                                            >
                                                <ArrowRight className="h-6 w-6" />
                                            </Button>
                                        </>
                                    )}

                                    {/* Text Info */}
                                    <div className="absolute bottom-4 left-0 px-6 md:bottom-32 md:px-8 text-white w-full z-10 pointer-events-none">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium mb-2 md:mb-3 shadow-lg">
                                            <Star className="h-3 w-3 fill-white" /> Top Match
                                        </div>
                                        <h2 className="text-2xl md:text-5xl font-bold mb-1 md:mb-2 text-shadow-sm font-serif">{selectedProperty.name}</h2>
                                        <p className={`text-sm md:text-lg text-white/90 max-w-xl font-light hidden md:block ${heroDescExpanded ? "" : "line-clamp-2"}`}>{selectedProperty.teaser || selectedProperty.description}</p>
                                        {!heroDescExpanded && (
                                            <button onClick={() => setHeroDescExpanded(true)} className="pointer-events-auto text-xs text-white/80 font-medium mt-1 hover:text-white hidden md:inline-block underline underline-offset-2">
                                                Show more...
                                            </button>
                                        )}
                                        {heroDescExpanded && (
                                            <button onClick={() => setHeroDescExpanded(false)} className="pointer-events-auto text-xs text-white/80 font-medium mt-1 hover:text-white hidden md:inline-block underline underline-offset-2">
                                                Show less
                                            </button>
                                        )}

                                        <div className="flex gap-4 md:gap-6 mt-2 md:mt-4">
                                            <div className="flex items-center gap-1.5 md:gap-2">
                                                <Users className="h-4 w-4 md:h-5 md:w-5 text-white/90" />
                                                <span className="text-xs md:text-base font-medium text-white/90">{selectedProperty.sleeps} Guests</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 md:gap-2">
                                                <Info className="h-4 w-4 md:h-5 md:w-5 text-white/90" />
                                                <span className="text-xs md:text-base font-medium text-white/90">{selectedProperty.bedrooms} Bedrooms</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Link to Property Modal Dots Style - Positioned lower on mobile */}
                                    <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[200px] px-4 z-20">
                                        <div className="flex gap-1.5 overflow-x-auto pb-2 justify-center scrollbar-hide mask-linear-fade">
                                            {selectedProperty.images?.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                                                    className={cn(
                                                        "rounded-full transition-all flex-shrink-0 bg-white/30 hover:bg-white/60",
                                                        index === currentImageIndex
                                                            ? (selectedProperty.images?.length || 0) > 20
                                                                ? "w-2 h-2 md:w-2.5 md:h-2.5 bg-white"
                                                                : (selectedProperty.images?.length || 0) > 10
                                                                    ? "w-2 h-2 md:w-3 md:h-3 bg-white"
                                                                    : "w-2.5 h-2.5 md:w-3 md:h-3 bg-white"
                                                            : (selectedProperty.images?.length || 0) > 20
                                                                ? "w-1 h-1 md:w-1.5 md:h-1.5"
                                                                : (selectedProperty.images?.length || 0) > 10
                                                                    ? "w-1.5 h-1.5 md:w-2 md:h-2"
                                                                    : "w-1.5 h-1.5 md:w-2 md:h-2"
                                                    )}
                                                    aria-label={`Go to image ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* New Action Buttons - Desktop Only */}
                                    <div className="hidden md:flex absolute bottom-20 left-8 right-8 z-30 gap-3">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Navigate to internal property page
                                                router.push(`/properties/${selectedProperty.id}`);
                                            }}
                                            variant="outline"
                                            className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md border"
                                        >
                                            View Full Info
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = `https://wilson-premier.holidayfuture.com/listings/${selectedProperty.hostawayId}`;
                                                window.open(url, '_blank');
                                            }}
                                            className="flex-1 bg-primary/90 hover:bg-primary text-white shadow-lg backdrop-blur-md font-semibold border border-white/20"
                                        >
                                            Booking Page
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    No exact matches found.
                                </div>
                            )}
                        </div>

                        {/* RIGHT PANEL: Intelligence & Composer */}
                        <div className="w-full md:w-2/5 flex flex-col h-full bg-white/60 backdrop-blur-2xl min-h-0 border-l border-white/40">
                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent overscroll-contain pb-32 md:pb-0">
                                <div className="p-6 md:p-8">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                        Availability & Options
                                    </h3>

                                    {/* 1. Functional Calendar */}
                                    {/* 1. Hostaway Calendar Widget */}
                                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm overflow-hidden pb-4 flex flex-col items-center shadow-sm">
                                        {selectedProperty?.hostawayId ? (
                                            <HostawayCalendar key={selectedProperty.hostawayId} listingId={selectedProperty.hostawayId} />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                                                <CalendarIcon className="h-8 w-8 mb-2 opacity-20" />
                                                <p>Calendar unavailable for this property</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Guests Selection */}
                                    <div className="mb-8 p-1 rounded-2xl bg-white/50 border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                                            <div className="h-12 w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-primary shadow-sm">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-800 tracking-tight">Number of Guests</p>
                                                <p className="text-[11px] text-slate-500 font-medium">Includes adults & children</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                                                <button
                                                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-semibold w-6 text-center text-slate-800">{guestCount}</span>
                                                <button
                                                    onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                                                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Alternative Options (Mini List) */}
                                    <div className="space-y-4 pb-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Our Homes</label>
                                                <span className="text-xs text-slate-400">{matches.length} found</span>
                                            </div>
                                            <div className="space-y-3">
                                                {/* Render All Properties */}
                                                {matches.map(prop => (
                                                    <button
                                                        key={prop.id}
                                                        onClick={() => setSelectedProperty(prop)}
                                                        className={cn(
                                                            "flex gap-4 p-3 rounded-2xl transition-all duration-200 w-full text-left group border relative overflow-hidden",
                                                            selectedProperty?.id === prop.id
                                                                ? "bg-blue-50/80 border-blue-200 shadow-sm ring-1 ring-blue-100"
                                                                : "bg-white/40 border-transparent hover:border-slate-200 hover:bg-white/60"
                                                        )}
                                                    >
                                                        <div className="relative h-20 w-24 rounded-xl overflow-hidden shrink-0 shadow-sm group-hover:shadow transition-all">
                                                            <Image src={prop.image} alt={prop.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                                        </div>
                                                        <div className="flex-1 py-1">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className={cn(
                                                                    "font-bold text-base transition-colors line-clamp-1",
                                                                    selectedProperty?.id === prop.id ? "text-primary font-bold" : "text-slate-800 group-hover:text-primary"
                                                                )}>{prop.name}</h4>
                                                                {selectedProperty?.id === prop.id && (
                                                                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm -mr-1 -mt-1">
                                                                        <Check className="h-3 w-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className={`text-xs text-slate-500 mt-1 mb-2 ${expandedTeasers[prop.id] ? "" : "line-clamp-2"}`}>{prop.teaser || prop.description}</p>
                                                            {!expandedTeasers[prop.id] ? (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setExpandedTeasers(prev => ({ ...prev, [prop.id]: true })) }}
                                                                    className="text-[10px] text-[#9D5F36] font-medium hover:underline -mt-1 mb-1"
                                                                >
                                                                    Show more...
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setExpandedTeasers(prev => ({ ...prev, [prop.id]: false })) }}
                                                                    className="text-[10px] text-[#9D5F36] font-medium hover:underline -mt-1 mb-1"
                                                                >
                                                                    Show less
                                                                </button>
                                                            )}
                                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {prop.sleeps}</span>
                                                                <span className="flex items-center gap-1"><Info className="h-3 w-3" /> {prop.bedrooms} Bedrooms</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer - Always Visible */}
                            <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-xl shadow-lg">
                                <div className="flex gap-3">

                                    <Button
                                        disabled={!selectedProperty}
                                        className="flex-1 md:flex-[2] h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg font-bold disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                                        onClick={() => {
                                            if (selectedProperty?.hostawayId) {
                                                let url = `https://wilson-premier.holidayfuture.com/checkout/${selectedProperty.hostawayId}`;

                                                if (globalContext.startDate && globalContext.endDate) {
                                                    // Ensure we have correct ISO format YYYY-MM-DD for the link
                                                    const formatToISO = (dateStr: string) => {
                                                        const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
                                                        if (isNaN(d.getTime())) return dateStr; // Fallback if parsing fails
                                                        const y = d.getFullYear();
                                                        const m = String(d.getMonth() + 1).padStart(2, '0');
                                                        const day = String(d.getDate()).padStart(2, '0');
                                                        return `${y}-${m}-${day}`;
                                                    };

                                                    const start = formatToISO(globalContext.startDate);
                                                    const end = formatToISO(globalContext.endDate);
                                                    url += `?start=${start}&end=${end}&numberOfGuests=${guestCount}`;
                                                }

                                                window.open(url, '_blank');
                                            }
                                        }}
                                    >
                                        {!selectedProperty ? "Choose Home" : "Book Now"}
                                    </Button>
                                </div>
                                <p className="text-center text-[10px] text-slate-400 mt-3">
                                    Free cancellation up to 48 hours before check-in.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
