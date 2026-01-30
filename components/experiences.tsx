"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { activities } from "@/lib/experiences-data"
import Image from "next/image"

export default function Experiences() {
  const scrollToContact = () => {
    const contactSection = document.querySelector("#contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="experiences" className="py-24 md:py-32 bg-[#ebe0d4] overflow-hidden">
      <div className="container mx-auto px-4 mb-20">
        <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-[#7d7065] border-l-2 border-[#463930] pl-6 mb-6">
          Discover Local Favorites
        </h3>
        <p className="max-w-xl text-xl text-[#463930]/80 font-medium leading-relaxed ml-6">
          Immerse yourself in the authentic lifestyle of Smith Mountain Lake. From adrenaline-pumping water sports to serene sunset cruises, we've curated the ultimate collection of local experiences for your stay.
        </p>
      </div>

      <div className="space-y-12">
        {[
          { dir: -1, speed: 50, offset: 0 },
          { dir: 1, speed: 60, offset: -1000 },
          { dir: -1, speed: 45, offset: -500 }
        ].map((rail, rowIndex) => (
          <div key={rowIndex} className="relative py-8 bg-[#e4dccc] border-y border-[#d5cbbd]">
            <motion.div
              className="flex gap-12 whitespace-nowrap px-12"
              initial={{ x: rail.offset }}
              animate={{ x: rail.dir === -1 ? [rail.offset, rail.offset - 2000] : [rail.offset - 2000, rail.offset] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: rail.speed,
                  ease: "linear",
                },
              }}
            >
              {[...activities, ...activities, ...activities, ...activities, ...activities].map((act, i) => (
                <div
                  key={`${act.name}-${rowIndex}-${i}`}
                  className="relative group/card flex-shrink-0"
                >
                  {/* CLEAN BORDER ONLY ON HOVER */}
                  <div className="absolute inset-0 rounded-[2rem] border-2 border-[#463930] scale-95 opacity-0 group-hover/card:scale-105 group-hover/card:opacity-100 transition-all duration-500 z-0" />

                  {/* MAIN CARD WITH STRONG SHADOW */}
                  <div className="relative z-10 h-80 w-[440px] rounded-[1.8rem] overflow-hidden shadow-[0_15px_40px_-10px_rgba(70,57,48,0.3)] group-hover/card:shadow-[0_40px_80px_-15px_rgba(70,57,48,0.5)] transition-all duration-700 bg-[#463930]">
                    <Image
                      src={act.image}
                      alt={act.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover/card:scale-110 opacity-90 group-hover/card:opacity-100"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#463930] via-[#463930]/20 to-transparent" />

                    <div className="absolute bottom-8 left-8 z-10">
                      <span className="text-[#c3b6ab] text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block">
                        Wilson Premier
                      </span>
                      <h4 className="text-[#ebe0d4] font-bold text-3xl tracking-tight">
                        {act.name}
                      </h4>
                      <div className="h-1 w-0 bg-[#c3b6ab] group-hover/card:w-full transition-all duration-700 mt-3" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 mt-24 text-center">
        <Button
          onClick={scrollToContact}
          className="bg-[#463930] text-[#ebe0d4] hover:bg-[#7d7065] rounded-full px-16 py-10 text-xl font-medium tracking-tight transition-all shadow-xl hover:shadow-[#463930]/30 active:scale-95"
        >
          Design Your Itinerary
        </Button>
      </div>
    </section>
  )
}
