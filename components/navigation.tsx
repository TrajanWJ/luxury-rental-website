"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Menu, X } from "lucide-react"
import { AdvancedBookingPopup } from "./advanced-booking-popup"
import { properties } from "@/lib/data"
import Link from "next/link"
import { useConcierge } from "./concierge-context"
import { useSiteConfig } from "./site-config-context"
import { usePhotoOrder } from "@/components/photo-order-context"
import { trackCtaClick, trackPopupOpen } from "@/lib/analytics"

export default function Navigation({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const CONTACT_CONCIERGE_FLAG = "open_concierge_on_home"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const { openContactModal } = useConcierge()
  const photoOrder = usePhotoOrder()
  const { isSectionEnabled } = useSiteConfig()
  const insidersGuideEnabled = isSectionEnabled("str", "insidersGuide")

  const [scrolled, setScrolled] = useState(false)
  const [homesInView, setHomesInView] = useState(false)
  const [milanInView, setMilanInView] = useState(false)


  const isDark = theme === "dark"
  const logoSrc = isDark ? "/brand/logo-bold-light.png" : "/brand/logo-bold-charcoal.png"
  const headerBase = isDark
    ? "bg-[#2B2B2B]/76 border-b border-[#BCA28A]/38 text-[#F1E8DC]"
    : "bg-[#ece4d8]/95 border-b border-[#1f1d1a]/15 text-[#24221e]"
  const headerScrolled = isDark
    ? "bg-[#25221D]/94 shadow-[0_14px_35px_rgba(0,0,0,0.36)]"
    : "bg-[#ece4d8]/98 shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
  const navText = isDark ? "text-[#E7D5BE]/92 hover:text-[#FCF6ED]" : "text-[#2b2925]/90 hover:text-[#1f1d1a]"
  const divider = isDark ? "bg-[#D8C6AF]/34" : "bg-[#1f1d1a]/20"

  const iconBtn = isDark
    ? "text-[#E7D5BE]/84 hover:text-[#FCF6ED] hover:bg-[#BCA28A]/16"
    : "text-[#25231f]/75 hover:text-[#1f1d1a] hover:bg-[#1f1d1a]/10"
  const desktopBookBtn = isDark
    ? "border-[#BCA28A]/70 text-[#F5ECDD] hover:bg-[#BCA28A] hover:text-[#1f1d1a]"
    : "border-[#2b2925]/35 text-[#25231f] hover:bg-[#25231f] hover:text-[#ece4d8]"
  const unscrolledShell = isDark
    ? `backdrop-blur-lg ${headerBase}`
    : headerBase

  const vt = {
    // Single nav profile: A with B-quality controls and spacing
    bbH: "md:h-[64px]",
    cbH: "h-[44px]",
    mobBbH: "h-[56px]",
    logoH: "h-[48px] sm:h-[52px] md:h-[58px]",
    linkSz: "text-[11px]",
    linkGap: "gap-6",
    ctaSz: "text-[11px]",
    ctaPx: "px-6 py-2.5",
    iconSz: "h-8 w-8",
    showTopIcons: true,
    showTopBook: true,
    contextHasBorder: false,
  }

  const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)

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
    if (footer) footer.scrollIntoView({ behavior: "smooth" })
    window.setTimeout(() => openContactModal(), 650)
  }, [openContactModal])

  useEffect(() => {
    const handleOpenBooking = (e: any) => {
      trackPopupOpen(
        "booking",
        e.detail?.propertyName ? { propertyName: e.detail.propertyName, context: "global-event" } : { context: "global-event" },
      )
      setSearchParams({
        location: e.detail?.propertyName || "",
        checkIn: "",
        checkOut: "",
        guests: "1",
      })
      setBookingOpen(true)
    }

    const handleOpenBookingWithContext = (e: any) => {
      trackPopupOpen(
        "booking",
        e.detail?.propertyName ? { propertyName: e.detail.propertyName, context: "global-event" } : { context: "global-event" },
      )
      setSearchParams({
        location: e.detail?.propertyName || "",
        checkIn: e.detail?.checkIn || "",
        checkOut: e.detail?.checkOut || "",
        guests: e.detail?.guests || "1",
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

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const navLinks = [
    { label: "Home", href: "#homes" },
    { label: "Our Pledge", href: "#pledge" },
    { label: "Lake Experiences", href: insidersGuideEnabled ? "#experiences" : "#concierge-directory" },
    { label: "House Rules", href: "/house-rules" },
    { label: "Concierge", href: "#contact" },
  ]

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      if (window.location.pathname === "/" || window.location.pathname === "") {
        const element = document.querySelector(href)
        if (element) element.scrollIntoView({ behavior: "smooth" })
      } else {
        window.location.href = `/${href}`
      }
    } else {
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
      if (footer) footer.scrollIntoView({ behavior: "smooth" })
      window.setTimeout(() => openContactModal(), 650)
      return
    }

    window.sessionStorage.setItem(CONTACT_CONCIERGE_FLAG, "1")
    window.location.href = "/#contact"
  }

  const showTransparentNav = homesInView && !milanInView
  const shellClass = showTransparentNav
    ? "bg-transparent border-b border-transparent"
    : scrolled
      ? `backdrop-blur-lg ${headerBase} ${headerScrolled}`
      : isDark
        ? `backdrop-blur-lg ${headerBase}`
        : headerBase

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${shellClass}`}
      >
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-6 lg:px-10">
          <div className={`flex items-center justify-between ${vt.mobBbH} ${vt.bbH}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex-shrink-0"
            >
              <Link href="/" className="block shrink-0">
                <img
                  src={logoSrc}
                  alt="Wilson Premier"
                  width={300}
                  height={100}
                  className={`w-auto object-contain ${vt.logoH} [image-rendering:-webkit-optimize-contrast] contrast-110 saturate-105`}
                />
              </Link>
            </motion.div>

            <div className={`hidden md:flex items-center ${vt.linkGap} ml-8`}>
              {navLinks.map((link) => (
                <button
                  key={`nav-${link.label}`}
                  onClick={() => {
                    if (link.label === "Concierge") goToFooterAndOpenConcierge()
                    else scrollToSection(link.href)
                  }}
                  className={`transition-colors duration-300 font-semibold uppercase tracking-[0.08em] whitespace-nowrap ${navText} ${vt.linkSz}`}
                >
                  {link.label}
                </button>
              ))}

              <button
                onClick={() => scrollToSection("#homes")}
                className={`flex items-center gap-1 font-semibold uppercase tracking-[0.08em] whitespace-nowrap transition-colors ${navText} ${vt.linkSz}`}
              >
                Retreats
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollToSection("/real-estate")}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 uppercase tracking-[0.1em] font-semibold transition-colors ${vt.linkSz} ${
                  isDark
                    ? "border-[#d8c7af]/28 text-[#E7D5BE]/86 hover:text-[#FCF6ED] hover:border-[#d8c7af]/48"
                    : "border-[#2b2925]/20 text-[#2b2925]/75 hover:text-[#2b2925] hover:border-[#2b2925]/40"
                }`}
              >
                Real Estate
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <div className={`h-4 w-px mx-1 ${divider}`} />
              {vt.showTopIcons && (
                <>
                  <button
                    onClick={() => (window.location.href = "/map")}
                    className={`${vt.iconSz} inline-flex items-center justify-center rounded-full transition-all ${iconBtn}`}
                    aria-label="Getting Here - Map"
                    title="Getting Here"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      trackCtaClick("contact", { context: "nav-desktop" })
                      goToFooterAndOpenConcierge()
                    }}
                    className={`${vt.iconSz} inline-flex items-center justify-center rounded-full transition-all ${iconBtn}`}
                    aria-label="Contact Concierge"
                    title="Contact Concierge"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </>
              )}
              {vt.showTopBook && (
                <button
                  onClick={() => {
                    trackCtaClick("book-now", { context: "nav-desktop" })
                    trackPopupOpen("booking", { context: "nav-desktop" })
                    setBookingOpen(true)
                  }}
                  className={`rounded-full border font-medium uppercase tracking-[0.1em] transition-colors ${desktopBookBtn} ${vt.ctaPx} ${vt.ctaSz}`}
                >
                  Book Now
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={() => {
                  trackCtaClick("book-now", { context: "nav-mobile" })
                  trackPopupOpen("booking", { context: "nav-mobile" })
                  setBookingOpen(true)
                }}
                className={`rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${desktopBookBtn}`}
              >
                Book Now
              </button>
              <button
                onClick={() => (window.location.href = "/map")}
                className={`${vt.iconSz} inline-flex items-center justify-center rounded-full transition-colors ${iconBtn}`}
                aria-label="Getting Here - Map"
                title="Getting Here"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </button>
              <button
                onClick={() => {
                  trackCtaClick("contact", { context: "nav-mobile" })
                  goToFooterAndOpenConcierge()
                }}
                className={`${vt.iconSz} inline-flex items-center justify-center rounded-full transition-colors ${iconBtn}`}
                aria-label="Contact Concierge"
                title="Contact Concierge"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <button
                className={`${vt.iconSz} inline-flex items-center justify-center rounded-full transition-colors ${iconBtn}`}
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-40 md:hidden ${isDark ? "bg-[#201d19]/95" : "bg-[#ece4d8]/95"} backdrop-blur-lg`}
          >
            <div className={`pt-[72px] px-5 pb-8 h-full overflow-y-auto ${isDark ? "text-[#ECE2D6]" : "text-[#25231F]"}`}>
              <div className="rounded-2xl border border-white/10 p-4 mb-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#BCA28A]/70 mb-3">Vacation Rentals</p>
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => {
                        if (link.label === "Concierge") {
                          trackCtaClick("contact", { context: "nav-mobile" })
                          goToFooterAndOpenConcierge()
                        } else {
                          scrollToSection(link.href)
                        }
                      }}
                      className="w-full text-left px-3 py-3 rounded-lg hover:bg-white/5 text-[15px]"
                    >
                      {link.label}
                    </button>
                  ))}
                  <button
                    onClick={() => scrollToSection("#homes")}
                    className="w-full text-left px-3 py-3 rounded-lg hover:bg-white/5 text-[15px]"
                  >
                    Retreats
                  </button>
                  <button
                    onClick={() => (window.location.href = "/map")}
                    className="w-full text-left px-3 py-3 rounded-lg hover:bg-white/5 text-[15px]"
                  >
                    Getting Here
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 p-4 mb-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#BCA28A]/70 mb-3">Real Estate</p>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    window.location.href = "/real-estate"
                  }}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-white/5 text-[15px]"
                >
                  Explore Real Estate
                </button>
              </div>

              <button
                onClick={() => {
                  trackCtaClick("book-now", { context: "nav-mobile" })
                  trackPopupOpen("booking", { context: "nav-mobile" })
                  setBookingOpen(true)
                  setMobileMenuOpen(false)
                }}
                className={`w-full rounded-full border uppercase tracking-[0.1em] font-medium ${desktopBookBtn} ${vt.ctaPx} ${vt.ctaSz}`}
              >
                Book Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdvancedBookingPopup
        isOpen={bookingOpen}
        onClose={() => {
          setBookingOpen(false)
          setSearchParams({ location: "", checkIn: "", checkOut: "", guests: "1" })
        }}
        searchParams={searchParams}
      />
    </>
  )
}
