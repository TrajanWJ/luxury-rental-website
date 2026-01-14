"use client"

import { Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function MapBookingWidget() {
    const router = useRouter()

    const glassCardStyle = "bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg rounded-3xl"

    return (
        <div className={cn(glassCardStyle, "w-full h-full flex flex-col justify-center p-6 lg:p-8")}>
            {/* Map Booking Header */}
            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                    <Map className="h-6 w-6 text-white/90" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mb-2">View Map</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                    Explore all properties on an interactive map
                </p>
            </div>

            {/* CTA Button */}
            <Button
                onClick={() => router.push("/map")}
                size="default"
                className="w-full h-11 rounded-full bg-white/90 text-slate-900 hover:bg-white transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 text-sm font-semibold"
            >
                <Map className="h-4 w-4" />
                <span className="tracking-wide">Explore Map</span>
            </Button>
        </div>
    )
}
