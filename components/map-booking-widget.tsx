"use client"

import { Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function MapBookingWidget() {
    const router = useRouter()

    // Matching styles with HeroBookingWidget for consistency
    const glassCardStyle = "bg-black/10 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl md:rounded-3xl p-3 md:p-[18px]"
    const labelStyle = "text-[9px] md:text-[11px] font-semibold uppercase tracking-[0.1em] md:tracking-[0.15em] text-white/60 ml-1 mb-1 md:mb-1.5 block text-center whitespace-nowrap"

    return (
        <div className={cn(glassCardStyle, "h-auto md:h-full w-full md:w-[120px] flex flex-col justify-end")}>
            <div className="w-full">
                <span className={labelStyle}>Map</span>
                <Button
                    onClick={() => router.push("/map")}
                    className="w-full h-[42px] md:h-[50px] rounded-xl md:rounded-2xl bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center p-0"
                >
                    <Map className="h-4 w-4 md:h-4.5 md:w-4.5" />
                </Button>
            </div>
        </div>
    )
}
