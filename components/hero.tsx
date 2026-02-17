"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { HeroBookingWidget } from "./hero-booking-widget"
import { MapBookingWidget } from "./map-booking-widget"

export default function Hero() {
  const { scrollY } = useScroll()

  // Subtle Parallax
  const y = useTransform(scrollY, [0, 800], [0, 200])

  return (
    <section className="relative min-h-[110vh] flex items-center overflow-hidden bg-[#2B2B2B]">
      {/* Background Image - Full Bleed */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero-sunset.jpg')",
          y,
        }}
      >
        {/* Editorial Grade Overlay: Charcoal Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B2B2B]/30 via-transparent to-[#2B2B2B]/80" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center container mx-auto px-6 md:px-12 pt-0 md:pt-20">

        <div className="max-w-4xl space-y-12">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="overflow-hidden mb-6">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4 text-white drop-shadow-md"
              >
                <div className="h-px w-12 bg-white opacity-80" />
                <span className="text-xs font-bold uppercase tracking-[0.25em]">
                  Smith Mountain Lake
                </span>
              </motion.div>
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-regular tracking-tight text-white leading-[0.9] drop-shadow-lg">
              Wilson <br />
              <span className="italic">Premier</span>
            </h1>

            <p className="text-sm md:text-base italic text-white tracking-wide mt-4 drop-shadow-md font-medium">
              Settle for… the Extraordinary
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.6 }}
            className="text-white text-lg md:text-xl font-medium max-w-lg leading-relaxed ml-2 md:ml-16 border-l border-white/40 pl-4 mb-6 drop-shadow-md"
          >
            Wilson Premier Properties curates extraordinary lakefront vacation homes at Smith Mountain Lake—flagship estates and refined retreats designed for families, friends, and executive gatherings who expect more than just a place to stay.
          </motion.p>

          {/* Widgets - Minimal Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pt-8 pb-16 px-4 md:max-w-3xl"
          >
            {/* We wrap the existing widgets but apply new CSS filters to them via parent if needed, 
                    or rely on their internal transparency */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:flex-1">
                <HeroBookingWidget />
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator - Minimal Text */}
      <div className="absolute bottom-12 left-6 md:left-12 flex items-center gap-4">
        <span className="text-[#ECE9E7]/40 text-[10px] font-bold uppercase tracking-[0.2em]">
          Scroll
        </span>
        <div className="h-px w-12 bg-[#ECE9E7]/20" />
      </div>

    </section>
  )
}
