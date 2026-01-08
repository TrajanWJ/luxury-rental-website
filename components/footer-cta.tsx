"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { BookingPopup } from "./booking-popup"

export default function FooterCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToContact = () => {
    const contactSection = document.querySelector("#contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <section
        id="contact"
        ref={sectionRef}
        className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-primary to-blue-900"
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/luxury-lakefront-estate-sunset-view.jpg')" }}
          />
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <h2
            className={`text-4xl md:text-6xl font-bold text-white mb-6 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            Ready for Your Lakefront Escape?
          </h2>
          <p
            className={`text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            Book your luxury retreat at Smith Mountain Lake today and create memories that will last a lifetime
          </p>
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <Button
              onClick={() => setBookingOpen(true)}
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6"
            >
              Book Your Stay
            </Button>
            <Button
              onClick={scrollToContact}
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm text-white border-2 border-white hover:bg-white hover:text-primary text-lg px-8 py-6"
            >
              Contact Our Team
            </Button>
          </div>

          {/* Footer Info */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-white/80 mb-4">Wilson Premier Properties - Smith Mountain Lake, Virginia</p>
            <p className="text-white/60 text-sm">Luxury Lakefront Vacation Rentals</p>
          </div>
        </div>
      </section>

      <BookingPopup isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  )
}
