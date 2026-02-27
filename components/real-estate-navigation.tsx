"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "About SML", href: "/real-estate#about-sml", anchor: "#about-sml" },
  { label: "SML Life", href: "/real-estate#sml-life", anchor: "#sml-life" },
  { label: "Market", href: "/real-estate#market", anchor: "#market" },
  { label: "About Craig", href: "/real-estate/about", anchor: null },
  { label: "Contact", href: "/real-estate/contact", anchor: null },
]

export default function RealEstateNavigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  const handleNavClick = useCallback(
    (link: (typeof NAV_LINKS)[number]) => {
      setMobileMenuOpen(false)

      // Anchor link (has a hash target on the hub page)
      if (link.anchor) {
        if (pathname === "/real-estate") {
          // Already on the hub — smooth-scroll
          const el = document.querySelector(link.anchor)
          if (el) el.scrollIntoView({ behavior: "smooth" })
        } else {
          // On another /real-estate/* page — full navigate
          window.location.href = link.href
        }
        return
      }

      // Regular page link
      window.location.href = link.href
    },
    [pathname],
  )

  return (
    <>
      {/* ── Navigation ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[#ece4d8]/98 backdrop-blur-lg shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
            : "bg-[#ece4d8]/95",
        )}
      >
        {/* ── Brand Bar (top) ── */}
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-6 lg:px-10">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logos */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => (window.location.href = "/real-estate")}
                className="block shrink-0"
                aria-label="Wilson Premier home"
              >
                <img
                  src="/brand/logo-bold-charcoal.png"
                  alt="Wilson Premier"
                  className="h-[36px] w-auto object-contain md:h-[42px]"
                />
              </button>
              <img
                src="/real-estate/remax-logo-minimal.png"
                alt="RE/MAX"
                className="h-[18px] w-auto object-contain opacity-60 md:h-[22px]"
              />
            </div>

            {/* Right: Headshot + CTA (desktop) | Headshot + hamburger (mobile) */}
            <div className="flex items-center gap-3">
              {/* Craig headshot */}
              <img
                src="/real-estate/craig-headshot.jpg"
                alt="Craig Wilson"
                className="h-8 w-8 rounded-full object-cover border border-[#BCA28A]/40 md:h-9 md:w-9"
              />

              {/* Desktop CTA */}
              <button
                onClick={() => (window.location.href = "/real-estate/contact")}
                className="hidden md:inline-flex items-center rounded-full bg-[#9D5F36] px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#864E2B]"
              >
                Contact Craig
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-[#2b2925]/75 hover:text-[#1f1d1a] hover:bg-[#1f1d1a]/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Nav Links Bar (bottom, desktop only) ── */}
        <div className="hidden md:block border-t border-[#1f1d1a]/10">
          <div className="w-full max-w-[1920px] mx-auto px-3 md:px-6 lg:px-10">
            <div className="flex items-center justify-between h-[42px]">
              {/* Nav links */}
              <div className="flex items-center gap-5 lg:gap-7">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link)}
                    className={cn(
                      "text-[12px] lg:text-[13px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap transition-colors duration-300",
                      "text-[#2b2925]/80 hover:text-[#9D5F36]",
                    )}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Vacation Rentals link */}
              <button
                onClick={() => (window.location.href = "/")}
                className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#2b2925]/50 hover:text-[#2b2925]/80 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Vacation Rentals
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 top-14 bottom-0 z-40 bg-[#ece4d8]/98 backdrop-blur-lg md:hidden overflow-y-auto"
          >
            <div className="px-5 py-6 flex flex-col gap-1">
              {/* Contact Craig CTA */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  window.location.href = "/real-estate/contact"
                }}
                className="w-full rounded-full bg-[#9D5F36] py-3 text-base font-semibold text-white transition-colors hover:bg-[#864E2B] min-h-[44px] mb-3"
              >
                Contact Craig
              </button>

              {/* Nav links */}
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="w-full text-left py-3 text-base font-medium text-[#25231f]/90 hover:text-[#9D5F36] border-b border-[#1f1d1a]/10 min-h-[44px] flex items-center transition-colors"
                >
                  {link.label}
                </button>
              ))}

              {/* Vacation Rentals link */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  window.location.href = "/"
                }}
                className="flex items-center gap-2 mt-4 py-3 text-sm font-medium text-[#2b2925]/50 hover:text-[#2b2925]/80 transition-colors min-h-[44px]"
              >
                <ArrowLeft className="h-4 w-4" />
                Vacation Rentals
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Spacer ── */}
      <div className="h-14 md:h-[96px]" />
    </>
  )
}
