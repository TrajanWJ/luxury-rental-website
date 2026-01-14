"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookingPopup } from "./booking-popup"

export default function FooterCTA() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

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
        ref={ref}
        className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-primary via-blue-900 to-slate-950"
      >
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 0.15 } : {}}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/luxury-lakefront-estate-sunset-view.jpg')" }}
          />
        </motion.div>

        <div className="relative container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Ready for Your Lakefront Escape?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto"
          >
            Book your luxury retreat at Smith Mountain Lake today and create memories that will last a lifetime
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => setBookingOpen(true)}
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-xl"
            >
              Book Your Stay
            </Button>
            <Button
              onClick={scrollToContact}
              size="lg"
              variant="outline"
              className="bg-white/5 backdrop-blur-sm text-white border-2 border-white hover:bg-white hover:text-primary text-lg px-8 py-6 rounded-full transition-transform hover:scale-105 active:scale-95"
            >
              Contact Our Team
            </Button>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 pt-8 border-t border-white/20"
          >
            <p className="text-white/80 mb-4 font-medium">Wilson Premier Properties - Smith Mountain Lake, Virginia</p>
            <p className="text-white/60 text-sm">Luxury Lakefront Vacation Rentals & Experiences</p>
          </motion.div>
        </div>
      </section>

      <BookingPopup isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  )
}
