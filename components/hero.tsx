"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { HeroBookingWidget } from "./hero-booking-widget"
import { MapBookingWidget } from "./map-booking-widget"

export default function Hero() {
  const { scrollY } = useScroll()

  // Smoother parallax effect
  const y = useTransform(scrollY, [0, 800], [0, 400])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 1.1])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
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

      {/* Content Container - Constrained and Centered */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 max-w-7xl" style={{ marginLeft: '7%', marginRight: 'auto' }}>

          {/* Single Column Layout */}
          <div className="max-w-5xl">

            {/* Typography Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 max-w-xl mb-8"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]"
              >
                Wilson Premier Properties
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-white/80 font-light leading-relaxed"
              >
                Luxury waterfront rentals on Smith Mountain Lake
              </motion.p>
            </motion.div>

            {/* Widgets Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Quick Booking Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="lg:col-span-8"
              >
                <HeroBookingWidget />
              </motion.div>

              {/* Map Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="lg:col-span-4"
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
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
  )
}
