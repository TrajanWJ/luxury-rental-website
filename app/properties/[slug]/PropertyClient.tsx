"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Property } from "@/lib/data"
import { usePhotoOrder } from "@/components/photo-order-context"
import Navigation from "@/components/navigation"
import FooterCTA from "@/components/footer-cta"
import { Button } from "@/components/ui/button"
import { Users, Info, MapPin, Check, Star, Wifi, Car, Anchor, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"
import HostawayCalendar from "@/components/hostaway-calendar"
import Link from "next/link"

export default function PropertyClient({ property }: { property: Property }) {
    const { getOrderedImages, getHeroImage } = usePhotoOrder()
    const orderedImages = getOrderedImages(property)
    const heroImage = getHeroImage(property)
    const [descExpanded, setDescExpanded] = useState(false)
    const [showAllAmenities, setShowAllAmenities] = useState(false)
    const isMilanManor = property.name === "Milan Manor"
    const isPenthouseView = property.name === "Penthouse View"

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Nav Background */}
            <div
                className={cn(
                    "fixed top-0 left-0 right-0 h-32 backdrop-blur-xl z-40",
                    isMilanManor
                        ? "bg-slate-200/90 border-b border-slate-500/20"
                        : isPenthouseView
                            ? "bg-transparent border-b border-transparent backdrop-blur-none"
                        : "bg-slate-900/80 border-b border-white/5"
                )}
            />
            <Navigation theme={isMilanManor ? "light" : "dark"} />

            {/* Hero Section */}
            <header className="relative h-[85vh] w-full overflow-hidden mt-0">
                <Image
                    src={heroImage}
                    alt={property.name}
                    fill
                    className="object-cover"
                    priority
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 pb-24 pt-32 bg-gradient-to-t from-slate-950 to-transparent">
                    <div className="container mx-auto px-6 md:px-12">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium uppercase tracking-wider">
                                    Luxury Collection
                                </span>
                                {property.amenities.includes("Waterfront Views") && (
                                    <span className="px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-100 text-xs font-medium uppercase tracking-wider">
                                        Waterfront
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                                {property.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-lg text-white/80 font-light">
                                <span className="flex items-center gap-2"><MapPin className="h-5 w-5 opacity-70" /> Smith Mountain Lake, VA</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                <span className="flex items-center gap-2"><Users className="h-5 w-5 opacity-70" /> {property.sleeps} Guests</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                <span className="flex items-center gap-2"><Info className="h-5 w-5 opacity-70" /> {property.bedrooms} Beds</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 md:px-12 py-16 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* Description */}
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">About this home</h2>
                            <p className={`text-lg text-slate-600 leading-relaxed whitespace-pre-line ${descExpanded ? "" : "line-clamp-4"}`}>
                                {property.description}
                            </p>
                            {!descExpanded ? (
                                <button onClick={() => setDescExpanded(true)} className="text-sm text-[#9D5F36] font-medium mt-2 hover:underline">
                                    Read more...
                                </button>
                            ) : (
                                <button onClick={() => setDescExpanded(false)} className="text-sm text-[#9D5F36] font-medium mt-2 hover:underline">
                                    Read less
                                </button>
                            )}

                            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <span className="block text-3xl font-bold text-slate-900 mb-1">{property.bedrooms}</span>
                                    <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">Beds</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <span className="block text-3xl font-bold text-slate-900 mb-1">{property.bathrooms}</span>
                                    <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">Bathrooms</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <span className="block text-3xl font-bold text-slate-900 mb-1">{property.sleeps}</span>
                                    <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">Guests</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <span className="block text-3xl font-bold text-slate-900 mb-1">4.98</span>
                                    <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-8">Premium Amenities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {property.amenities.map((amenity, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Check className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-slate-700">{amenity}</span>
                                    </div>
                                ))}
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                        <Wifi className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <span className="font-medium text-slate-700">Fast Wi-Fi</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                        <Car className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <span className="font-medium text-slate-700">Free Parking</span>
                                </div>
                            </div>
                        </div>

                        {/* Gallery */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold text-slate-900">Gallery</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-[500px]">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={cn(
                                        "relative rounded-2xl overflow-hidden group cursor-pointer",
                                        i === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
                                    )}>
                                        <Image
                                            src={orderedImages[i] || heroImage}
                                            alt={`Gallery image ${i + 1}`}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 md:p-8 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <Star className="h-24 w-24 text-slate-100 -rotate-12 fill-slate-100" />
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">Reserve Your Stay</h3>
                                    <p className="text-slate-500 text-sm mb-6">Best rates guaranteed when booking direct.</p>

                                    {property.hostawayId ? (
                                        <div className="mt-4">
                                            <HostawayCalendar listingId={property.hostawayId} />
                                        </div>
                                    ) : (
                                        <>
                                            <Button
                                                size="lg"
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-4 text-base font-semibold"
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent("open-booking", { detail: { propertyName: property.name } }))
                                                }}
                                            >
                                                Check Availability
                                            </Button>

                                            <p className="text-center text-xs text-slate-400">
                                                You won&apos;t be charged yet.
                                            </p>
                                        </>
                                    )}

                                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                                        <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                            <span className="flex items-center gap-2"><Anchor className="h-4 w-4" /> Boat Slip</span>
                                            <span className="text-green-600">Included</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                            <span className="flex items-center gap-2"><Utensils className="h-4 w-4" /> Concierge</span>
                                            <span className="text-green-600">Available</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <div className="h-24" />
            <FooterCTA />
        </div>
    )
}
