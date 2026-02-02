"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import Navigation from "@/components/navigation"
import { properties, Property, isDateUnavailable } from "@/lib/data"
import { experiences, Experience } from "@/lib/experiences"
import { Search, Users, Bed, Bath, Calendar, Sparkles, Mountain, Waves, TreePine, X, MapPin, ChevronRight, ChevronLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PropertyModal } from "@/components/property-modal"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useBookingContext } from "@/hooks/use-booking-context"
import HostawayCalendar from "@/components/hostaway-calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const MapView = dynamic(() => import("@/components/map-view"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-[#ebe0d4]">
            <div className="text-[#463930] text-sm font-medium">Loading map...</div>
        </div>
    )
})

type ExperienceMode = "all" | "lake-views" | "quiet-retreat" | "near-activities"

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
    const globalContext = useBookingContext()
    const [showExperiences, setShowExperiences] = useState(false)
    const [activeExperience, setActiveExperience] = useState<Experience | null>(null)
    const [propertiesPanelCollapsed, setPropertiesPanelCollapsed] = useState(false)

    const checkIn = globalContext.startDate
    const checkOut = globalContext.endDate

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

        if (checkIn && checkOut) {
            filtered.sort((a, b) => {
                const aAvailable = checkAvailability(a.id, new Date(checkIn), new Date(checkOut))
                const bAvailable = checkAvailability(b.id, new Date(checkIn), new Date(checkOut))
                if (aAvailable && !bAvailable) return -1
                if (!aAvailable && bAvailable) return 1
                return 0
            })
        }

        return filtered
    }, [searchQuery, experienceMode, checkIn, checkOut])

    const availableCount = useMemo(() => {
        if (!checkIn || !checkOut) return filteredAndSortedProperties.length
        return filteredAndSortedProperties.filter(p => checkAvailability(p.id, new Date(checkIn), new Date(checkOut))).length
    }, [filteredAndSortedProperties, checkIn, checkOut])

    const experienceModes = [
        { id: "all" as const, label: "All", icon: Sparkles },
        { id: "lake-views" as const, label: "Lake", icon: Waves },
        { id: "quiet-retreat" as const, label: "Quiet", icon: Mountain },
        { id: "near-activities" as const, label: "Active", icon: TreePine },
    ]

    const getExperienceColor = (type: string) => {
        const typeMapping: { [key: string]: { bg: string, text: string } } = {
            rental: { bg: 'bg-[#7d7065]', text: 'text-[#7d7065]' },
            marina: { bg: 'bg-[#9c8f84]', text: 'text-[#9c8f84]' },
            restaurant: { bg: 'bg-[#c3b6ab]', text: 'text-[#c3b6ab]' },
            dining: { bg: 'bg-[#c3b6ab]', text: 'text-[#c3b6ab]' },
            activity: { bg: 'bg-[#7d7065]', text: 'text-[#7d7065]' },
            attraction: { bg: 'bg-[#9c8f84]', text: 'text-[#9c8f84]' },
            park: { bg: 'bg-[#7d7065]', text: 'text-[#7d7065]' },
            winery: { bg: 'bg-[#c3b6ab]', text: 'text-[#c3b6ab]' },
            history: { bg: 'bg-[#9c8f84]', text: 'text-[#9c8f84]' },
            shopping: { bg: 'bg-[#c3b6ab]', text: 'text-[#c3b6ab]' },
        }
        return typeMapping[type] || { bg: 'bg-[#7d7065]', text: 'text-[#7d7065]' }
    }

    const handleExperiencesToggle = () => {
        setShowExperiences(!showExperiences)
    }

    return (
        <div className="flex flex-col h-screen bg-[#ebe0d4] overflow-hidden">
            {/* Nav Background */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-[#ebe0d4]/95 backdrop-blur-xl border-b border-[#463930]/10 z-40 transition-all duration-300" />
            <Navigation />

            <div className="flex flex-1 pt-20 overflow-hidden relative">
                {/* Left Tab - Experiences (Collapsible) - Hidden on mobile by default */}
                <div className={cn(
                    "flex flex-col border-r border-[#463930]/10 bg-[#ebe0d4]/50 backdrop-blur-xl transition-all duration-300 relative z-10",
                    showExperiences ? "w-[350px] max-md:hidden" : "w-0 border-r-0"
                )}>
                    {showExperiences && (
                        <>
                            <div className="p-6 border-b border-[#463930]/10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-serif font-medium text-[#463930]">Nearby Activities</h2>
                                    <p className="text-[#7d7065] text-xs mt-1">{experiences.length} local favorites</p>
                                </div>
                                <button
                                    onClick={handleExperiencesToggle}
                                    className="h-8 w-8 rounded-lg bg-[#463930]/10 hover:bg-[#463930]/20 flex items-center justify-center text-[#463930] transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {experiences.map((experience) => {
                                    const colors = getExperienceColor(experience.type)
                                    const isActive = activeExperience?.id === experience.id

                                    return (
                                        <div
                                            key={experience.id}
                                            className={cn(
                                                "rounded-xl overflow-hidden border transition-all cursor-pointer group",
                                                isActive
                                                    ? "border-[#463930]/30 bg-[#463930]/10 ring-1 ring-[#463930]/20"
                                                    : "border-[#463930]/5 hover:border-[#463930]/20 bg-white/50 hover:bg-white/80"
                                            )}
                                            onClick={() => setActiveExperience(experience)}
                                        >
                                            <div className="flex p-3 gap-3">
                                                {experience.imageUrl ? (
                                                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#c3b6ab] relative">
                                                        <img
                                                            src={experience.imageUrl}
                                                            alt={experience.name}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className={cn("w-20 h-20 shrink-0 rounded-lg flex items-center justify-center bg-[#c3b6ab]/20", colors.text)}>
                                                        <Sparkles className="h-6 w-6 opacity-50" />
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h3 className="text-sm font-serif font-medium text-[#463930] leading-tight truncate pr-2">{experience.name}</h3>
                                                            <div className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", colors.bg)}></div>
                                                        </div>
                                                        <span className={cn("text-[10px] uppercase tracking-wider font-bold mb-1 block", colors.text)}>
                                                            {experience.type}
                                                        </span>
                                                        <p className="text-[#7d7065] text-[10px] line-clamp-2 leading-relaxed">{experience.description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {(experience.hours || experience.phone) && (
                                                <div className="px-3 py-2 border-t border-[#463930]/5 bg-[#463930]/[0.02] flex items-center justify-between text-[10px] text-[#7d7065]">
                                                    <span>{experience.hours || experience.phone}</span>
                                                    <ChevronRight className="h-3 w-3 opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Middle - Properties Panel (Collapsible) */}
                <div className={cn(
                    "flex flex-col border-r border-[#463930]/10 bg-[#ebe0d4]/50 backdrop-blur-xl transition-all duration-300 relative z-10",
                    propertiesPanelCollapsed ? "w-[60px]" : "w-[90vw] sm:w-[400px] md:w-[450px] lg:w-[500px]"
                )}>
                    {propertiesPanelCollapsed ? (
                        <div className="flex flex-col items-center py-6 gap-4">
                            <button
                                onClick={() => setPropertiesPanelCollapsed(false)}
                                className="h-10 w-10 rounded-lg bg-[#463930]/10 hover:bg-[#463930]/20 flex items-center justify-center text-[#463930] transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <div className="flex flex-col items-center gap-2">
                                <Home className="h-5 w-5 text-[#7d7065]" />
                                <div className="flex items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                    <span className="text-[#7d7065] text-xs font-semibold">Properties</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 space-y-4 border-b border-[#463930]/10">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <h1 className="text-xl font-serif font-medium text-[#463930]">Properties</h1>
                                        <p className="text-[#7d7065] text-xs mt-1">
                                            {availableCount} of {filteredAndSortedProperties.length} available
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={handleExperiencesToggle}
                                            size="sm"
                                            className={cn(
                                                "flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold transition-all max-md:hidden",
                                                showExperiences
                                                    ? "bg-[#7d7065] hover:bg-[#463930] text-white"
                                                    : "bg-[#463930]/10 hover:bg-[#463930]/20 text-[#463930] border border-[#463930]/20"
                                            )}
                                        >
                                            <MapPin className="h-4 w-4" />
                                            <span>Activities</span>
                                        </Button>

                                        <button
                                            onClick={() => setPropertiesPanelCollapsed(true)}
                                            className="h-10 w-10 md:h-10 md:w-10 rounded-lg bg-[#463930]/10 hover:bg-[#463930]/20 flex items-center justify-center text-[#463930] transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5 md:h-4 md:w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d7065]" />
                                    <Input
                                        placeholder="Search properties..."
                                        className="pl-11 h-12 bg-white/50 border-[#463930]/20 text-[#463930] placeholder:text-[#7d7065] rounded-xl focus:border-[#7d7065] focus:ring-[#7d7065]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full h-12 justify-start text-left font-normal bg-white/50 border-[#463930]/20 text-[#463930] hover:bg-white/80 rounded-xl",
                                                !checkIn && "text-[#7d7065]"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {checkIn ? (
                                                checkOut ? (
                                                    <>
                                                        {checkIn} - {checkOut}
                                                    </>
                                                ) : (
                                                    checkIn
                                                )
                                            ) : (
                                                <span>Select dates</span>
                                            )}
                                            {checkIn && (
                                                <X
                                                    className="ml-auto h-4 w-4"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                            ; (window as any).clearContext();
                                                    }}
                                                />
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-4 bg-[#ebe0d4] border border-[#463930]/10 shadow-2xl rounded-2xl" align="start">
                                        <div className="min-w-[320px]">
                                            <HostawayCalendar listingId={activeMarker?.hostawayId || "466648"} />
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <div className="flex gap-2 bg-[#463930]/5 border border-[#463930]/10 rounded-xl p-1">
                                    {experienceModes.map((mode) => {
                                        const Icon = mode.icon
                                        return (
                                            <button
                                                key={mode.id}
                                                onClick={() => setExperienceMode(mode.id)}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-all text-xs font-medium",
                                                    experienceMode === mode.id
                                                        ? "bg-[#463930] text-white"
                                                        : "text-[#7d7065] hover:text-[#463930] hover:bg-[#463930]/10"
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
                                    const isAvailable = checkIn && checkOut
                                        ? checkAvailability(property.id, new Date(checkIn), new Date(checkOut))
                                        : true

                                    return (
                                        <div
                                            key={property.id}
                                            className={cn(
                                                "rounded-2xl overflow-hidden border transition-all cursor-pointer",
                                                !isAvailable && "opacity-50 grayscale",
                                                activeMarker?.id === property.id
                                                    ? "border-[#463930]/30 bg-[#463930]/10"
                                                    : "border-[#463930]/10 hover:border-[#463930]/20",
                                                isAvailable ? "bg-white/50 hover:bg-white/80" : "bg-white/20"
                                            )}
                                            onClick={() => isAvailable && setActiveMarker(property)}
                                        >
                                            <div className="aspect-[16/9] overflow-hidden relative">
                                                <img
                                                    src={property.image}
                                                    alt={property.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-3 right-3 bg-[#463930]/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                                    <span className="text-white font-bold text-sm">${property.pricePerNight}</span>
                                                    <span className="text-white/80 text-xs ml-1">/ night</span>
                                                </div>
                                                {!isAvailable && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-[#463930]/60">
                                                        <span className="text-white font-semibold text-sm px-4 py-2 bg-[#463930]/80 rounded-full border border-white/10 backdrop-blur-md">
                                                            Unavailable for selected dates
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <h3 className="text-base font-serif font-medium text-[#463930]">{property.name}</h3>
                                                    <p className="text-[#7d7065] text-xs mt-1 line-clamp-1">{property.teaser}</p>
                                                </div>

                                                <div className="flex items-center gap-4 text-[#7d7065] text-xs">
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
                                                        className="flex-1 rounded-xl border-[#463930]/20 text-[#463930] hover:bg-[#463930]/10"
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
                                                        className="flex-1 rounded-xl bg-[#7d7065] hover:bg-[#463930] text-white"
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
                <div className="flex-1 relative bg-[#ebe0d4]">
                    <MapView
                        properties={filteredAndSortedProperties.filter(p =>
                            !checkIn || !checkOut || checkAvailability(p.id, new Date(checkIn), new Date(checkOut))
                        )}
                        activeMarker={activeMarker}
                        onMarkerClick={setActiveMarker}
                        onPropertySelect={setModalProperty}
                        experienceMode={experienceMode}
                        experiences={showExperiences ? experiences : []}
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
