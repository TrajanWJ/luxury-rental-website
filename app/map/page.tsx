"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import Navigation from "@/components/navigation"
import { properties, Property, isDateUnavailable } from "@/lib/data"
import { Search, Users, Bed, Bath, Calendar, Sparkles, Mountain, Waves, TreePine, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PropertyModal } from "@/components/property-modal"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

// Dynamically import map to avoid SSR issues
const MapView = dynamic(() => import("@/components/map-view"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full bg-slate-900 text-white">Loading map...</div>
})

type ExperienceMode = "all" | "lake-views" | "quiet-retreat" | "near-activities"

// Helper to check if a property is available for date range
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

export default function MapPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeMarker, setActiveMarker] = useState<Property | null>(null)
    const [modalProperty, setModalProperty] = useState<Property | null>(null)
    const [experienceMode, setExperienceMode] = useState<ExperienceMode>("all")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [stayLength, setStayLength] = useState(3)

    const filteredAndSortedProperties = useMemo(() => {
        let filtered = properties.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.teaser.toLowerCase().includes(searchQuery.toLowerCase())
        )

        // Experience mode filtering
        if (experienceMode === "lake-views") {
            filtered = filtered.filter(p => p.amenities.some(a => a.toLowerCase().includes("shoreline") || a.toLowerCase().includes("dock")))
        } else if (experienceMode === "quiet-retreat") {
            filtered = filtered.filter(p => p.amenities.some(a => a.toLowerCase().includes("private") || a.toLowerCase().includes("acres")))
        } else if (experienceMode === "near-activities") {
            filtered = filtered.filter(p => p.amenities.some(a => a.toLowerCase().includes("golf") || a.toLowerCase().includes("bowling") || a.toLowerCase().includes("theater")))
        }

        // Sort by availability - available first, unavailable last
        if (dateRange?.from && dateRange?.to) {
            filtered.sort((a, b) => {
                const aAvailable = checkAvailability(a.id, dateRange.from, dateRange.to)
                const bAvailable = checkAvailability(b.id, dateRange.from, dateRange.to)
                if (aAvailable && !bAvailable) return -1
                if (!aAvailable && bAvailable) return 1
                return 0
            })
        }

        return filtered
    }, [searchQuery, experienceMode, dateRange])

    const availableCount = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return filteredAndSortedProperties.length
        return filteredAndSortedProperties.filter(p => checkAvailability(p.id, dateRange.from, dateRange.to)).length
    }, [filteredAndSortedProperties, dateRange])

    const handlePropertyClick = (property: Property) => {
        setActiveMarker(property)
    }

    const experienceModes = [
        { id: "all" as const, label: "All", icon: Sparkles },
        { id: "lake-views" as const, label: "Lake Views", icon: Waves },
        { id: "quiet-retreat" as const, label: "Quiet", icon: Mountain },
        { id: "near-activities" as const, label: "Activities", icon: TreePine },
    ]

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            <Navigation />

            <div className="flex flex-1 pt-20 overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-full md:w-[450px] lg:w-[500px] flex flex-col border-r border-white/10 bg-slate-900/50 backdrop-blur-xl">
                    {/* Header */}
                    <div className="p-6 space-y-4 border-b border-white/10 bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-white">Explore Properties</h1>
                                <p className="text-white/60 text-xs mt-1">
                                    {availableCount} of {filteredAndSortedProperties.length} available
                                    {dateRange?.from && dateRange?.to && " for selected dates"}
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                            <Input
                                placeholder="Search properties..."
                                className="pl-11 h-12 bg-white/8 backdrop-blur-lg border border-white/15 text-white placeholder:text-white/60 rounded-xl focus:border-white/40 focus:ring-0 shadow-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Date Range Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full h-12 justify-start text-left font-normal bg-white/8 backdrop-blur-lg border-white/15 text-white hover:bg-white/10 hover:text-white rounded-xl",
                                        !dateRange && "text-white/60"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "MMM dd")
                                        )
                                    ) : (
                                        <span>Select dates</span>
                                    )}
                                    {dateRange?.from && (
                                        <X
                                            className="ml-auto h-4 w-4 hover:text-white"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDateRange(undefined)
                                            }}
                                        />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border-white/20" align="start">
                                <CalendarComponent
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={1}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Experience Mode Toggle */}
                        <div className="flex gap-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-1">
                            {experienceModes.map((mode) => {
                                const Icon = mode.icon
                                return (
                                    <button
                                        key={mode.id}
                                        onClick={() => setExperienceMode(mode.id)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-medium",
                                            experienceMode === mode.id
                                                ? "bg-white text-slate-900 shadow-lg"
                                                : "text-white/70 hover:text-white hover:bg-white/10"
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">{mode.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Property List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {filteredAndSortedProperties.map((property) => {
                            const isAvailable = dateRange?.from && dateRange?.to
                                ? checkAvailability(property.id, dateRange.from, dateRange.to)
                                : true

                            return (
                                <motion.div
                                    key={property.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer backdrop-blur-xl",
                                        !isAvailable && "opacity-50 grayscale",
                                        activeMarker?.id === property.id
                                            ? "border-white/30 bg-white/[0.08] shadow-xl ring-1 ring-white/20"
                                            : "border-white/10 hover:border-white/20",
                                        isAvailable ? "bg-white/[0.03] hover:bg-white/[0.05]" : "bg-white/[0.01]"
                                    )}
                                    onClick={() => isAvailable && handlePropertyClick(property)}
                                >
                                    <div className="aspect-[16/9] overflow-hidden relative">
                                        <img
                                            src={property.image}
                                            alt={property.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                            <span className="text-white font-bold text-sm">${property.pricePerNight}</span>
                                            <span className="text-white/60 text-[10px] ml-1">/ night</span>
                                        </div>
                                        {!isAvailable && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
                                                <span className="text-white font-semibold text-sm px-4 py-2 bg-slate-900/80 rounded-full border border-white/20">
                                                    Unavailable
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="text-base font-bold text-white group-hover:text-white/90 transition-colors">{property.name}</h3>
                                            <p className="text-white/60 text-xs mt-1 line-clamp-1">{property.teaser}</p>
                                        </div>

                                        <div className="flex items-center gap-4 text-white/60 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>{property.sleeps}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Bed className="h-3 w-3" />
                                                <span>{property.bedrooms} BD</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Bath className="h-3 w-3" />
                                                <span>{property.bathrooms} BA</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 rounded-xl border-white/10 text-white hover:bg-white/5 h-9 text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setModalProperty(property);
                                                }}
                                                disabled={!isAvailable}
                                            >
                                                Details
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 rounded-xl bg-white text-slate-900 hover:bg-white/90 h-9 text-xs font-semibold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.dispatchEvent(new CustomEvent("open-booking", { detail: { propertyName: property.name } }))
                                                }}
                                                disabled={!isAvailable}
                                            >
                                                Reserve
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Right Side - Map */}
                <div className="flex-1 relative bg-slate-900">
                    <MapView
                        properties={filteredAndSortedProperties.filter(p =>
                            !dateRange?.from || !dateRange?.to || checkAvailability(p.id, dateRange.from, dateRange.to)
                        )}
                        activeMarker={activeMarker}
                        onMarkerClick={setActiveMarker}
                        onPropertySelect={setModalProperty}
                        experienceMode={experienceMode}
                    />

                    {/* Stay Composer Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
                    >
                        <div className="bg-white/8 backdrop-blur-lg border border-white/15 rounded-2xl p-5 shadow-2xl w-[500px] max-w-[90vw]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">Stay Composer</h3>
                                        <p className="text-white/60 text-xs">
                                            {stayLength} {stayLength === 1 ? 'night' : 'nights'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="range"
                                    min="1"
                                    max="14"
                                    value={stayLength}
                                    onChange={(e) => setStayLength(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                                        [&::-webkit-slider-thumb]:appearance-none
                                        [&::-webkit-slider-thumb]:w-4
                                        [&::-webkit-slider-thumb]:h-4
                                        [&::-webkit-slider-thumb]:rounded-full
                                        [&::-webkit-slider-thumb]:bg-white
                                        [&::-webkit-slider-thumb]:shadow-lg
                                        [&::-webkit-slider-thumb]:cursor-pointer
                                        [&::-moz-range-thumb]:w-4
                                        [&::-moz-range-thumb]:h-4
                                        [&::-moz-range-thumb]:rounded-full
                                        [&::-moz-range-thumb]:bg-white
                                        [&::-moz-range-thumb]:border-0
                                        [&::-moz-range-thumb]:shadow-lg
                                        [&::-moz-range-thumb]:cursor-pointer"
                                />
                                <div className="absolute top-5 left-0 right-0 flex justify-between px-2">
                                    {[1, 3, 7, 14].map((night) => (
                                        <div key={night} className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-0.5 h-2 rounded-full transition-all",
                                                stayLength >= night ? "bg-white/60" : "bg-white/20"
                                            )} />
                                            <span className="text-[10px] text-white/40 mt-1">{night}n</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Property Modal */}
            <AnimatePresence>
                {modalProperty && (
                    <PropertyModal
                        property={modalProperty}
                        onClose={() => setModalProperty(null)}
                    />
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    )
}
