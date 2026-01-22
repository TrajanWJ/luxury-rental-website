"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { HeroBookingWidget } from "./hero-booking-widget"
import { MapBookingWidget } from "./map-booking-widget"
import { cn } from "@/lib/utils"

export default function Hero() {
  const { scrollY } = useScroll()

  // Smoother parallax effect
  const y = useTransform(scrollY, [0, 800], [0, 400])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 1.1])

  return (
    <section className="relative min-h-screen flex items-start overflow-hidden">
      {/* Background with Motion Parallax */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://wilson-premier.com/wp-content/uploads/2023/11/WP-crane-flying-over-water.jpg')",
          y,
          scale,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-slate-900/20" />
      </motion.div>

      {/* Floating Modern Text - Top Right */}
      <div className="absolute top-[15%] right-[5%] z-20 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <span className="text-white/60 text-sm font-medium tracking-wide italic font-[family-name:var(--font-playfair)]">
            Luxury waterfront rentals on Smith Mountain Lake
          </span>
        </motion.div>
      </div>

      {/* Content Container - Constrained and Centered */}
      <div className="relative z-10 w-full min-h-screen flex flex-col pointer-events-none">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:pl-[7%] pr-[10px] md:pr-12 flex-1 flex flex-col justify-center pb-[10vh]">

          {/* Content Group - Visually Connected */}
          <div className="max-w-5xl w-full pointer-events-auto space-y-[8vh] lg:space-y-[10vh]">

            {/* Typography Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 max-w-xl relative text-center md:text-left"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1] font-[family-name:var(--font-playfair)]"
              >
                Wilson Premier <br />
                <span className="text-white">Properties</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-lg"
              >
                Set your sights on a truly luxurious lake experience at any one of our Properties on the beautiful Smith Mountain Lake.
              </motion.p>
            </motion.div>

            {/* Widgets Row - Stack on mobile to prevent squishing */}
            <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-[5%] w-full relative">

              {/* Quick Booking Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="w-full md:flex-1 min-w-0 flex"
              >
                <HeroBookingWidget />
              </motion.div>

              {/* Map Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="w-full md:w-auto md:shrink-0 flex"
              >
                <MapBookingWidget />
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 whitespace-nowrap">
          Discover Residences
        </span>
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
