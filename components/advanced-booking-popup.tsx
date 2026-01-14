"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar as CalendarIcon, Users, ArrowRight, Check, Star, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { Property, properties, getMockAvailability, isDateUnavailable } from "@/lib/data"
import { format, addDays, getDay, isSameDay } from "date-fns"
import Image from "next/image"
import { cn } from "@/lib/utils"


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

export function AdvancedBookingPopup({ isOpen, onClose, searchParams }: AdvancedBookingPopupProps) {
    const [matches, setMatches] = useState<Property[]>([])
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
    const [viewMode, setViewMode] = useState<"detail" | "alternatives">("detail")
    const router = useRouter()
    // State for dates
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [guestCount, setGuestCount] = useState(1)
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Reset image index when property changes
    useEffect(() => {
        setCurrentImageIndex(0)
    }, [selectedProperty])

    // Prevent body scroll when popup is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    // Auto-collapse calendar when dates are selected
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const timer = setTimeout(() => setIsCalendarExpanded(false), 800)
            return () => clearTimeout(timer)
        }
    }, [dateRange])

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

            // Parse dates
            if (searchParams.checkIn) {
                // handle "YYYY-MM-DD" parsing safely since new Date() can be finicky with hyphens in some browsers/locales
                // but standard ISO "YYYY-MM-DD" usually works. Let's assume standard format from widget.
                const from = new Date(searchParams.checkIn + "T00:00:00") // Force local time to avoid timezone shifts
                const to = searchParams.checkOut ? new Date(searchParams.checkOut + "T00:00:00") : undefined
                setDateRange({ from, to })
            }

            // Filter by guests
            let validProps = properties.filter(p => p.sleeps >= initialGuests)

            // If location specific
            if (searchParams.location && searchParams.location !== "all") {
                const precise = validProps.find(p => p.name === searchParams.location)
                if (precise) {
                    // Put chosen one first
                    validProps = [precise, ...validProps.filter(p => p.id !== precise.id)]
                }
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
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-6xl bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-20 rounded-full bg-black/10 hover:bg-black/20 text-white md:text-slate-700 md:bg-white/50 md:hover:bg-white/80 transition-all backdrop-blur-sm"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {/* LEFT PANEL: Visual Hero (Selected Property) */}
                        {/* LEFT PANEL: Visual Carousel (Selected Property) */}
                        <div className="w-full md:w-3/5 relative bg-slate-900 h-[40vh] md:h-full overflow-hidden group">
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
                                                    className="object-cover opacity-90"
                                                    priority
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-80" />
                                    </div>

                                    {/* Navigation Arrows */}
                                    {(selectedProperty.images?.length || 0) > 1 && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                            >
                                                <ArrowRight className="h-6 w-6 rotate-180" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                            >
                                                <ArrowRight className="h-6 w-6" />
                                            </Button>
                                        </>
                                    )}

                                    {/* Text Info */}
                                    <div className="absolute bottom-32 left-0 px-8 text-white w-full z-10 pointer-events-none">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/80 backdrop-blur-sm text-xs font-medium mb-3 shadow-lg shadow-blue-900/20">
                                            <Star className="h-3 w-3 fill-white" /> Top Match
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-bold mb-2 text-shadow-sm">{selectedProperty.name}</h2>
                                        <p className="text-lg text-white/90 line-clamp-2 max-w-xl font-light">{selectedProperty.teaser || selectedProperty.description}</p>

                                        <div className="flex gap-6 mt-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-blue-400" />
                                                <span className="font-medium text-white/90">{selectedProperty.sleeps} Guests</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Info className="h-5 w-5 text-blue-400" />
                                                <span className="font-medium text-white/90">{selectedProperty.bedrooms} Bedrooms</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Link to Property Modal Dots Style */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[200px] px-4 z-20">
                                        <div className="flex gap-1.5 overflow-x-auto pb-2 justify-start md:justify-center scrollbar-hide mask-linear-fade">
                                            {selectedProperty.images?.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                                                    className={cn(
                                                        "rounded-full transition-all flex-shrink-0 bg-white/50 hover:bg-white/80",
                                                        index === currentImageIndex ? "w-2.5 h-2.5 bg-white" : "w-1.5 h-1.5"
                                                    )}
                                                    aria-label={`Go to image ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* New Action Buttons */}
                                    <div className="absolute bottom-20 left-8 right-8 z-30 flex gap-3">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Navigate to internal property page
                                                router.push(`/properties/${selectedProperty.id}`);
                                            }}
                                            variant="outline"
                                            className="flex-1 bg-white/10 border-white/40 text-white hover:bg-white/20 backdrop-blur-md border"
                                        >
                                            View Full Info
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (selectedProperty) {
                                                    const params = new URLSearchParams({
                                                        property: selectedProperty.name,
                                                        checkIn: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
                                                        checkOut: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
                                                        guests: guestCount.toString()
                                                    })
                                                    router.push(`/book?${params.toString()}`)
                                                }
                                            }}
                                            className="flex-1 bg-white text-slate-900 hover:bg-slate-100"
                                        >
                                            Book Now
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-white/50">
                                    No exact matches found.
                                </div>
                            )}
                        </div>

                        {/* RIGHT PANEL: Intelligence & Composer */}
                        <div className="w-full md:w-2/5 flex flex-col h-full bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain min-h-0">
                            <div className="p-6 md:p-8 flex-1">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                                    Availability & Options
                                </h3>

                                {/* 1. Functional Calendar */}
                                {/* 1. Functional Collapsible Calendar */}
                                <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden transition-all duration-300">
                                    <button
                                        onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className="text-left flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <CalendarIcon className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Dates</label>
                                                <span className="text-sm font-semibold text-slate-900 block">
                                                    {dateRange?.from ? format(dateRange.from, "MMM dd") : "Check-in"} — {dateRange?.to ? format(dateRange.to, "MMM dd") : "Check-out"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cn("transition-transform duration-300 text-slate-300 group-hover:text-slate-500", isCalendarExpanded ? "rotate-90" : "rotate-0")}>
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </button>

                                    <AnimatePresence initial={false} mode="wait">
                                        {isCalendarExpanded && (
                                            <motion.div
                                                key="calendar-expand"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="overflow-hidden will-change-[height,opacity]"
                                            >
                                                <div className="p-4 pt-0 border-t border-slate-100">
                                                    <Calendar
                                                        key={selectedProperty?.id || "default"}
                                                        mode="range"
                                                        selected={dateRange}
                                                        onSelect={setDateRange}
                                                        numberOfMonths={1}
                                                        disabled={(date) => {
                                                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                                                            const isBooked = isDateUnavailable(date, selectedProperty?.id || "")
                                                            return isPast || isBooked
                                                        }}
                                                        modifiers={{ today: undefined }}
                                                        modifiersClassNames={{ today: "" }}
                                                        className="rounded-md border bg-white w-full flex justify-center p-2 mb-3 shadow-sm pointer-events-auto mt-4"
                                                    />
                                                    <p className="text-xs text-slate-400 text-center">
                                                        Select start and end dates to update quote
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {!isCalendarExpanded && (
                                        <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between bg-white">
                                            <span className="text-xs font-medium text-slate-500">Total Stay</span>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {nights > 0 ? `${nights} Nights` : "-"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Guests Selection */}
                                <div className="mb-8">
                                    <label className="text-xs font-semibold uppercase text-slate-500 mb-3 block">Travelers</label>
                                    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                                        <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900">Number of Guests</p>
                                            <p className="text-xs text-slate-500">Includes adults & children</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                                            <button
                                                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="text-sm font-semibold w-6 text-center">{guestCount}</span>
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
                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Residences</label>
                                            <span className="text-xs text-slate-400">{matches.length} found</span>
                                        </div>
                                        <div className="space-y-3 pb-4">
                                            {/* Render Available Properties */}
                                            {matches
                                                .filter(p => checkAvailability(p.id, dateRange?.from, dateRange?.to))
                                                .map(prop => (
                                                    <button
                                                        key={prop.id}
                                                        onClick={() => setSelectedProperty(prop)}
                                                        className={cn(
                                                            "flex gap-4 p-3 rounded-2xl transition-all duration-200 w-full text-left group border relative overflow-hidden",
                                                            selectedProperty?.id === prop.id
                                                                ? "bg-blue-50/80 border-blue-200 shadow-sm ring-1 ring-blue-100"
                                                                : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <div className="relative h-20 w-24 rounded-xl overflow-hidden shrink-0 shadow-sm group-hover:shadow transition-all">
                                                            <Image src={prop.image} alt={prop.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                                        </div>
                                                        <div className="flex-1 py-1">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className={cn(
                                                                    "font-bold text-base transition-colors line-clamp-1",
                                                                    selectedProperty?.id === prop.id ? "text-blue-700" : "text-slate-900 group-hover:text-blue-600"
                                                                )}>{prop.name}</h4>
                                                                {selectedProperty?.id === prop.id && (
                                                                    <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center shadow-sm -mr-1 -mt-1">
                                                                        <Check className="h-3 w-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 line-clamp-1 mt-1 mb-2">{prop.teaser || prop.description}</p>
                                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {prop.sleeps}</span>
                                                                <span className="flex items-center gap-1"><Info className="h-3 w-3" /> {prop.bedrooms} BD</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}

                                            {/* Render Unavailable Properties */}
                                            {matches
                                                .filter(p => !checkAvailability(p.id, dateRange?.from, dateRange?.to))
                                                .length > 0 && (
                                                    <>
                                                        <div className="pt-4 pb-2">
                                                            <div className="h-px bg-slate-100 w-full" />
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mt-4">
                                                                Not available on these dates
                                                            </p>
                                                        </div>
                                                        {matches
                                                            .filter(p => !checkAvailability(p.id, dateRange?.from, dateRange?.to))
                                                            .map(prop => (
                                                                <button
                                                                    key={prop.id}
                                                                    onClick={() => setSelectedProperty(prop)}
                                                                    className={cn(
                                                                        "flex gap-4 p-3 rounded-2xl w-full text-left border relative overflow-hidden transition-all",
                                                                        selectedProperty?.id === prop.id
                                                                            ? "bg-slate-100 border-slate-300 ring-1 ring-slate-200" // selected state for unavailable
                                                                            : "bg-slate-50 border-slate-100 opacity-60 hover:opacity-80" // default unavailable state
                                                                    )}
                                                                >
                                                                    <div className="relative h-20 w-24 rounded-xl overflow-hidden shrink-0 shadow-sm opacity-80 grayscale">
                                                                        <Image src={prop.image} alt={prop.name} fill className="object-cover" />
                                                                    </div>
                                                                    <div className="flex-1 py-1 grayscale opacity-70">
                                                                        <div className="flex justify-between items-start">
                                                                            <h4 className="font-bold text-base text-slate-500 line-through decoration-slate-400">{prop.name}</h4>
                                                                            {selectedProperty?.id === prop.id && (
                                                                                <div className="h-5 w-5 rounded-full bg-slate-400 flex items-center justify-center shadow-sm -mr-1 -mt-1">
                                                                                    <Check className="h-3 w-3 text-white" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-slate-400 line-clamp-1 mt-1 mb-2">{prop.teaser || prop.description}</p>
                                                                        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                                                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {prop.sleeps}</span>
                                                                            <span className="flex items-center gap-1"><Info className="h-3 w-3" /> {prop.bedrooms} BD</span>
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                                    >
                                        Share Quote
                                    </Button>
                                    <Button
                                        disabled={!selectedProperty || !checkAvailability(selectedProperty.id, dateRange?.from, dateRange?.to)}
                                        className="flex-1 md:flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                                    >
                                        {!selectedProperty || !checkAvailability(selectedProperty.id, dateRange?.from, dateRange?.to) ? "Dates Unavailable" : "Proceed to Booking"}
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
