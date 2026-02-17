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
    { label: "House Rules", href: "/house-rules" },
    { label: "Contact Concierge", href: "/contact" },
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
          : "bg-transparent py-2 md:py-3"
          }`}
      >
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-16">

            {/* ─── LEFT: Logo + Quick Actions ─── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0 flex items-center gap-2 md:gap-3"
            >
              {/* Chat button — mobile only, left of logo */}
              <button
                onClick={() => openContactModal()}
                className={`md:hidden p-2.5 rounded-full transition-all ${isDark ? "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20" : "bg-[#2B2B2B]/10 border border-[#2B2B2B]/20 text-[#2B2B2B] hover:bg-[#2B2B2B]/20"}`}
                aria-label="Contact Concierge"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              {/* Logo — bold processed variants, no CSS filter hacks */}
              <Link href="/" className="block">
                <div className="relative h-14 w-48 md:h-[52px] md:w-56 shrink-0">
                  <Image
                    src={isDark ? "/brand/logo-bold-linen.png" : "/brand/logo-bold-charcoal.png"}
                    alt="Wilson Premier Properties"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>

              {/* Tagline — desktop lg+ only */}
              <div className="hidden lg:flex items-center gap-3 pl-2">
                <div className={`h-8 w-px ${isDark ? "bg-white/20" : "bg-[#2B2B2B]/15"}`} />
                <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap ${isDark ? "text-white/70" : "text-[#2B2B2B]/60"}`}>
                  Luxury Lakefront Vacation Rentals
                </p>
              </div>
            </motion.div>

            {/* ─── RIGHT: Desktop Navigation ─── */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                  onClick={() => {
                    if (link.label === "Contact Concierge") {
                      scrollToSection("#footer")
                      setTimeout(() => openContactModal(), 600)
                    } else {
                      scrollToSection(link.href)
                    }
                  }}
                  className={`transition-all duration-300 font-medium text-[13px] lg:text-sm whitespace-nowrap px-1 py-2 ${textMuted} ${textHover} hover:scale-105`}
                >
                  {link.label}
                </motion.button>
              ))}

              {/* Properties Dropdown */}
              <div
                className="relative group h-full flex items-center"
                onMouseEnter={() => setHoveringProperties(true)}
                onMouseLeave={() => setHoveringProperties(false)}
              >
                <button
                  onClick={() => scrollToSection("#homes")}
                  className={`flex items-center gap-1 font-medium text-[13px] lg:text-sm whitespace-nowrap px-1 py-2 ${textMuted} ${textHover} transition-colors`}
                >
                  Lakefront Retreats <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${hoveringProperties ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {hoveringProperties && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-card rounded-2xl shadow-2xl overflow-hidden py-2 border border-border ring-1 ring-black/5"
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
                                <p className="text-xs text-muted-foreground">{prop.bedrooms} Bedrooms &middot; {prop.sleeps} Guests</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop icon buttons: Map + Chat */}
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  onClick={() => window.location.href = '/map'}
                  className={`p-2.5 rounded-full transition-all ${isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-[#2B2B2B]/60 hover:text-[#2B2B2B] hover:bg-[#2B2B2B]/10"}`}
                  aria-label="Getting Here - Map"
                  title="Getting Here"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </button>
                <button
                  onClick={() => openContactModal()}
                  className={`p-2.5 rounded-full transition-all ${isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-[#2B2B2B]/60 hover:text-[#2B2B2B] hover:bg-[#2B2B2B]/10"}`}
                  aria-label="Contact Concierge"
                  title="Contact Concierge"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={() => setBookingOpen(true)}
                  className={`${buttonClass} rounded-full px-5 py-2.5 text-[13px] lg:text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-white/20 border-0`}
                >
                  Book Now
                </Button>
              </motion.div>
            </div>

            {/* ─── RIGHT: Mobile Actions ─── */}
            <div className="md:hidden flex items-center gap-2.5">
              <button
                onClick={() => window.location.href = '/map'}
                className={`backdrop-blur-md border p-2.5 rounded-full transition-all shadow-sm ${isDark ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-[#2B2B2B]/10 border-[#2B2B2B]/20 text-[#2B2B2B] hover:bg-[#2B2B2B]/20"}`}
                aria-label="Getting Here - Map"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </button>

              <button
                className="flex flex-col justify-center items-center w-11 h-11 space-y-1.5 focus:outline-none z-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className={`block w-7 h-0.5 ${isDark ? "bg-white" : "bg-[#2B2B2B]"}`}
                />
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className={`block w-7 h-0.5 ${isDark ? "bg-white" : "bg-[#2B2B2B]"}`}
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className={`block w-7 h-0.5 ${isDark ? "bg-white" : "bg-[#2B2B2B]"}`}
                />
              </button>
            </div>

            {/* ─── Mobile Menu Overlay ─── */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  className="md:hidden absolute top-[76px] left-3 right-3 py-6 bg-[#2B2B2B]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl px-5 flex flex-col gap-1"
                >
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => {
                        if (link.label === "Contact Concierge") {
                          setMobileMenuOpen(false)
                          scrollToSection("#footer")
                          setTimeout(() => openContactModal(), 600)
                        } else {
                          scrollToSection(link.href)
                        }
                      }}
                      className="text-left text-white/80 hover:text-white transition-colors font-medium py-3 text-base border-b border-white/5 font-serif min-h-[44px] flex items-center"
                    >
                      {link.label}
                    </button>
                  ))}

                  {/* Lakefront Retreats in mobile menu */}
                  <button
                    onClick={() => scrollToSection("#homes")}
                    className="text-left text-white/80 hover:text-white transition-colors font-medium py-3 text-base border-b border-white/5 font-serif min-h-[44px] flex items-center"
                  >
                    Lakefront Retreats
                  </button>

                  <Button
                    onClick={() => {
                      setBookingOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="bg-white text-[#2B2B2B] hover:bg-white/90 w-full py-3.5 text-base rounded-full mt-3 font-semibold min-h-[44px]"
                  >
                    Book Now
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
