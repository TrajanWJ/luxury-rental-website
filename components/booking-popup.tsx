"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { usePopupFreeze } from "@/hooks/use-popup-freeze"

interface BookingPopupProps {
  isOpen: boolean
  onClose: () => void
  initialLocation?: string
}

export function BookingPopup({ isOpen, onClose, initialLocation }: BookingPopupProps) {
  usePopupFreeze(isOpen)
  const [location, setLocation] = useState(initialLocation || "Smith Mountain Lake, VA")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState("2")

  useEffect(() => {
    if (isOpen && initialLocation) {
      setLocation(initialLocation)
    } else if (isOpen && !initialLocation) {
      setLocation("Smith Mountain Lake, VA")
    }
  }, [isOpen, initialLocation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const homesSection = document.querySelector("#homes")
    if (homesSection) {
      homesSection.scrollIntoView({ behavior: "smooth" })
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div data-popup-root className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Popup Card */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Book Your Luxury Stay at Wilson Premier</h2>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Smith Mountain Lake, VA"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Check-in</label>
              <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Check-out</label>
              <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Guests</label>
              <Input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
          >
            Search Stays
          </Button>
        </form>
      </div>
    </div>
  )
}
