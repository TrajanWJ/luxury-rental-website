"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function RealEstateHero() {
  const { scrollY } = useScroll()

  // Parallax: background moves up at half scroll speed
  const bgY = useTransform(scrollY, [0, 800], [0, 200])

  // Content fades out slightly as user scrolls
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0.4])

  const handleExploreClick = () => {
    const target = document.getElementById("about-sml")
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleContactClick = () => {
    window.location.href = "/real-estate/contact"
  }

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden bg-[#2B2B2B]">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/luxury-lakefront-estate-sunset-view.jpg')",
          y: bgY,
        }}
      >
        {/* Gradient overlay: bottom-up darker for content legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1410]/90 via-[#2B2B2B]/40 to-transparent" />
        {/* Gradient overlay: left-side subtle brand wash */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B2B2B]/55 via-[#2B2B2B]/15 to-transparent" />
      </motion.div>

      {/* Content — anchored to bottom */}
      <motion.div
        className="relative z-10 w-full container mx-auto px-4 md:px-8 pb-14 md:pb-20"
        style={{ opacity: contentOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl space-y-6"
        >
          {/* Overline */}
          <p
            className="text-[11px] uppercase tracking-[0.25em] text-[#D8C6AF] font-bold"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
          >
            Smith Mountain Lake Real Estate
          </p>

          {/* Headline */}
          <h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#ECE9E7] leading-[1.05] tracking-tight drop-shadow-lg"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.55)" }}
          >
            Lakefront Buying &amp; Selling,{" "}
            <span className="italic">Done the Right Way</span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.5 }}
            className="text-[#D8C6AF]/90 text-base md:text-lg leading-relaxed max-w-xl"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}
          >
            Discover Smith Mountain Lake through a thoughtful, relationship-first
            approach to real estate — grounded in transparency, local expertise,
            and genuine care.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            {/* Primary CTA — solid rust */}
            <Button
              onClick={handleContactClick}
              className="bg-[#9D5F36] hover:bg-[#8A5230] text-[#ECE9E7] border-0 px-7 py-3 h-auto text-sm font-semibold tracking-wide rounded-md transition-colors duration-300 shadow-[0_4px_18px_rgba(157,95,54,0.35)]"
            >
              Contact Craig
            </Button>

            {/* Secondary CTA — outline */}
            <Button
              onClick={handleExploreClick}
              variant="outline"
              className="bg-transparent hover:bg-[#ECE9E7]/10 text-[#ECE9E7] border border-[#ECE9E7]/50 hover:border-[#ECE9E7]/80 px-7 py-3 h-auto text-sm font-semibold tracking-wide rounded-md transition-colors duration-300 backdrop-blur-[2px]"
            >
              Explore the Lake
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
