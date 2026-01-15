"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { isDateUnavailable } from "@/lib/data"
import { AlertCircle } from "lucide-react"

interface HostawayCalendarProps {
    listingId: string
    baseUrl?: string
}

export default function HostawayCalendar({
    listingId,
    baseUrl = "https://wilson-premier.holidayfuture.com/"
}: HostawayCalendarProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [useDemo, setUseDemo] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date())

    const checkWidgetSuccess = () => {
        // Only switch to demo if we haven't already
        if (useDemo) return

        // Check if container has content injected by Hostaway
        if (containerRef.current) {
            const widgetDiv = containerRef.current.querySelector('#hostaway-calendar-widget')
            // If the widget div is empty or doesn't have significant content (height?), assume failure
            // Hostaway usually injects an iframe or substantial HTML
            if (widgetDiv && widgetDiv.children.length === 0) {
                console.log("Hostaway widget empty, switching to Demo mode")
                setUseDemo(true)
            }
        }
    }

    const initWidget = () => {
        if (typeof window !== 'undefined' && (window as any).hostawayCalendarWidget && containerRef.current) {
            // Clear container in case of re-renders but keep the target div
            containerRef.current.innerHTML = '<div id="hostaway-calendar-widget"></div>'

            try {
                (window as any).hostawayCalendarWidget({
                    baseUrl: baseUrl,
                    listingId: listingId,
                    numberOfMonths: 2,
                    openInNewTab: true,
                    font: 'Inter, sans-serif',
                    rounded: true,
                    button: {
                        action: 'checkout',
                        text: 'Book Stay',
                    },
                    clearButtonText: 'Clear dates',
                    color: {
                        mainColor: '#2563eb', // blue-600
                        frameColor: '#f1f5f9', // slate-100
                        textColor: '#0f172a', // slate-900
                    },
                })
            } catch (e) {
                console.error("Hostaway widget init failed:", e)
                setUseDemo(true)
            }

            // Check for success after a delay (give it time to fetch settings)
            setTimeout(checkWidgetSuccess, 3000)
        }
    }

    useEffect(() => {
        // Global timeout: if nothing happens in 4 seconds, force demo
        // This handles cases where the script loads but init fails silently or network blocks API
        const safetyTimer = setTimeout(() => {
            if (containerRef.current) {
                const widgetDiv = containerRef.current.querySelector('#hostaway-calendar-widget')
                if (!widgetDiv || widgetDiv.children.length === 0) {
                    setUseDemo(true)
                }
            }
        }, 4000)

        // Try to init if script is already cached/loaded
        if (typeof window !== 'undefined' && (window as any).hostawayCalendarWidget) {
            initWidget()
        }

        return () => clearTimeout(safetyTimer)
    }, [listingId])

    if (useDemo) {
        return (
            <div className="border border-slate-200 rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-3 rounded-xl mb-6 text-xs font-bold uppercase tracking-wide border border-amber-100">
                    <AlertCircle className="h-4 w-4" />
                    DEMO / Not Connected to Hostaway
                </div>

                <div className="flex flex-col items-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => isDateUnavailable(d, listingId)}
                        className="rounded-xl border border-slate-100 mb-6 bg-slate-50/50"
                    />
                    <Button
                        disabled
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-12 font-semibold"
                    >
                        Check Availability (Demo)
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <Script
                src="https://d2q3n06xhbi0am.cloudfront.net/calendar.js"
                onLoad={initWidget}
                onError={() => setUseDemo(true)}
            />
            <div ref={containerRef} className="hostaway-calendar-container min-h-[400px]">
                <div id="hostaway-calendar-widget"></div>
            </div>
        </>
    )
}
