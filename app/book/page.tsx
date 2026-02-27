"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, Users, MapPin, CreditCard, Lock, Check, ArrowLeft, ChevronDown } from "lucide-react"
import { properties } from "@/lib/data"
import { usePhotoOrder } from "@/components/photo-order-context"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { useDemo } from "@/components/demo-context"
import { useBookingContext } from "@/hooks/use-booking-context"
import HostawayCalendar from "@/components/hostaway-calendar"

function BookContent() {
    const { getHeroImage } = usePhotoOrder()
    const { isDemoMode } = useDemo()
    const searchParams = useSearchParams()
    const router = useRouter()
    const globalContext = useBookingContext()

    // Get booking details from URL params or set defaults
    const [selectedPropertyName, setSelectedPropertyName] = useState(searchParams.get("property") || "")
    const [guestCount, setGuestCount] = useState(parseInt(searchParams.get("guests") || "2"))

    // Sync global context to component state
    const checkIn = globalContext.startDate
    const checkOut = globalContext.endDate

    const property = properties.find(p => p.name === selectedPropertyName)
    const activeHostawayId = property?.hostawayId || "466648"

    // Filter properties based on Demo Mode
    const displayProperties = isDemoMode
        ? properties
        : properties.filter(p => !!p.hostawayId)

    const [paymentStep, setPaymentStep] = useState<"details" | "payment" | "confirmation">("details")
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
        billingZip: ""
    })

    // Calculate nights and total (demo pricing)
    const nights = (checkIn && checkOut) ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0
    const pricePerNight = property ? (property.bedrooms * 150 + property.sleeps * 50) : 500
    const subtotal = nights * pricePerNight
    const cleaningFee = 150
    const serviceFee = Math.round(subtotal * 0.12)
    const total = subtotal + cleaningFee + serviceFee

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (paymentStep === "details") {
            setPaymentStep("payment")
        } else if (paymentStep === "payment") {
            // Simulate payment processing
            setTimeout(() => {
                setPaymentStep("confirmation")
            }, 1500)
        }
    }

    // Update URL when booking details change
    useEffect(() => {
        if (selectedPropertyName && checkIn && checkOut) {
            const params = new URLSearchParams({
                property: selectedPropertyName,
                checkIn: checkIn,
                checkOut: checkOut,
                guests: guestCount.toString()
            })
            router.replace(`/book?${params.toString()}`, { scroll: false })
        }
    }, [selectedPropertyName, checkIn, checkOut, guestCount, router])

    if (paymentStep === "confirmation") {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="fixed top-0 left-0 right-0 h-24 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 z-40" />
                <Navigation />

                <div className="container mx-auto px-4 py-24 max-w-2xl">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 text-center">
                        {isDemoMode && property?.hostawayId ? (
                            <div className="flex flex-col items-center">
                                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                                    <Check className="h-10 w-10 text-amber-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-4">PLACEHOLDER FOR HOSTAWAY FINAL BOOKING</h1>
                                <p className="text-lg text-slate-600 mb-8">
                                    In production, the customer would have been redirected to the Hostaway checkout page for <span className="font-semibold">{property?.name}</span>.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                                    <Check className="h-10 w-10 text-green-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-4">Booking Confirmed!</h1>
                                <p className="text-lg text-slate-600 mb-8">
                                    Your reservation at <span className="font-semibold">{property?.name}</span> has been confirmed.
                                </p>
                            </>
                        )}

                        <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Confirmation #</span>
                                    <span className="font-mono font-semibold">WPP-{Date.now().toString().slice(-8)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Check-in</span>
                                    <span className="font-semibold">{checkIn || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Check-out</span>
                                    <span className="font-semibold">{checkOut || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Guests</span>
                                    <span className="font-semibold">{guestCount}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-slate-200">
                                    <span className="text-slate-900 font-semibold">Total Paid</span>
                                    <span className="text-xl font-bold text-blue-600">${total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 mb-6">
                            A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>
                        </p>

                        <Button size="lg" onClick={() => router.push("/")} className="w-full">
                            Return to Home
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="fixed top-0 left-0 right-0 h-24 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 z-40" />
            <Navigation />

            <div className="container mx-auto px-4 py-24">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                {/* Editable Booking Widget */}
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-3xl p-6 mb-8 max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Your Booking Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        {/* Property Selector */}
                        <div>
                            <Label className="text-xs font-semibold text-slate-700 mb-2 block">Property</Label>
                            <Select value={selectedPropertyName} onValueChange={setSelectedPropertyName}>
                                <SelectTrigger className="h-12 bg-white border-slate-200">
                                    <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                                <SelectContent>
                                    {displayProperties.map((prop) => (
                                        <SelectItem key={prop.id} value={prop.name}>
                                            {prop.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range Picker */}
                        <div className="md:col-span-2">
                            <Label className="text-xs font-semibold text-slate-700 mb-2 block">Dates</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-12 justify-start text-left font-normal bg-white border-slate-200",
                                            !checkIn && "text-slate-500"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {checkIn ? (
                                            checkOut ? (
                                                <>
                                                    {checkIn} - {checkOut}
                                                </>
                                            ) : (
                                                checkIn
                                            )
                                        ) : (
                                            <span>Select dates</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-4" align="start">
                                    <div className="min-w-[320px]">
                                        <HostawayCalendar listingId={activeHostawayId} />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Guests */}
                        <div>
                            <Label className="text-xs font-semibold text-slate-700 mb-2 block">Guests</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={guestCount}
                                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                                    className="h-12 pl-10 bg-white border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    {!property && (
                        <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
                            <span className="font-semibold">⚠</span> Please select a property to continue
                        </p>
                    )}
                    {property && (!checkIn || !checkOut) && (
                        <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
                            <span className="font-semibold">⚠</span> Please select check-in and check-out dates
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Booking Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {paymentStep === "details" ? "Your Information" : "Payment Details"}
                            </h1>
                            <p className="text-slate-600 mb-8">
                                {property ? `Complete your booking for ${property.name}` : "Select a property to continue"}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {paymentStep === "details" && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 mb-2 block">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    required
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="h-12"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700 mb-2 block">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    required
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="h-12"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 mb-2 block">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="h-12"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 mb-2 block">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="h-12"
                                            />
                                        </div>
                                    </>
                                )}

                                {paymentStep === "payment" && (
                                    <>
                                        <div>
                                            <Label htmlFor="cardNumber" className="text-sm font-semibold text-slate-700 mb-2 block">Card Number</Label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                <Input
                                                    id="cardNumber"
                                                    placeholder="1234 5678 9012 3456"
                                                    required
                                                    value={formData.cardNumber}
                                                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                                                    className="h-12 pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2">
                                                <Label htmlFor="expiry" className="text-sm font-semibold text-slate-700 mb-2 block">Expiry Date</Label>
                                                <Input
                                                    id="expiry"
                                                    placeholder="MM/YY"
                                                    required
                                                    value={formData.expiry}
                                                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                                    className="h-12"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="cvv" className="text-sm font-semibold text-slate-700 mb-2 block">CVV</Label>
                                                <Input
                                                    id="cvv"
                                                    placeholder="123"
                                                    required
                                                    value={formData.cvv}
                                                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                                    className="h-12"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="billingZip" className="text-sm font-semibold text-slate-700 mb-2 block">Billing ZIP Code</Label>
                                            <Input
                                                id="billingZip"
                                                placeholder="12345"
                                                required
                                                value={formData.billingZip}
                                                onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })}
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl">
                                            <Lock className="h-5 w-5 text-blue-600 shrink-0" />
                                            <p className="text-sm text-blue-900">Your payment information is encrypted and secure</p>
                                        </div>
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-14 text-base font-semibold"
                                    disabled={!property || !checkIn || !checkOut}
                                >
                                    {paymentStep === "details" ? "Continue to Payment" : "Complete Booking"}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                            {property ? (
                                <>
                                    <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                                        <Image
                                            src={getHeroImage(property)}
                                            alt={property.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-4">{property.name}</h3>

                                    <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>
                                                {checkIn && checkOut ? (
                                                    `${checkIn} - ${checkOut}`
                                                ) : "Dates not selected"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Users className="h-4 w-4" />
                                            <span>{guestCount} Guests</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>Smith Mountain Lake, VA</span>
                                        </div>
                                    </div>

                                    {nights > 0 && (
                                        <>
                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">${pricePerNight} x {nights} nights</span>
                                                    <span className="font-semibold">${subtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Cleaning fee</span>
                                                    <span className="font-semibold">${cleaningFee}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Service fee</span>
                                                    <span className="font-semibold">${serviceFee}</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-slate-900">Total</span>
                                                    <span className="text-2xl font-bold text-blue-600">${total.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-500">Select a property to see pricing details</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default function BookPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
            </div>
        }>
            <BookContent />
        </Suspense>
    )
}
