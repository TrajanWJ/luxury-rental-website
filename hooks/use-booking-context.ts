"use client"

import { useState, useEffect } from "react"

export interface BookingContext {
    startDate: string | null
    endDate: string | null
}

export function useBookingContext() {
    const [context, setContext] = useState<BookingContext>({
        startDate: null,
        endDate: null
    })

    useEffect(() => {
        // Initial load
        if (typeof window !== 'undefined' && (window as any).bookingContext) {
            setContext((window as any).bookingContext)
        }

        // Listen for context updates
        const checkContext = () => {
            if (typeof window !== 'undefined' && (window as any).bookingContext) {
                const globalCtx = (window as any).bookingContext
                setContext(prev => {
                    if (prev.startDate !== globalCtx.startDate || prev.endDate !== globalCtx.endDate) {
                        return { ...globalCtx }
                    }
                    return prev
                })
            }
        }

        // We can use a custom event or just poll/rely on the MutationObserver indirectly?
        // Actually, hostaway-debug.js updates window.bookingContext and calls updateDevPopup.
        // I'll add a custom event dispatch to hostaway-debug.js to make this cleaner.

        const interval = setInterval(checkContext, 500) // Fallback polling

        window.addEventListener('bookingContextUpdated', checkContext as any)

        return () => {
            clearInterval(interval)
            window.removeEventListener('bookingContextUpdated', checkContext as any)
        }
    }, [])

    return context
}
