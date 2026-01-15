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

export function HeroBookingWidget() {
    const { isDemoMode } = useDemo()
    const [location, setLocation] = React.useState("")
    const [date, setDate] = React.useState<DateRange | undefined>()
    const [guests, setGuests] = React.useState("2")

    // Filter properties based on Demo Mode
    const displayProperties = isDemoMode
        ? properties
        : properties.filter(p => !!p.hostawayId)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // Trigger the global booking popup with context
        window.dispatchEvent(new CustomEvent("open-booking-with-context", {
            detail: {
                propertyName: location && location !== "all" ? location : "",
                checkIn: date?.from ? format(date.from, "yyyy-MM-dd") : "",
                checkOut: date?.to ? format(date.to, "yyyy-MM-dd") : "",
                guests: guests
            }
        }))
    }

    // Custom unavailable logic for the calendar
    const isDateDisabled = (day: Date) => {
        return isDateUnavailable(day, location && location !== "all" ? properties.find(p => p.name === location)?.id : undefined)
    }

    // Refined Glass Card styles - More subtle and premium
    const glassCardStyle = "bg-white/8 backdrop-blur-lg border border-white/15 shadow-xl rounded-3xl p-5"
    const pillInputStyle = "h-11 bg-white/15 border-transparent text-white placeholder:text-white/60 rounded-full px-4 transition-all hover:bg-white/25 focus-visible:bg-white/25 focus-visible:ring-0 focus-visible:border-white/40 text-sm outline-none ring-0 w-full flex items-center"
    const labelStyle = "text-[10px] font-bold uppercase tracking-wider text-white/75 ml-3 mb-1.5 block"

    return (
        <>
            <div className={cn(glassCardStyle, "w-full")}>
                {/* Quick Booking Header */}
                <div className="mb-5 pb-3 border-b border-white/15">
                    <h3 className="text-lg font-bold text-white tracking-tight">Quick Booking</h3>
                    <p className="text-[10px] text-white/60 mt-1">Find your perfect property in seconds</p>
                </div>

                <form onSubmit={handleSearch} className="flex flex-col gap-3.5">

                    {/* Top Row: Property Selector */}
                    <div className="group">
                        <Label className={labelStyle}>
                            Property <span className="text-[9px] text-white/40 font-normal ml-1 lowercase">(optional)</span>
                        </Label>
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger className={cn(pillInputStyle, "justify-between text-left")}>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Home className="h-3.5 w-3.5 opacity-70 shrink-0" />
                                    <span className="truncate">{location && location !== "all" ? location : <span className="opacity-70">Select a Residence</span>}</span>
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 backdrop-blur-xl max-h-[300px]">
                                <SelectItem value="all" className="py-2.5 px-4 focus:bg-slate-100 font-medium text-sm">Any Residence</SelectItem>
                                {displayProperties.map(p => (
                                    <SelectItem key={p.id} value={p.name} className="py-2 px-4 focus:bg-slate-100 text-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                            <span className="font-medium">{p.name}</span>
                                            <span className="text-[10px] text-slate-500 font-normal">
                                                ({p.bedrooms} Beds, {p.sleeps} Guests)
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bottom Row: Dates, Guests, Action */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

                        {/* Date Range Picker */}
                        <div className="md:col-span-5 group relative">
                            <Label className={labelStyle}>
                                Dates <span className="text-[9px] text-white/40 font-normal ml-1 lowercase">(optional)</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"ghost"}
                                        className={cn(pillInputStyle, "justify-start text-left font-normal")}
                                    >
                                        <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
                                        {date?.from ? (
                                            date.to ? (
                                                <span className="truncate">
                                                    {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                                                </span>
                                            ) : (
                                                format(date.from, "MMM dd")
                                            )
                                        ) : (
                                            <span className="opacity-70">Check-in — Check-out</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-2xl overflow-hidden" align="start">
                                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                        <h4 className="font-semibold text-slate-900 text-sm">Select Your Stay</h4>
                                    </div>
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={1}
                                        disabled={(date) => isDateDisabled(date) || date < new Date()}
                                        className="p-3"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Guests */}
                        <div className="md:col-span-3 group">
                            <Label className={labelStyle}>
                                Guests <span className="text-[9px] text-white/40 font-normal ml-1 lowercase">(optional)</span>
                            </Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/70" />
                                <Input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    className={cn(pillInputStyle, "pl-9")}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-4">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl hover:shadow-white/20 active:scale-95 flex items-center justify-center gap-2 text-sm"
                            >
                                <span className="font-semibold tracking-wide">Explore Bookings</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}
