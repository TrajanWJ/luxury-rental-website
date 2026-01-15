"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { motion } from "framer-motion"
import L from "leaflet"
import { Property } from "@/lib/data"
import { MapPin } from "lucide-react"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Clean, minimal custom marker
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

// Map updater for smooth panning
function MapUpdater({ activeMarker }: { activeMarker: Property | null }) {
    const map = useMap()

    useEffect(() => {
        if (activeMarker) {
            map.flyTo([activeMarker.lat, activeMarker.lng], 13, {
                duration: 1.2,
                easeLinearity: 0.2
            })
        }
    }, [activeMarker, map])

    return null
}

interface MapViewProps {
    properties: Property[]
    activeMarker: Property | null
    onMarkerClick: (property: Property) => void
    onPropertySelect: (property: Property) => void
    experienceMode: string
}

export default function MapView({ properties, activeMarker, onMarkerClick, onPropertySelect, experienceMode }: MapViewProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-950">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full"
                />
                <span className="text-white/60 font-medium text-sm">Loading map...</span>
            </div>
        )
    }

    // Determine if property should be highlighted based on experience mode
    const isPropertyHighlighted = (property: Property) => {
        if (experienceMode === "all") return false
        // Properties matching the experience mode get subtle highlight
        return properties.includes(property)
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

                <MapUpdater activeMarker={activeMarker} />

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
            </MapContainer>

            <style jsx global>{`
                .leaflet-container {
                    background: #0f172a;
                    font-family: inherit;
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
                
                .custom-marker {
                    background: transparent !important;
                    border: none !important;
                }
                
                /* Clean, minimal zoom controls matching homepage style */
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
