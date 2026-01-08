"use client"

import { useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookingPopup } from "./booking-popup"

export default function Hero() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const { scrollY } = useScroll()

  // Smoother parallax effect
  const y = useTransform(scrollY, [0, 800], [0, 400])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 1.1])

  return (
    <>
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Motion Parallax */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/luxury-lakefront-estate-sunset-view.jpg')",
            y,
            scale,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/60" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ opacity }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              Luxury Lakefront Retreats at Smith Mountain Lake
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto"
            >
              Perfect for family reunions, corporate retreats, and unforgettable group getaways
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                onClick={() => setBookingOpen(true)}
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
              >
                Book Your Stay
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      <BookingPopup isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  )
}
