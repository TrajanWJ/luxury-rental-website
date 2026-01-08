"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { BookingPopup } from "./booking-popup"

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Homes", href: "#homes" },
    { label: "Experiences", href: "#experiences" },
    { label: "Weddings & Retreats", href: "#experiences" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-lg py-2"
            : "bg-transparent py-4"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <h1 className={`text-2xl font-bold transition-colors duration-300 ${scrolled ? "text-primary" : "text-white"
                }`}>
                Wilson Premier Properties
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                  onClick={() => scrollToSection(link.href)}
                  className={`transition-colors font-medium hover:text-secondary ${scrolled ? "text-slate-700" : "text-white/90"
                    }`}
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={() => setBookingOpen(true)}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-6"
                >
                  Book Now
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen
                ? <X className={`h-6 w-6 ${scrolled ? "text-slate-700" : "text-white"}`} />
                : <Menu className={`h-6 w-6 ${scrolled ? "text-slate-700" : "text-white"}`} />
              }
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-slate-200 bg-white rounded-b-2xl shadow-xl mt-2 px-4"
              >
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => scrollToSection(link.href)}
                      className="text-left text-slate-700 hover:text-primary transition-colors font-medium py-2"
                    >
                      {link.label}
                    </button>
                  ))}
                  <Button
                    onClick={() => {
                      setBookingOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="bg-secondary text-secondary-foreground w-full"
                  >
                    Book Now
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <BookingPopup isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  )
}
