"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"
import { AdvancedBookingPopup } from "./advanced-booking-popup"
import { properties } from "@/lib/data"
import Link from "next/link"
import Image from "next/image"
import { DemoToggle } from "./demo-toggle"
import { useConcierge } from "./concierge-context"

export default function Navigation({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const { openContactModal } = useConcierge()
  const [scrolled, setScrolled] = useState(false)
  const [hoveringProperties, setHoveringProperties] = useState(false)

  // Theme-based styles
  const isDark = theme === "dark"
  const textColor = isDark ? "text-white" : "text-[#2B2B2B]"
  const textHover = isDark ? "hover:text-white" : "hover:text-black"
  const textMuted = isDark ? "text-white/90" : "text-[#2B2B2B]/80"

  const scrollBg = isDark
    ? "bg-white/5 backdrop-blur-xl border-b border-white/10 py-1.5"
    : "bg-[#ECE9E7]/80 backdrop-blur-xl border-b border-[#2B2B2B]/5 py-1.5"

  const buttonClass = isDark
    ? "bg-white text-primary hover:bg-secondary hover:text-white"
    : "bg-[#2B2B2B] text-[#ECE9E7] hover:bg-[#9D5F36]"

  const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "1"
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Handle simple booking event (just property name)
    const handleOpenBooking = (e: any) => {
      setSearchParams({
        location: e.detail?.propertyName || "",
        checkIn: "",
        checkOut: "",
        guests: "1"
      })
      setBookingOpen(true)
    }

    // Handle booking event with full context (property, dates, guests)
    const handleOpenBookingWithContext = (e: any) => {
      setSearchParams({
        location: e.detail?.propertyName || "",
        checkIn: e.detail?.checkIn || "",
        checkOut: e.detail?.checkOut || "",
        guests: e.detail?.guests || "1"
      })
      setBookingOpen(true)
    }

    window.addEventListener("open-booking", handleOpenBooking)
    window.addEventListener("open-booking-with-context", handleOpenBookingWithContext)
    return () => {
      window.removeEventListener("open-booking", handleOpenBooking)
      window.removeEventListener("open-booking-with-context", handleOpenBookingWithContext)
    }
  }, [])


  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Our Pledge", href: "#pledge" },
    { label: "Lake Experiences", href: "#experiences" },
    { label: "Contact Concierge", href: "/contact" },
    { label: "Getting Here", href: "/map" },
  ]

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      // Check if we're on the home page
      if (window.location.pathname === '/' || window.location.pathname === '') {
        // We're on home page, scroll directly
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      } else {
        // We're on another page, navigate to home with hash
        window.location.href = `/${href}`
      }
    } else {
      // Regular route navigation
      window.location.href = href
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* <DemoToggle /> */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? scrollBg
          : "bg-transparent py-3"
          }`}
      >
        <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-10 md:h-12">
            {/* Logo and Tagline - Integrated Design */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0 flex items-center"
            >
              <div className="hidden md:flex items-center pr-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Luxury Lakefront Vacation Rentals</p>
              </div>
              <div className="relative h-16 w-52 shrink-0">
                <Image
                  src="/brand/logo no background.png"
                  alt="Wilson Premier Properties"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">

              {navLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                  onClick={() => {
                    if (link.label === "Contact") {
                      openContactModal()
                    } else {
                      scrollToSection(link.href)
                    }
                  }}
                  className={`transition-all duration-300 font-medium text-sm md:text-base whitespace-nowrap ${textMuted} ${textHover} hover:scale-105 drop-shadow-sm`}
                >
                  {link.label}
                </motion.button>
              ))}

              {/* PROPERTIES DROPDOWN - Moved to right side */}
              <div
                className="relative group h-full flex items-center"
                onMouseEnter={() => setHoveringProperties(true)}
                onMouseLeave={() => setHoveringProperties(false)}
              >
                <button
                  onClick={() => scrollToSection("#homes")}
                  className={`flex items-center gap-1 font-medium text-sm md:text-base ${textMuted} ${textHover} transition-colors py-2`}
                >
                  Lakefront Retreats <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${hoveringProperties ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {hoveringProperties && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-card rounded-2xl shadow-2xl overflow-hidden py-2 border border-border ring-1 ring-black/5"
                    >
                      <div className="px-4 py-2 border-b border-border">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Available Properties</span>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {properties.map((prop) => (
                          <Link key={prop.id} href={`/properties/${prop.name.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/10 transition-colors">
                              <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-secondary/20">
                                <Image src={prop.image} alt={prop.name} fill className="object-cover sepia-[.15]" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm font-serif">{prop.name}</p>
                                <p className="text-xs text-muted-foreground">{prop.bedrooms} Bed • {prop.sleeps} Guests</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={() => setBookingOpen(true)}
                  className={`${buttonClass} rounded-full px-6 py-4 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-white/20 border-0`}
                >
                  Book Now
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button and Map Button */}
            <div className="md:hidden flex items-center gap-3">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => scrollToSection("/map")}
                className={`p-2 ${textColor} hover:scale-110 transition-transform`}
                aria-label="View Map"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-2 ${textColor}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="md:hidden absolute top-20 left-4 right-4 py-8 bg-[#2B2B2B]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl px-6 flex flex-col gap-6"
              >
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      if (link.label === "Contact") {
                        setMobileMenuOpen(false)
                        openContactModal()
                      } else {
                        scrollToSection(link.href)
                      }
                    }}
                    className="text-left text-white/80 hover:text-white transition-colors font-medium py-3 text-lg border-b border-white/5 font-serif"
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  onClick={() => {
                    setBookingOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="bg-primary text-primary-foreground w-full py-6 text-lg rounded-full"
                >
                  Book Now
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <AdvancedBookingPopup
        isOpen={bookingOpen}
        onClose={() => {
          setBookingOpen(false)
          setSearchParams({
            location: "",
            checkIn: "",
            checkOut: "",
            guests: "1"
          })
        }}
        searchParams={searchParams}
      />
    </>
  )
}
