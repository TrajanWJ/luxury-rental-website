"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useREContact } from "./real-estate-contact-context"

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
  const { openREContactModal } = useREContact()

  const vt = {
    bbH: "md:h-[64px]",
    cbH: "h-[44px]",
    mobBbH: "h-[56px]",
    logoH: "h-[48px] md:h-[58px]",
    linkSz: "text-[11px]",
    linkGap: "gap-6",
    ctaSz: "text-[11px]",
    ctaPx: "px-6 py-2.5",
    contextHasBorder: true,
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileMenuOpen])

  const handleNavClick = useCallback(
    (link: (typeof NAV_LINKS)[number]) => {
      setMobileMenuOpen(false)

      if (link.label === "Contact") {
        openREContactModal()
        return
      }

      if (link.anchor) {
        if (pathname === "/real-estate") {
          const el = document.querySelector(link.anchor)
          if (el) el.scrollIntoView({ behavior: "smooth" })
        } else {
          window.location.href = link.href
        }
        return
      }

      window.location.href = link.href
    },
    [pathname, openREContactModal],
  )

  return (
    <>
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
        <div className="w-full max-w-[1920px] mx-auto px-3 md:px-6 lg:px-10">
          <div className={`flex items-center justify-between ${vt.mobBbH} ${vt.bbH}`}>
            <button
              onClick={() => (window.location.href = "/real-estate")}
              className="block shrink-0"
              aria-label="Wilson Premier home"
            >
              <img
                src="/brand/logo-bold-charcoal.png"
                alt="Wilson Premier"
                className={`w-auto object-contain ${vt.logoH} [image-rendering:-webkit-optimize-contrast] contrast-110 saturate-105`}
              />
            </button>

            <div className="flex items-center gap-3">
              <img
                src="/real-estate/craig-headshot.jpg"
                alt="Craig Wilson"
                className="h-8 w-8 rounded-full object-cover border border-[#BCA28A]/40 md:h-9 md:w-9"
              />

              <button
                onClick={() => openREContactModal()}
                className={`inline-flex items-center rounded-full bg-[#9D5F36] text-white transition-colors hover:bg-[#864E2B] font-semibold uppercase tracking-[0.08em] ${vt.ctaPx} ${vt.ctaSz}`}
              >
                Contact
              </button>

              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="md:hidden p-2 rounded-full text-[#2b2925]/75 hover:text-[#1f1d1a] hover:bg-[#1f1d1a]/10 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className={`hidden md:flex items-center justify-between ${vt.contextHasBorder ? "border-t border-[#1f1d1a]/12" : ""} ${vt.cbH}`}>
            <div className={`flex items-center ${vt.linkGap}`}>
              {NAV_LINKS.map((link, index) => (
                <div key={link.label} className="flex items-center">
                  <button
                    onClick={() => handleNavClick(link)}
                    className={cn(
                      `font-semibold uppercase tracking-[0.08em] whitespace-nowrap transition-colors duration-300 ${vt.linkSz}`,
                      !link.anchor && pathname === link.href
                        ? "text-[#9D5F36]"
                        : "text-[#2b2925]/80 hover:text-[#9D5F36]",
                    )}
                  >
                    {link.label}
                  </button>
                  {index < NAV_LINKS.length - 1 && <span className="mx-3 h-3.5 w-px bg-[#1f1d1a]/20" aria-hidden="true" />}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="h-4 w-px bg-[#1f1d1a]/20" aria-hidden="true" />
              <button
                onClick={() => (window.location.href = "/")}
                className={`flex items-center gap-1.5 rounded-full border border-[#2b2925]/20 px-4 py-1.5 uppercase tracking-[0.1em] font-semibold text-[#2b2925]/75 hover:text-[#2b2925] hover:border-[#2b2925]/40 transition-colors ${vt.linkSz}`}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Vacation Rentals
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
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[#ece4d8]/98 backdrop-blur-lg md:hidden"
          >
            <div className="pt-[72px] px-5 py-8 h-full overflow-y-auto text-[#25231f]">
              <div className="rounded-2xl border border-[#1f1d1a]/10 p-4 mb-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#A4907C]/80 mb-3">Real Estate</p>
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link)}
                    className={cn(
                      "w-full text-left px-3 py-3 rounded-lg hover:bg-[#1f1d1a]/5 text-[15px]",
                      !link.anchor && pathname === link.href ? "text-[#9D5F36]" : "text-[#25231f]",
                    )}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-[#1f1d1a]/10 p-4 mb-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#A4907C]/80 mb-3">Vacation Rentals</p>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    window.location.href = "/"
                  }}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-[#1f1d1a]/5 text-[15px]"
                >
                  Explore STR Site
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[56px] md:h-[108px]" />
    </>
  )
}
