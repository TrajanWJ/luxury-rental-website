"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AdvancedBookingPopup } from "./advanced-booking-popup"

const COLORS = {
  linen: "#ECE9E7",
  charcoal: "#2B2B2B",
  taupe: "#BCA28A",
  rust: "#9D5F36"
}

export default function FooterCTA() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"]
  })

  // Gentle reveal
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])

  return (
    <>
      <section
        id="contact"
        ref={ref}
        className="relative py-32 md:py-48 overflow-hidden bg-[#2B2B2B] text-[#ECE9E7]"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <motion.div
            style={{ scale, opacity, backgroundImage: "url('/luxury-lakefront-estate-sunset-view.jpg')" }}
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay grayscale-[30%]"
          />
          <div className="absolute inset-0 bg-[#2B2B2B]/60" /> {/* Heavy wash for text legibility */}
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <span className="text-[#BCA28A] text-xs font-bold uppercase tracking-[0.25em] mb-6 block">
            Begin Your Stay
          </span>

          <h2 className="text-5xl md:text-7xl font-serif font-medium leading-[1] mb-6 tracking-tight text-[#ECE9E7]">
            Settle for… the Extraordinary
          </h2>

          <p className="text-lg md:text-xl text-[#ECE9E7]/80 mb-4 max-w-2xl mx-auto font-light leading-relaxed">
            The lake is waiting. Book your luxury retreat at Smith Mountain Lake today.
          </p>

          <p className="text-base md:text-lg text-[#BCA28A]/90 mb-16 max-w-xl mx-auto font-light leading-relaxed">
            Our team will guide you through every detail, ensuring your stay is nothing short of extraordinary.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              onClick={() => setBookingOpen(true)}
              className="bg-[#ECE9E7] text-[#2B2B2B] hover:bg-white rounded-full px-10 py-8 text-sm uppercase tracking-widest font-semibold transition-all duration-500 min-w-[200px]"
            >
              Book Your Stay
            </Button>

            <a
              href="mailto:angela@wilson-premier.com"
              className="text-[#ECE9E7]/60 hover:text-[#ECE9E7] text-sm uppercase tracking-widest border-b border-transparent hover:border-[#ECE9E7] pb-1 transition-all duration-300"
            >
              Contact Concierge
            </a>
          </div>

          {/* Footer Minimal Info */}
          <div className="mt-32 border-t border-[#ECE9E7]/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[#BCA28A] text-xs uppercase tracking-widest">
            <span>Wilson Premier Properties</span>
            <span>Smith Mountain Lake, Virginia</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </section>

      <AdvancedBookingPopup
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        searchParams={{
          location: "all",
          checkIn: "",
          checkOut: "",
          guests: "1"
        }}
      />
    </>
  )
}
