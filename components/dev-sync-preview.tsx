"use client"

import { useBooking } from "./booking-context"
import { useState, useEffect } from "react"
import { X, RefreshCw, ChevronRight } from "lucide-react"

export function DevSyncPreview() {
    const { startDate, endDate, location, guestCount } = useBooking()
    const [isVisible, setIsVisible] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        const hidden = localStorage.getItem('dev_sync_preview_hidden')
        if (hidden !== 'true') {
            setIsVisible(true)
        }
        setIsMounted(true)
    }, [])

    const handleClose = () => {
        setIsVisible(false)
        localStorage.setItem('dev_sync_preview_hidden', 'true')
    }

    if (!isMounted || !isVisible) return null

    return (
        <div className="fixed bottom-6 right-6 z-[99999] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-blue-500/20 w-80 relative overflow-hidden group">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Master v5</span>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                            <span className="text-[8px] text-slate-500 block mb-1 uppercase font-black tracking-tighter">Check-In</span>
                            <div className="text-sm font-mono font-bold text-white tracking-widest">
                                {startDate || "---"}
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                            <span className="text-[8px] text-slate-500 block mb-1 uppercase font-black tracking-tighter">Check-Out</span>
                            <div className="text-sm font-mono font-bold text-white tracking-widest">
                                {endDate || "---"}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-[8px] text-slate-500 block mb-0.5 uppercase font-black tracking-tighter">Location / Guests</span>
                            <div className="text-[10px] text-white font-bold truncate max-w-[140px]">
                                {location || "Global"} • {guestCount} Guests
                            </div>
                        </div>
                        <div className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-2 py-1 rounded inline-flex items-center gap-1">
                            <RefreshCw className="h-2 w-2 animate-spin-slow" /> LIVE
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 italic">Extraction Active (H1)</span>
                    <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-blue-500 transition-colors translate-x-0 group-hover:translate-x-1 duration-300" />
                </div>

                {/* Accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500"></div>
            </div>
        </div>
    )
}
