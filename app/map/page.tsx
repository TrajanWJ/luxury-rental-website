"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import Navigation from "@/components/navigation"
import { properties, Property, isDateUnavailable } from "@/lib/data"
import { Search, Users, Bed, Bath, Calendar, Sparkles, Mountain, Waves, TreePine, X, MapPin, ChevronRight, ChevronLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PropertyModal } from "@/components/property-modal"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

const MapView = dynamic(() => import("@/components/map-view"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-slate-900">
            <div className="text-white text-sm">Loading map...</div>
        </div>
    )
})

type ExperienceMode = "all" | "lake-views" | "quiet-retreat" | "near-activities"

// Experience/activity data with jet ski rental
export interface Experience {
    id: string
    name: string
    type: "restaurant" | "activity" | "attraction" | "marina" | "rental"
    lat: number
    lng: number
    description: string
    details: string
    hours?: string
    phone?: string
    website?: string
}

const demoExperiences: Experience[] = [
    {
        id: "exp-1",
        name: "SML Jet Ski Rentals",
        type: "rental",
        lat: 37.1450,
        lng: -79.6300,
        description: "Premium jet ski and water sports equipment rentals",
        details: "Rent the latest Yamaha WaveRunners by the hour or day. Safety equipment and brief instruction included. Reservations recommended during peak season.",
        hours: "9am - 6pm Daily (May-Sept)",
        phone: "(540) 555-WAVE",
        website: "smljetski.com"
    },
    {
        id: "exp-2",
        name: "Bernard's Landing Marina",
        type: "marina",
        lat: 37.1580,
        lng: -79.6420,
        description: "Full-service marina with boat rentals and fuel dock",
        details: "Premier marina offering boat slips, pontoon rentals, fuel, and a ship store. Perfect for water sports enthusiasts.",
        hours: "7am - 7pm Daily",
        phone: "(540) 721-8870"
    },
    {
        id: "exp-3",
        name: "The Waterfront Restaurant",
        type: "restaurant",
        lat: 37.1650,
        lng: -79.6380,
        description: "Upscale lakefront dining with sunset views",
        details: "Fine dining featuring fresh seafood, steaks, and an extensive wine list. Outdoor patio seating with panoramic lake views.",
        hours: "11am - 10pm",
        phone: "(540) 721-1234"
    },
]

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
    const [showExperiences, setShowExperiences] = useState(false)
    const [activeExperience, setActiveExperience] = useState<Experience | null>(null)
    const [propertiesPanelCollapsed, setPropertiesPanelCollapsed] = useState(false)

    const filteredAndSortedProperties = useMemo(() => {
        let filtered = properties.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.teaser.toLowerCase().includes(searchQuery.toLowerCase())
        )

        if (experienceMode === "lake-views") {
            filtered = filtered.filter(p => p.amenities.some(a => a.toLowerCase().includes("shoreline") || a.toLowerCase().includes("dock")))
        } else if (experienceMode === "quiet-retreat") {
            filtered = filtered.filter(p => p.amenities.some(a => a.toLowerCase().includes("private") || a.toLowerCase().includes("acres")))
        } else if (experienceMode === "near-activities") {
            filtered = filtered.filter(p => p.amenities.some(a => a.toLowerCase().includes("golf") || a.toLowerCase().includes("bowling") || a.toLowerCase().includes("theater")))
        }

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

    const experienceModes = [
        { id: "all" as const, label: "All", icon: Sparkles },
        { id: "lake-views" as const, label: "Lake", icon: Waves },
        { id: "quiet-retreat" as const, label: "Quiet", icon: Mountain },
        { id: "near-activities" as const, label: "Active", icon: TreePine },
    ]

    const experienceTypeColors = {
        rental: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500' },
        marina: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
        restaurant: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
        activity: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
        attraction: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
    }

    // Auto-collapse experiences when toggled off
    const handleExperiencesToggle = () => {
        setShowExperiences(!showExperiences)
        if (showExperiences) {
            // Turning off - no action needed, panel will slide out
        }
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            {/* Nav Background */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 z-40 transition-all duration-300" />
            <Navigation />

            <div className="flex flex-1 pt-20 overflow-hidden relative">
                {/* Left Tab - Experiences (Collapsible) */}
                <div className={cn(
                    "flex flex-col border-r border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 relative z-10",
                    showExperiences ? "w-[350px]" : "w-0 border-r-0"
                )}>
                    {showExperiences && (
                        <>
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Nearby Activities</h2>
                                    <p className="text-white/60 text-xs mt-1">{demoExperiences.length} locations</p>
                                </div>
                                <button
                                    onClick={handleExperiencesToggle}
                                    className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {demoExperiences.map((experience) => {
                                    const colors = experienceTypeColors[experience.type]
                                    const isActive = activeExperience?.id === experience.id

                                    return (
                                        <div
                                            key={experience.id}
                                            className={cn(
                                                "rounded-2xl overflow-hidden border transition-all cursor-pointer",
                                                isActive
                                                    ? "border-white/30 bg-white/10 ring-1 ring-white/20"
                                                    : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
                                            )}
                                            onClick={() => setActiveExperience(experience)}
                                        >
                                            <div className="p-5 space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-base font-bold text-white mb-1">{experience.name}</h3>
                                                        <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">{experience.description}</p>
                                                    </div>
                                                    <div className={cn("h-3 w-3 rounded-full shrink-0 mt-1", colors.bg)}></div>
                                                </div>

                                                {experience.hours && (
                                                    <div className="text-white/50 text-xs">
                                                        <span className="font-semibold">Hours:</span> {experience.hours}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-3 w-3 text-white/40" />
                                                        <span className={cn("text-[10px] uppercase tracking-wider font-bold", colors.text)}>
                                                            {experience.type}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-white/40" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Middle - Properties Panel (Collapsible) */}
                <div className={cn(
                    "flex flex-col border-r border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 relative z-10",
                    propertiesPanelCollapsed ? "w-[60px]" : "w-full md:w-[450px] lg:w-[500px]"
                )}>
                    {propertiesPanelCollapsed ? (
                        // Collapsed state - vertical tab
                        <div className="flex flex-col items-center py-6 gap-4">
                            <button
                                onClick={() => setPropertiesPanelCollapsed(false)}
                                className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <div className="flex flex-col items-center gap-2">
                                <Home className="h-5 w-5 text-white/60" />
                                <span className="text-white/60 text-xs font-semibold writing-mode-vertical rotate-180">Properties</span>
                            </div>
                        </div>
                    ) : (
                        // Expanded state
                        <>
                            <div className="p-6 space-y-4 border-b border-white/10">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <h1 className="text-xl font-bold text-white">Properties</h1>
                                        <p className="text-white/60 text-xs mt-1">
                                            {availableCount} of {filteredAndSortedProperties.length} available
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Experiences Toggle */}
                                        <Button
                                            onClick={handleExperiencesToggle}
                                            size="sm"
                                            className={cn(
                                                "flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold transition-all",
                                                showExperiences
                                                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                                                    : "bg-white/10 hover:bg-white/15 text-white border border-white/20"
                                            )}
                                        >
                                            <MapPin className="h-4 w-4" />
                                            <span>Activities</span>
                                        </Button>

                                        {/* Collapse Button */}
                                        <button
                                            onClick={() => setPropertiesPanelCollapsed(true)}
                                            className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <Input
                                        placeholder="Search properties..."
                                        className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full h-12 justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/15 rounded-xl",
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
                                                    className="ml-auto h-4 w-4"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setDateRange(undefined)
                                                    }}
                                                />
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={1}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        />
                                    </PopoverContent>
                                </Popover>

                                <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                                    {experienceModes.map((mode) => {
                                        const Icon = mode.icon
                                        return (
                                            <button
                                                key={mode.id}
                                                onClick={() => setExperienceMode(mode.id)}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-all text-xs font-medium",
                                                    experienceMode === mode.id
                                                        ? "bg-white text-slate-900"
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

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {filteredAndSortedProperties.map((property) => {
                                    const isAvailable = dateRange?.from && dateRange?.to
                                        ? checkAvailability(property.id, dateRange.from, dateRange.to)
                                        : true

                                    return (
                                        <div
                                            key={property.id}
                                            className={cn(
                                                "rounded-2xl overflow-hidden border transition-all cursor-pointer",
                                                !isAvailable && "opacity-50 grayscale",
                                                activeMarker?.id === property.id
                                                    ? "border-white/30 bg-white/10"
                                                    : "border-white/10 hover:border-white/20",
                                                isAvailable ? "bg-white/5 hover:bg-white/10" : "bg-white/[0.02]"
                                            )}
                                            onClick={() => isAvailable && setActiveMarker(property)}
                                        >
                                            <div className="aspect-[16/9] overflow-hidden relative">
                                                <img
                                                    src={property.image}
                                                    alt={property.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-3 right-3 bg-black/50 px-3 py-1.5 rounded-full">
                                                    <span className="text-white font-bold text-sm">${property.pricePerNight}</span>
                                                    <span className="text-white/60 text-xs ml-1">/ night</span>
                                                </div>
                                                {!isAvailable && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
                                                        <span className="text-white font-semibold text-sm px-4 py-2 bg-slate-900/80 rounded-full">
                                                            Unavailable
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <h3 className="text-base font-bold text-white">{property.name}</h3>
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

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 rounded-xl"
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
                                                        className="flex-1 rounded-xl"
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
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Right - Map */}
                <div className="flex-1 relative bg-slate-900">
                    <MapView
                        properties={filteredAndSortedProperties.filter(p =>
                            !dateRange?.from || !dateRange?.to || checkAvailability(p.id, dateRange.from, dateRange.to)
                        )}
                        activeMarker={activeMarker}
                        onMarkerClick={setActiveMarker}
                        onPropertySelect={setModalProperty}
                        experienceMode={experienceMode}
                        experiences={showExperiences ? demoExperiences : []}
                        activeExperience={activeExperience}
                        onExperienceClick={setActiveExperience}
                    />
                </div>
            </div>

            {modalProperty && (
                <PropertyModal
                    property={modalProperty}
                    onClose={() => setModalProperty(null)}
                />
            )}
        </div>
    )
}
