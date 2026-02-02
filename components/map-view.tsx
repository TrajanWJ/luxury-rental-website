"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip, ZoomControl } from "react-leaflet"
import L from "leaflet"
import { Property } from "@/lib/data"
import { Experience } from "@/lib/experiences"
import { Plus, Minus } from "lucide-react"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Property marker with brand colors
const createCustomIcon = (isActive: boolean, price: number, isHighlighted: boolean) => {
    return L.divIcon({
        className: "custom-marker",
        html: `
            <div class="relative group">
                <div class="${isActive
                ? 'bg-[#463930] text-white shadow-2xl scale-110 border-2 border-[#463930]'
                : isHighlighted
                    ? 'bg-[#7d7065] text-white shadow-xl border-2 border-[#7d7065]'
                    : 'bg-white/95 text-[#463930] shadow-lg border border-[#463930]/30 hover:bg-[#463930] hover:text-white hover:scale-105'
            } backdrop-blur-lg px-3 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap transition-all duration-300 cursor-pointer">
                    $${price}
                </div>
            </div>
        `,
        iconSize: [60, 32],
        iconAnchor: [30, 32],
    })
}

// Experience marker with brand color coding
const createExperienceIcon = (type: string, isActive: boolean) => {
    const typeMapping: { [key: string]: string } = {
        rental: '#7d7065',
        marina: '#9c8f84',
        restaurant: '#c3b6ab',
        dining: '#c3b6ab',
        activity: '#7d7065',
        attraction: '#9c8f84',
        park: '#7d7065',
        winery: '#c3b6ab',
        history: '#9c8f84',
        shopping: '#c3b6ab'
    }

    const color = typeMapping[type] || '#7d7065';

    return L.divIcon({
        className: "experience-marker",
        html: `
            <div class="relative">
                <div style="background-color: ${color}" class="${isActive ? 'h-4 w-4 ring-2 ring-white' : 'h-3 w-3'} rounded-full border-2 border-white shadow-lg transition-all"></div>
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
    const [mapKey, setMapKey] = useState(0)

    useEffect(() => {
        setMounted(true)
        // Force a re-render after mount to ensure map loads properly
        const timer = setTimeout(() => {
            setMapKey(prev => prev + 1)
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#ebe0d4]">
                <div className="h-12 w-12 border-4 border-[#463930]/20 border-t-[#463930] rounded-full animate-spin" />
                <span className="text-[#7d7065] font-medium text-sm">Loading map...</span>
            </div>
        )
    }

    const isPropertyHighlighted = (property: Property) => {
        if (experienceMode === "all") return false
        return properties.includes(property)
    }

    const getExperienceColor = (type: string) => {
        const typeMapping: { [key: string]: string } = {
            rental: '#7d7065',
            marina: '#9c8f84',
            restaurant: '#c3b6ab',
            dining: '#c3b6ab',
            activity: '#7d7065',
            attraction: '#9c8f84',
            park: '#7d7065',
            winery: '#c3b6ab',
            history: '#9c8f84',
            shopping: '#c3b6ab'
        }
        return typeMapping[type] || '#7d7065'
    }

    return (
        <div className="absolute inset-0 map-container">
            <MapContainer
                key={mapKey}
                center={[37.15, -79.62]}
                zoom={11}
                scrollWheelZoom={true}
                className="h-full w-full"
                zoomControl={false}
                preferCanvas={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                    minZoom={9}
                    keepBuffer={4}
                    updateWhenIdle={false}
                    updateWhenZooming={false}
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
                            {/* Hover Tooltip */}
                            <Tooltip
                                direction="top"
                                offset={[0, -5]}
                                opacity={1}
                                permanent={false}
                                className="experience-tooltip"
                            >
                                <div className="bg-[#463930]/95 backdrop-blur-lg text-white p-4 rounded-xl border border-white/20 shadow-2xl min-w-[250px]">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h4 className="font-bold text-sm flex-1">{experience.name}</h4>
                                        <div style={{ backgroundColor: color }} className="h-2.5 w-2.5 rounded-full shrink-0 mt-1"></div>
                                    </div>
                                    <p className="text-white/70 text-xs mb-3 leading-relaxed line-clamp-2">{experience.description}</p>

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
                                        <span style={{ color: color }} className="text-[10px] uppercase tracking-wider font-bold">
                                            {experience.type}
                                        </span>
                                    </div>
                                </div>
                            </Tooltip>

                            {/* Click Popup */}
                            <Popup className="experience-popup" closeButton={true}>
                                <div className="bg-[#ebe0d4] text-[#463930] p-4 rounded-lg border border-[#463930]/10 min-w-[300px]">
                                    {experience.imageUrl && (
                                        <div className="w-[calc(100%+2rem)] -ml-4 -mt-4 mb-4 h-32 overflow-hidden rounded-t-lg relative">
                                            <img src={experience.imageUrl} alt={experience.name} className="w-full h-full object-cover" />
                                            <div style={{ backgroundColor: color }} className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-opacity-90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                                {experience.type}
                                            </div>
                                        </div>
                                    )}
                                    <h4 className="font-serif font-medium text-base mb-2">{experience.name}</h4>
                                    <p className="text-[#7d7065] text-sm mb-4 leading-relaxed">{experience.details}</p>

                                    <div className="space-y-2 mb-4 bg-[#463930]/5 p-3 rounded-lg border border-[#463930]/5">
                                        {experience.address && (
                                            <div className="text-[#7d7065] text-xs flex gap-2">
                                                <span className="font-semibold text-[#463930]/60 w-12 shrink-0">Address:</span>
                                                <span>{experience.address}</span>
                                            </div>
                                        )}
                                        {experience.hours && (
                                            <div className="text-[#7d7065] text-xs flex gap-2">
                                                <span className="font-semibold text-[#463930]/60 w-12 shrink-0">Hours:</span>
                                                <span>{experience.hours}</span>
                                            </div>
                                        )}
                                        {experience.phone && (
                                            <div className="text-[#7d7065] text-xs flex gap-2">
                                                <span className="font-semibold text-[#463930]/60 w-12 shrink-0">Phone:</span>
                                                <span>{experience.phone}</span>
                                            </div>
                                        )}
                                        {experience.website && (
                                            <div className="text-[#7d7065] text-xs flex gap-2">
                                                <span className="font-semibold text-[#463930]/60 w-12 shrink-0">Web:</span>
                                                <a href={`https://${experience.website}`} target="_blank" rel="noopener noreferrer" className="text-[#7d7065] hover:underline">{experience.website}</a>
                                            </div>
                                        )}
                                    </div>

                                    {!experience.imageUrl && (
                                        <div className="flex items-center gap-1.5 pt-2 border-t border-[#463930]/10">
                                            <div style={{ backgroundColor: color }} className="h-2 w-2 rounded-full"></div>
                                            <span className="text-[#7d7065] text-[10px] uppercase tracking-wider">{experience.type}</span>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>

            {/* Custom Zoom Controls - Mobile Friendly */}
            <div className="absolute bottom-20 sm:bottom-6 right-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => {
                        const map = document.querySelector('.leaflet-container') as any
                        if (map && map._leaflet_map) {
                            map._leaflet_map.zoomIn()
                        }
                    }}
                    className="h-10 w-10 rounded-lg bg-white/95 backdrop-blur-md border border-[#463930]/15 flex items-center justify-center text-[#463930] hover:bg-[#463930]/10 transition-all shadow-lg"
                    aria-label="Zoom in"
                >
                    <Plus className="h-5 w-5" />
                </button>
                <button
                    onClick={() => {
                        const map = document.querySelector('.leaflet-container') as any
                        if (map && map._leaflet_map) {
                            map._leaflet_map.zoomOut()
                        }
                    }}
                    className="h-10 w-10 rounded-lg bg-white/95 backdrop-blur-md border border-[#463930]/15 flex items-center justify-center text-[#463930] hover:bg-[#463930]/10 transition-all shadow-lg"
                    aria-label="Zoom out"
                >
                    <Minus className="h-5 w-5" />
                </button>
            </div>

            <style jsx global>{`
                .leaflet-container {
                    background: #ebe0d4;
                    font-family: inherit;
                    z-index: 0;
                    width: 100%;
                    height: 100%;
                }
                
                /* Fix tile loading issues */
                .leaflet-tile-container {
                    will-change: transform;
                }
                
                .leaflet-tile {
                    will-change: transform;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                }
                
                .leaflet-layer,
                .leaflet-pane {
                    will-change: transform;
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
                    box-shadow: 0 20px 60px -10px rgba(70, 57, 48, 0.3) !important;
                    padding: 0 !important;
                }
                
                .experience-tooltip .leaflet-tooltip-left::before,
                .experience-tooltip .leaflet-tooltip-right::before {
                    display: none !important;
                }
                
                /* Brand-styled zoom controls */
                .leaflet-control-zoom {
                    border: 1px solid rgba(70, 57, 48, 0.15) !important;
                    border-radius: 12px !important;
                    overflow: hidden;
                    box-shadow: 0 10px 40px -10px rgba(70, 57, 48, 0.2) !important;
                    backdrop-filter: blur(16px);
                }
                
                .leaflet-control-zoom a {
                    background: rgba(255, 255, 255, 0.9) !important;
                    backdrop-filter: blur(16px);
                    color: #463930 !important;
                    border: none !important;
                    border-bottom: 1px solid rgba(70, 57, 48, 0.1) !important;
                    width: 36px !important;
                    height: 36px !important;
                    line-height: 36px !important;
                    transition: all 0.2s !important;
                    font-size: 18px !important;
                }
                
                .leaflet-control-zoom a:hover {
                    background: rgba(70, 57, 48, 0.1) !important;
                    color: #463930 !important;
                }
                
                .leaflet-control-zoom a:last-child {
                    border-bottom: none !important;
                }
                
                /* Brand-styled attribution */
                .leaflet-control-attribution {
                    background: rgba(255, 255, 255, 0.9) !important;
                    backdrop-filter: blur(12px);
                    color: rgba(70, 57, 48, 0.6) !important;
                    font-size: 9px !important;
                    padding: 2px 6px !important;
                    border-radius: 6px !important;
                    border: 1px solid rgba(70, 57, 48, 0.1) !important;
                }
                
                .leaflet-control-attribution a {
                    color: rgba(70, 57, 48, 0.8) !important;
                }
            `}</style>
        </div>
    )
}
