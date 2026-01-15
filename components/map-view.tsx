"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from "react-leaflet"
import L from "leaflet"
import { Property } from "@/lib/data"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Experience type from map page
interface Experience {
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

// Property marker
const createCustomIcon = (isActive: boolean, price: number, isHighlighted: boolean) => {
    return L.divIcon({
        className: "custom-marker",
        html: `
            <div class="relative group">
                <div class="${isActive
                ? 'bg-white text-slate-900 shadow-2xl scale-110 border-2 border-white'
                : isHighlighted
                    ? 'bg-white/90 text-slate-900 shadow-xl border-2 border-white/50'
                    : 'bg-slate-900/90 text-white shadow-lg border border-white/30 hover:bg-white hover:text-slate-900 hover:scale-105'
            } backdrop-blur-lg px-3 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap transition-all duration-300 cursor-pointer">
                    $${price}
                </div>
            </div>
        `,
        iconSize: [60, 32],
        iconAnchor: [30, 32],
    })
}

// Experience marker with color coding
const createExperienceIcon = (type: string, isActive: boolean) => {
    const colors = {
        rental: 'bg-cyan-500',
        marina: 'bg-green-500',
        restaurant: 'bg-orange-500',
        activity: 'bg-purple-500',
        attraction: 'bg-blue-500'
    }

    return L.divIcon({
        className: "experience-marker",
        html: `
            <div class="relative">
                <div class="${colors[type as keyof typeof colors]} ${isActive ? 'h-4 w-4 ring-2 ring-white' : 'h-3 w-3'} rounded-full border-2 border-white shadow-lg transition-all"></div>
            </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    })
}

// Map updater for smooth panning
function MapUpdater({ activeMarker, activeExperience }: { activeMarker: Property | null, activeExperience: Experience | null }) {
    const map = useMap()

    useEffect(() => {
        if (activeMarker) {
            map.flyTo([activeMarker.lat, activeMarker.lng], 13, {
                duration: 1.2,
                easeLinearity: 0.2
            })
        } else if (activeExperience) {
            map.flyTo([activeExperience.lat, activeExperience.lng], 13, {
                duration: 1.2,
                easeLinearity: 0.2
            })
        }
    }, [activeMarker, activeExperience, map])

    return null
}

interface MapViewProps {
    properties: Property[]
    activeMarker: Property | null
    onMarkerClick: (property: Property) => void
    onPropertySelect: (property: Property) => void
    experienceMode: string
    experiences?: Experience[]
    activeExperience?: Experience | null
    onExperienceClick?: (experience: Experience) => void
}

export default function MapView({
    properties,
    activeMarker,
    onMarkerClick,
    onPropertySelect,
    experienceMode,
    experiences = [],
    activeExperience = null,
    onExperienceClick
}: MapViewProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-950">
                <div className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-white/60 font-medium text-sm">Loading map...</span>
            </div>
        )
    }

    const isPropertyHighlighted = (property: Property) => {
        if (experienceMode === "all") return false
        return properties.includes(property)
    }

    const getExperienceColor = (type: string) => {
        const colors = {
            rental: 'cyan',
            marina: 'green',
            restaurant: 'orange',
            activity: 'purple',
            attraction: 'blue'
        }
        return colors[type as keyof typeof colors] || 'blue'
    }

    return (
        <div className="absolute inset-0 map-container">
            <MapContainer
                center={[37.15, -79.62]}
                zoom={11}
                scrollWheelZoom={true}
                className="h-full w-full"
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater activeMarker={activeMarker} activeExperience={activeExperience} />

                {/* Property Markers */}
                {properties.map((property) => (
                    <Marker
                        key={property.id}
                        position={[property.lat, property.lng]}
                        icon={createCustomIcon(
                            activeMarker?.id === property.id,
                            property.pricePerNight,
                            isPropertyHighlighted(property)
                        )}
                        eventHandlers={{
                            click: () => onMarkerClick(property),
                        }}
                    />
                ))}

                {/* Experience Markers with Hover Tooltips */}
                {experiences.map((experience) => {
                    const color = getExperienceColor(experience.type)

                    return (
                        <Marker
                            key={experience.id}
                            position={[experience.lat, experience.lng]}
                            icon={createExperienceIcon(experience.type, activeExperience?.id === experience.id)}
                            eventHandlers={{
                                click: () => onExperienceClick?.(experience),
                            }}
                        >
                            {/* Hover Tooltip - Shows on hover */}
                            <Tooltip
                                direction="top"
                                offset={[0, -5]}
                                opacity={1}
                                permanent={false}
                                className="experience-tooltip"
                            >
                                <div className="bg-slate-900/95 backdrop-blur-lg text-white p-4 rounded-xl border border-white/20 shadow-2xl min-w-[250px]">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h4 className="font-bold text-sm flex-1">{experience.name}</h4>
                                        <div className={`h-2.5 w-2.5 rounded-full bg-${color}-500 shrink-0 mt-1`}></div>
                                    </div>
                                    <p className="text-white/70 text-xs mb-3 leading-relaxed">{experience.description}</p>

                                    {experience.hours && (
                                        <div className="text-white/60 text-xs mb-2">
                                            <span className="font-semibold">Hours:</span> {experience.hours}
                                        </div>
                                    )}

                                    {experience.phone && (
                                        <div className="text-white/60 text-xs mb-2">
                                            <span className="font-semibold">Phone:</span> {experience.phone}
                                        </div>
                                    )}

                                    <div className="pt-2 border-t border-white/10 mt-2">
                                        <span className={`text-${color}-400 text-[10px] uppercase tracking-wider font-bold`}>
                                            {experience.type}
                                        </span>
                                    </div>
                                </div>
                            </Tooltip>

                            {/* Click Popup - Shows on click */}
                            <Popup className="experience-popup" closeButton={true}>
                                <div className="bg-slate-900 text-white p-4 rounded-lg border border-white/10">
                                    <h4 className="font-bold text-base mb-2">{experience.name}</h4>
                                    <p className="text-white/70 text-sm mb-3">{experience.details}</p>

                                    <div className="space-y-2 mb-3">
                                        {experience.hours && (
                                            <div className="text-white/60 text-xs">
                                                <span className="font-semibold">Hours:</span> {experience.hours}
                                            </div>
                                        )}
                                        {experience.phone && (
                                            <div className="text-white/60 text-xs">
                                                <span className="font-semibold">Phone:</span> {experience.phone}
                                            </div>
                                        )}
                                        {experience.website && (
                                            <div className="text-white/60 text-xs">
                                                <span className="font-semibold">Website:</span> {experience.website}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
                                        <div className={`h-2 w-2 rounded-full bg-${color}-500`}></div>
                                        <span className="text-white/40 text-[10px] uppercase tracking-wider">{experience.type}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>

            <style jsx global>{`
                .leaflet-container {
                    background: #0f172a;
                    font-family: inherit;
                    z-index: 0;
                }
                
                .leaflet-popup-content-wrapper {
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    border-radius: 0 !important;
                }
                
                .leaflet-popup-content {
                    margin: 0 !important;
                    width: 100% !important;
                }
                
                .leaflet-popup-tip-container {
                    display: none !important;
                }
                
                .custom-marker,
                .experience-marker {
                    background: transparent !important;
                    border: none !important;
                }
                
                /* Experience Tooltip Styling */
                .experience-tooltip {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.8) !important;
                    padding: 0 !important;
                }
                
                .experience-tooltip .leaflet-tooltip-left::before,
                .experience-tooltip .leaflet-tooltip-right::before {
                    display: none !important;
                }
                
                /* Clean, minimal zoom controls */
                .leaflet-control-zoom {
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 12px !important;
                    overflow: hidden;
                    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5) !important;
                    backdrop-filter: blur(16px);
                }
                
                .leaflet-control-zoom a {
                    background: rgba(255, 255, 255, 0.08) !important;
                    backdrop-filter: blur(16px);
                    color: white !important;
                    border: none !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    width: 36px !important;
                    height: 36px !important;
                    line-height: 36px !important;
                    transition: all 0.2s !important;
                    font-size: 18px !important;
                }
                
                .leaflet-control-zoom a:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    color: white !important;
                }
                
                .leaflet-control-zoom a:last-child {
                    border-bottom: none !important;
                }
                
                /* Minimal attribution */
                .leaflet-control-attribution {
                    background: rgba(255, 255, 255, 0.08) !important;
                    backdrop-filter: blur(12px);
                    color: rgba(255, 255, 255, 0.5) !important;
                    font-size: 9px !important;
                    padding: 2px 6px !important;
                    border-radius: 6px !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .leaflet-control-attribution a {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
            `}</style>
        </div>
    )
}
