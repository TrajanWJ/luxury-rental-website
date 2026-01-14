"use client"

import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import { PropertyCard } from "@/components/property-card"
import { PropertyModal } from "@/components/property-modal"
import { properties, Property } from "@/lib/data"
import { Search, SlidersHorizontal, Grid3x3, Map as MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function MapBookingPage() {
    const [isMounted, setIsMounted] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
    const [startWith3D, setStartWith3D] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "map">("grid")

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const handlePropertyClick = (property: Property) => {
        setStartWith3D(false)
        setSelectedProperty(property)
    }

    const handle3DClick = (property: Property) => {
        setStartWith3D(true)
        setSelectedProperty(property)
    }

    const filteredProperties = properties.filter(property =>
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <main className="min-h-screen bg-slate-950 relative flex flex-col overflow-hidden">
                {/* Background Image (Fixed & Parallax-like) */}
                <div className="fixed inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
                        style={{ backgroundImage: "url('https://wilson-premier.com/wp-content/uploads/2023/11/WP-crane-flying-over-water.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/60" />
                </div>

                <Navigation />

                {/* Main Content */}
                <div className="relative z-10 w-full flex-1 pt-24 pb-12 px-4 md:px-8 lg:px-12">
                    <div className="max-w-7xl mx-auto">

                        {/* Search and Filter Bar */}
                        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                            {/* Search */}
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                                <Input
                                    type="text"
                                    placeholder="Search properties..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-full backdrop-blur-md focus-visible:ring-white/30"
                                />
                            </div>

                            {/* View Toggle & Filters */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                                >
                                    <SlidersHorizontal className="h-5 w-5" />
                                </Button>
                                <div className="flex gap-1 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
                                    <Button
                                        variant={viewMode === "grid" ? "default" : "ghost"}
                                        size="icon"
                                        onClick={() => setViewMode("grid")}
                                        className={`h-10 w-10 rounded-full ${viewMode === "grid" ? "bg-white text-slate-900" : "text-white hover:bg-white/20"}`}
                                    >
                                        <Grid3x3 className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "map" ? "default" : "ghost"}
                                        size="icon"
                                        onClick={() => setViewMode("map")}
                                        className={`h-10 w-10 rounded-full ${viewMode === "map" ? "bg-white text-slate-900" : "text-white hover:bg-white/20"}`}
                                    >
                                        <MapIcon className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="mb-6">
                            <p className="text-white/80 text-sm">
                                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} available
                            </p>
                        </div>

                        {/* Property Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProperties.map((property, index) => (
                                <div
                                    key={property.id}
                                    className="animate-in fade-in slide-in-from-bottom-4"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animationFillMode: "backwards"
                                    }}
                                >
                                    <PropertyCard
                                        property={property}
                                        onClick={() => handlePropertyClick(property)}
                                        on3DClick={() => handle3DClick(property)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredProperties.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-white/60 text-lg">No properties found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Property Modal */}
            {selectedProperty && (
                <PropertyModal
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    initialShow3D={startWith3D}
                />
            )}
        </>
    )
}
