"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { HeroBookingWidget } from "./hero-booking-widget"

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
        {/* Brand background overlay (linen/taupe wash) */}
        <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(236,233,231,0.22)_0%,rgba(188,162,138,0.14)_45%,rgba(43,43,43,0.24)_100%)] mix-blend-soft-light" />
        {/* Subtle texture so hero matches site background character */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(236,233,231,0.35) 0.8px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center container mx-auto px-4 md:px-8 pt-20 sm:pt-24 md:pt-14">

        <div className="max-w-4xl space-y-9">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-start gap-2 md:justify-between md:gap-10">
              <div className="min-w-0">
                <div className="overflow-hidden mb-4">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full text-[#E2D0BB] drop-shadow-md"
                  >
                    <div
                      className="ml-4 md:ml-10 flex items-center gap-[10px] w-[calc(100%-1rem)] md:w-auto"
                      style={{ maxWidth: "100%", width: "100%" }}
                    >
                      <div className="h-px flex-1 bg-[#E2D0BB]/80" />
                      <span className="inline-flex text-xs font-bold uppercase tracking-[0.22em]">
                        <span className="inline-block rounded-full border border-[#BCA28A]/35 bg-[#2B2B2B]/30 px-3 py-1.5 backdrop-blur-[1px] shadow-[0_6px_18px_rgba(0,0,0,0.28)]">
                          Smith Mountain Lake
                        </span>
                      </span>
                      <div
                        className="h-px flex-1 bg-[#E2D0BB]/80"
                        style={{ minWidth: "22vw" }}
                      />
                    </div>
                  </motion.div>
                </div>

                <h1
                  className="text-5xl md:text-8xl lg:text-9xl font-serif tracking-tight leading-[0.88] drop-shadow-lg"
                  style={{ textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
                >
                  <span className="italic text-[#E7D6C1]">Wilson</span> <br />
                  <span className="italic text-[#E7D6C1] whitespace-nowrap">Premier Properties</span>
                </h1>


              </div>

            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.6 }}
            className="text-[#EFE4D6] text-lg md:text-xl font-medium max-w-lg leading-relaxed mb-6 drop-shadow-md"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.45)" }}
          >
            We curate extraordinary lakefront vacation homes at Smith Mountain Lake—flagship estates and refined retreats designed for families, friends, and executive gatherings who expect more than just a place to stay.
          </motion.p>

          {/* Widgets - Minimal Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pt-6 pb-14 max-w-lg md:max-w-3xl"
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
