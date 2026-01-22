"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Users, Home, Search, ChevronDown, ArrowRight } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { properties, isDateUnavailable } from "@/lib/data"

import { useDemo } from "@/components/demo-context"

import { useBookingContext } from "@/hooks/use-booking-context"
import HostawayCalendar from "./hostaway-calendar"

export function HeroBookingWidget() {
    const { isDemoMode } = useDemo()
    const globalContext = useBookingContext()
    const [location, setLocation] = React.useState("")
    const [guests, setGuests] = React.useState("2")

    // Sync global context to local date state if needed, but we'll mostly rely on globalContext for display
    const checkIn = globalContext.startDate
    const checkOut = globalContext.endDate

    // Filter properties based on Demo Mode
    const displayProperties = isDemoMode
        ? properties
        : properties.filter(p => !!p.hostawayId)

    const selectedProperty = properties.find(p => p.name === location)
    const activeHostawayId = selectedProperty?.hostawayId || "466647" // Default to Suite Retreat if none selected

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // Trigger the global booking popup with context
        window.dispatchEvent(new CustomEvent("open-booking-with-context", {
            detail: {
                propertyName: location && location !== "all" ? location : "",
                checkIn: checkIn || "",
                checkOut: checkOut || "",
                guests: guests
            }
        }))
    }

    const formatReadableDate = (dateStr: string | null) => {
        if (!dateStr) return "";
        try {
            const [y, m, d] = dateStr.split('-').map(Number);
            return format(new Date(y, m - 1, d), "MMM d");
        } catch (e) {
            return dateStr;
        }
    }

    // Refined Glass Card styles - More subtle and premium
    const glassCardStyle = "bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-[18px]"
    const pillInputStyle = "h-[50px] bg-white/5 border border-white/10 text-white placeholder:text-white/50 rounded-2xl px-[14px] transition-all hover:bg-white/10 focus-visible:bg-white/10 focus-visible:border-white/30 text-sm md:text-base outline-none ring-0 w-full flex items-center"
    const labelStyle = "text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 ml-1 mb-1.5 block"

    return (
        <>
            <div className={cn(glassCardStyle, "w-full")}>
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-10 gap-[14px] items-end">

                    {/* Property Selector */}
                    <div className="md:col-span-3 group">
                        <Label className={labelStyle}>
                            Property
                        </Label>
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger className={cn(pillInputStyle, "!h-[50px] flex items-center justify-between text-left px-4")}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Home className="h-4 w-4 opacity-50 shrink-0" />
                                    <span className="truncate text-sm font-medium">{location && location !== "all" ? location : "Residence"}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-40 shrink-0" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-white/10 shadow-2xl bg-slate-900/95 backdrop-blur-xl text-white max-h-[300px]">
                                <SelectItem value="all" className="py-2.5 px-4 focus:bg-white/10 cursor-pointer font-medium text-sm">Any Residence</SelectItem>
                                {displayProperties.map(p => (
                                    <SelectItem key={p.id} value={p.name} className="py-2.5 px-4 focus:bg-white/10 cursor-pointer text-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                            <span className="font-medium">{p.name}</span>
                                            <span className="text-[11px] text-white/50 font-normal">
                                                ({p.bedrooms} Beds, {p.sleeps} Guests)
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range Picker */}
                    <div className="md:col-span-3 group relative">
                        <Label className={labelStyle}>
                            Dates
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"ghost"}
                                    className={cn(pillInputStyle, "!h-[50px] justify-start text-left font-normal")}
                                >
                                    <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                                    {checkIn ? (
                                        checkOut ? (
                                            <span className="truncate text-sm font-medium">
                                                {formatReadableDate(checkIn)} - {formatReadableDate(checkOut)}
                                            </span>
                                        ) : (
                                            <span className="truncate text-sm font-medium">
                                                {formatReadableDate(checkIn)}
                                            </span>
                                        )
                                    ) : (
                                        <span className="opacity-50 text-sm">Dates</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white/90 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden flex justify-center" align="center" sideOffset={8}>
                                <HostawayCalendar listingId={activeHostawayId} />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Guests */}
                    <div className="md:col-span-3 group">
                        <Label className={labelStyle}>
                            Guests
                        </Label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input
                                type="number"
                                min="1"
                                max="30"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className={cn(pillInputStyle, "!h-[50px] pl-11 text-sm font-medium")}
                                placeholder="1"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-1">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-[50px] rounded-2xl bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center px-0"
                        >
                            <Search className="h-4.5 w-4.5" />
                        </Button>
                    </div>
                </form >
            </div >
        </>
    )
}
