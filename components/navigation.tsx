"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { AdvancedBookingPopup } from "./advanced-booking-popup"
import { properties } from "@/lib/data"
import Link from "next/link"
import { useConcierge } from "./concierge-context"

export default function Navigation({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const CONTACT_CONCIERGE_FLAG = "open_concierge_on_home"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const { openContactModal } = useConcierge()
  const [scrolled, setScrolled] = useState(false)
  const [homesInView, setHomesInView] = useState(false)
  const [milanInView, setMilanInView] = useState(false)
  const [hoveringProperties, setHoveringProperties] = useState(false)

  const isDark = theme === "dark"
  const headerBase = isDark
    ? "bg-[#2B2B2B]/76 border-b border-[#BCA28A]/38 text-[#F1E8DC]"
    : "bg-[#ece4d8]/95 border-b border-[#1f1d1a]/15 text-[#24221e]"
  const headerScrolled = isDark
    ? "bg-[#25221D]/94 shadow-[0_14px_35px_rgba(0,0,0,0.36)]"
    : "bg-[#ece4d8]/98 shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
  const navText = isDark ? "text-[#E7D5BE]/92 hover:text-[#FCF6ED]" : "text-[#2b2925]/90 hover:text-[#1f1d1a]"
  const divider = isDark ? "bg-[#D8C6AF]/34" : "bg-[#1f1d1a]/20"
  const dropdownPanel = isDark
    ? "bg-[#25231f]/98 border-[#D8C6AF]/24 text-[#F0E6DA]"
    : "bg-[#f2ebe1] border-[#1f1d1a]/15 text-[#25231f]"
  const iconBtn = isDark
    ? "text-[#E7D5BE]/84 hover:text-[#FCF6ED] hover:bg-[#BCA28A]/16"
    : "text-[#25231f]/75 hover:text-[#1f1d1a] hover:bg-[#1f1d1a]/10"
  const desktopBookBtn = isDark
    ? "border-[#BCA28A]/70 text-[#F5ECDD] hover:bg-[#BCA28A] hover:text-[#1f1d1a]"
    : "border-[#2b2925]/35 text-[#25231f] hover:bg-[#25231f] hover:text-[#ece4d8]"
  const unscrolledShell = isDark
    ? `backdrop-blur-lg ${headerBase}`
    : headerBase

  const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "1"
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const homesSection = document.getElementById("homes")
      if (!homesSection) {
        setHomesInView(false)
        setMilanInView(false)
        return
      }

      const rect = homesSection.getBoundingClientRect()
      const navProbeY = 140
      setHomesInView(rect.top <= navProbeY && rect.bottom >= navProbeY)

      const probeX = Math.floor(window.innerWidth / 2)
      const probeY = navProbeY + 8
      const topElement = document.elementFromPoint(probeX, probeY)
      const activePanel = topElement?.closest<HTMLElement>("[data-property-slug]")
      const activeSlug = activePanel?.dataset.propertySlug || ""
      setMilanInView(activeSlug === "milan-manor-house")
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const onHome = window.location.pathname === "/" || window.location.pathname === ""
    if (!onHome) return

    const hasContactFlag = window.sessionStorage.getItem(CONTACT_CONCIERGE_FLAG) === "1"
    if (!hasContactFlag) return

    window.sessionStorage.removeItem(CONTACT_CONCIERGE_FLAG)

    const footer = document.querySelector("#contact")
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" })
    }
    window.setTimeout(() => openContactModal(), 650)
  }, [openContactModal])

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
    { label: "Our Pledge", href: "/pledge" },
    { label: "Lake Experiences", href: "#experiences" },
    { label: "House Rules", href: "/house-rules" },
    { label: "Concierge", href: "/contact" },
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

  const goToFooterAndOpenConcierge = () => {
    if (typeof window === "undefined") return
    const onHome = window.location.pathname === "/" || window.location.pathname === ""
    setMobileMenuOpen(false)

    if (onHome) {
      const footer = document.querySelector("#contact")
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" })
      }
      window.setTimeout(() => openContactModal(), 650)
      return
    }

    window.sessionStorage.setItem(CONTACT_CONCIERGE_FLAG, "1")
    window.location.href = "/#contact"
  }

  const showTransparentNav = homesInView && !milanInView

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-2 ${showTransparentNav ? "bg-transparent border-b border-transparent" : scrolled ? `backdrop-blur-lg ${headerBase} ${headerScrolled}` : unscrolledShell}`}
      >
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-6 lg:px-10 overflow-hidden">
          <div className="flex items-center justify-between h-[72px] md:h-[98px]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex-shrink-0 flex items-center gap-3"
            >
              <Link href="/" className="block shrink-0">
                <img
                  src="https://wilson-premier.com/wp-content/uploads/2023/12/Wilson-Premier-Logo_website_Linen.png"
                  alt="Wilson Premier"
                  width={300}
                  height={100}
                  className="h-[60px] w-auto object-contain sm:h-[68px] md:h-[100px]"
                />
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center gap-3 lg:gap-5">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index + 0.2 }}
                  onClick={() => {
                    if (link.label === "Concierge") {
                      goToFooterAndOpenConcierge()
                    } else {
                      scrollToSection(link.href)
                    }
                  }}
                  className={`transition-colors duration-300 font-semibold text-[12px] lg:text-[13px] uppercase tracking-[0.08em] whitespace-nowrap px-1 py-2 ${navText}`}
                >
                  {link.label}
                </motion.button>
              ))}

              <div
                className="relative group h-full flex items-center"
                onMouseEnter={() => setHoveringProperties(true)}
                onMouseLeave={() => setHoveringProperties(false)}
              >
                <button
                  onClick={() => scrollToSection("#homes")}
                  className={`flex items-center gap-1 font-semibold text-[12px] lg:text-[13px] uppercase tracking-[0.08em] whitespace-nowrap px-1 py-2 transition-colors ${navText}`}
                >
                  Retreats
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${hoveringProperties ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {hoveringProperties && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`absolute top-full right-0 mt-2 w-80 rounded-md shadow-2xl overflow-hidden py-2 border ring-1 ring-black/10 ${dropdownPanel}`}
                    >
                      <div className={`px-4 py-2 border-b ${isDark ? "border-[#d8c7af]/15" : "border-[#1f1d1a]/10"}`}>
                        <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-[#ece2d6]/70" : "text-[#25231f]/70"}`}>
                          Available Properties
                        </span>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {properties.map((prop) => (
                          <Link key={prop.id} href={`/properties/${prop.name.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                            <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${isDark ? "hover:bg-[#d8c7af]/8" : "hover:bg-[#1f1d1a]/6"}`}>
                              <div className={`h-12 w-16 rounded-md overflow-hidden shrink-0 ${isDark ? "bg-[#d8c7af]/10" : "bg-[#1f1d1a]/10"}`}>
                                <img src={prop.image} alt={prop.name} className="h-full w-full object-cover sepia-[.16]" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm font-serif">{prop.name}</p>
                                <p className={`text-[11px] ${isDark ? "text-[#ece2d6]/70" : "text-[#25231f]/70"}`}>
                                  {prop.bedrooms} Beds &middot; {prop.sleeps} Guests
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => scrollToSection("/real-estate")}
                className={`transition-colors duration-300 font-semibold text-[12px] lg:text-[13px] uppercase tracking-[0.08em] whitespace-nowrap px-1 py-2 ${navText}`}
              >
                Real Estate
              </button>

              <div className={`w-px h-7 ${divider}`} />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => window.location.href = '/map'}
                  className={`p-2.5 rounded-full transition-all ${iconBtn}`}
                  aria-label="Getting Here - Map"
                  title="Getting Here"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </button>
                <button
                  onClick={goToFooterAndOpenConcierge}
                  className={`p-2.5 rounded-full transition-all ${iconBtn}`}
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
                transition={{ delay: 0.55 }}
                className="pl-2"
              >
                <button
                  onClick={() => setBookingOpen(true)}
                  className={`rounded-full border px-6 py-2.5 text-[12px] lg:text-[13px] font-medium uppercase tracking-[0.1em] transition-colors ${desktopBookBtn}`}
                >
                  Book Now
                </button>
              </motion.div>
            </div>

            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={() => setBookingOpen(true)}
                className={`rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${desktopBookBtn}`}
                aria-label="Book Now"
              >
                Book Now
              </button>
              <button
                onClick={() => window.location.href = '/map'}
                className={`p-2 rounded-full transition-colors ${iconBtn}`}
                aria-label="Getting Here - Map"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </button>
              <button
                onClick={goToFooterAndOpenConcierge}
                className={`p-2 rounded-full transition-colors ${iconBtn}`}
                aria-label="Contact Concierge"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <div className={`w-px h-5 ${divider}`} />
              <button
                className={`flex flex-col justify-center items-center p-2 space-y-1.5 focus:outline-none z-50 transition-colors ${iconBtn}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className={`block w-[28px] h-[2px] ${isDark ? "bg-[#f7f0e7]" : "bg-[#1f1d1a]"}`}
                />
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className={`block w-[28px] h-[2px] ${isDark ? "bg-[#f7f0e7]" : "bg-[#1f1d1a]"}`}
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className={`block w-[28px] h-[2px] ${isDark ? "bg-[#f7f0e7]" : "bg-[#1f1d1a]"}`}
                />
              </button>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  className={`md:hidden absolute top-[102px] left-3 right-3 py-5 rounded-md shadow-2xl px-5 flex flex-col gap-1 border ${dropdownPanel}`}
                >
                  <Button
                    onClick={() => {
                      setBookingOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full py-3 text-base rounded-full mb-2 font-semibold min-h-[44px] ${isDark ? "bg-[#d8c7af] text-[#1f1d1a] hover:bg-[#e8d7bf]" : "bg-[#1f1d1a] text-[#ece4d8] hover:bg-[#2a2723]"}`}
                  >
                    Book Now
                  </Button>

                  {navLinks.map((link) => (
                    <div key={link.label}>
                      <button
                        onClick={() => {
                          if (link.label === "Concierge") {
                            goToFooterAndOpenConcierge()
                          } else {
                            scrollToSection(link.href)
                          }
                        }}
                        className={`w-full text-left transition-all font-medium py-3 text-base border-b min-h-[44px] flex items-center pl-0 ${
                          isDark
                            ? "text-[#ece2d6]/90 hover:text-[#f7f0e7] border-[#d8c7af]/12 hover:pl-2"
                            : "text-[#25231f]/90 hover:text-[#1f1d1a] border-[#1f1d1a]/12 hover:pl-2"
                        }`}
                      >
                        {link.label}
                      </button>

                      {link.label === "Concierge" && (
                        <div className={`flex justify-center py-4 border-b ${isDark ? "border-[#d8c7af]/12" : "border-[#1f1d1a]/12"}`}>
                          <img
                            src="https://wilson-premier.com/wp-content/uploads/2023/12/Wilson-Premier-Logo_website_Linen.png"
                            alt="Wilson Premier"
                            width={300}
                            height={100}
                            className="h-[72px] w-auto object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => scrollToSection("#homes")}
                    className={`text-left transition-colors font-medium py-3 text-base border-b min-h-[44px] flex items-center ${
                      isDark
                        ? "text-[#ece2d6]/90 hover:text-[#f7f0e7] border-[#d8c7af]/12"
                        : "text-[#25231f]/90 hover:text-[#1f1d1a] border-[#1f1d1a]/12"
                    }`}
                  >
                    Retreats
                  </button>
                  <button
                    onClick={() => scrollToSection("/real-estate")}
                    className={`text-left transition-colors font-medium py-3 text-base border-b min-h-[44px] flex items-center ${
                      isDark
                        ? "text-[#ece2d6]/90 hover:text-[#f7f0e7] border-[#d8c7af]/12"
                        : "text-[#25231f]/90 hover:text-[#1f1d1a] border-[#1f1d1a]/12"
                    }`}
                  >
                    Real Estate
                  </button>
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
