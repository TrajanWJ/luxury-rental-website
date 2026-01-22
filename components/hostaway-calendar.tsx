"use client"

import { useBookingContext } from "@/hooks/use-booking-context"
import { useMemo, useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

interface HostawayCalendarProps {
    listingId: string | number
}

/**
 * HostawayCalendar Component - Premium Glossy Implementation
 * --------------------------------------------------------
 * Latches saved dates on mount, prevents reloads, and provides a stunning
 * glassmorphism loading experience that matches the site's premium theme.
 */
export default function HostawayCalendar({ listingId }: HostawayCalendarProps) {
    const globalContext = useBookingContext()

    // Stable state for simulation parameters
    const [stableDates, setStableDates] = useState<{ start: string | null, end: string | null } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const hasAttemptedLatch = useRef(false)

    // Effect: Capture initial dates once per mount
    useEffect(() => {
        if (hasAttemptedLatch.current) return;

        if (globalContext.startDate && globalContext.endDate) {
            setStableDates({
                start: globalContext.startDate,
                end: globalContext.endDate
            });
            hasAttemptedLatch.current = true;
        } else {
            const timeout = setTimeout(() => {
                if (!hasAttemptedLatch.current) {
                    setStableDates({
                        start: globalContext.startDate || null,
                        end: globalContext.endDate || null
                    });
                    hasAttemptedLatch.current = true;
                }
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [globalContext.startDate, globalContext.endDate, listingId]);

    // (Reset logic handled by key={listingId} in parent)

    // Snappy loading delays
    useEffect(() => {
        if (!stableDates) return;
        const hasDates = !!(stableDates.start && stableDates.end);
        // Optimized: 300ms (sim), 50ms (blank)
        const delay = hasDates ? 300 : 50;

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, delay);

        return () => clearTimeout(timer);
    }, [stableDates]);

    // State Sync Listener
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'hostaway-dates-cleared') {
                if (typeof window !== 'undefined') {
                    const emptyState = { startDate: null, endDate: null };
                    (window as any).bookingContext = emptyState;
                    localStorage.setItem('bookingContext', JSON.stringify(emptyState));
                    window.dispatchEvent(new CustomEvent('bookingContextUpdated', { detail: emptyState }));
                }
            }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const embedUrl = useMemo(() => {
        if (!stableDates) return "";
        const start = stableDates.start || "";
        const end = stableDates.end || ""
        return `/hostaway-embed.html?listingId=${listingId}${start ? `&start=${start}` : ""}${end ? `&end=${end}` : ""}`
    }, [listingId, stableDates]);

    if (!stableDates) {
        return (
            <div className="w-[360px] h-[420px] bg-white flex items-center justify-center rounded-2xl shadow-xl">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-[360px] relative h-[420px] bg-white rounded-2xl overflow-hidden">
            {/* Glossy Loading Overlay - Premium Design */}
            <div
                className={`absolute inset-0 z-20 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
            >
                {/* Circular Glass Container for Spinner */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-full shadow-[0_8px_32px_rgba(37,99,235,0.15)] border border-white/50">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    </div>
                </div>

                {/* Text Styling following the Site Theme */}
                <div className="mt-6 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600/80">
                        Wilson Premier
                    </span>
                    <span className="text-[13px] font-medium text-slate-600">
                        Syncing availability...
                    </span>
                </div>
            </div>

            <iframe
                src={embedUrl}
                className={`w-full h-full border-0 bg-white block transition-transform duration-700 ${isLoading ? 'scale-95 blur-sm' : 'scale-100 blur-0'}`}
                title="Hostaway Calendar"
                scrolling="no"
                key={listingId}
            />
        </div>
    )
}
