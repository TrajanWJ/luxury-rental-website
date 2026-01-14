"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"
import { AdvancedBookingPopup } from "./advanced-booking-popup"
import { properties } from "@/lib/data"
import Link from "next/link"
import Image from "next/image"

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveringProperties, setHoveringProperties] = useState(false)

  const [preselectedProperty, setPreselectedProperty] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleOpenBooking = (e: any) => {
      if (e.detail?.propertyName) {
        setPreselectedProperty(e.detail.propertyName)
      }
      setBookingOpen(true)
    }

    window.addEventListener("open-booking", handleOpenBooking)
    return () => window.removeEventListener("open-booking", handleOpenBooking)
  }, [])

  const navLinks = [
    { label: "Experiences", href: "#experiences" },
    { label: "Book", href: "/book" },
    { label: "Contact", href: "#contact" },
    { label: "Map Booking", href: "/map" },
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
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/5 backdrop-blur-xl border-b border-white/10 py-1.5"
          : "bg-transparent py-3"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 md:h-12">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <h1 className="text-lg md:text-xl font-bold text-white drop-shadow-md tracking-tight">
                Wilson Premier Properties
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">

              {navLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                  onClick={() => scrollToSection(link.href)}
                  className="transition-all duration-300 font-medium text-sm md:text-base text-white/90 hover:text-white hover:scale-105 drop-shadow-sm"
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
                  className="flex items-center gap-1 font-medium text-sm md:text-base text-white/90 hover:text-white transition-colors py-2"
                >
                  Properties <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${hoveringProperties ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {hoveringProperties && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden py-2 border border-slate-100 ring-1 ring-black/5"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <span className="text-xs font-semibold uppercase text-slate-400">Available Properties</span>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {properties.map((prop) => (
                          <Link key={prop.id} href={`/properties/${prop.name.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                              <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                                <Image src={prop.image} alt={prop.name} fill className="object-cover" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">{prop.name}</p>
                                <p className="text-xs text-slate-500">{prop.bedrooms} Bed • {prop.sleeps} Guests</p>
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
                  className="bg-white text-primary hover:bg-secondary hover:text-secondary-foreground rounded-full px-6 py-4 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-white/20"
                >
                  Book Now
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="md:hidden absolute top-20 left-4 right-4 py-8 bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl px-6 flex flex-col gap-6"
              >
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.href)}
                    className="text-left text-white/80 hover:text-white transition-colors font-medium py-3 text-lg border-b border-white/5"
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  onClick={() => {
                    setBookingOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="bg-secondary text-secondary-foreground w-full py-6 text-lg rounded-full"
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
          setPreselectedProperty("")
        }}
        searchParams={{
          location: preselectedProperty,
          checkIn: "",
          checkOut: "",
          guests: "1"
        }}
      />
    </>
  )
}
