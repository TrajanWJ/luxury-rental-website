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
    <section id="experiences" className="py-24 md:py-32 bg-slate-950 overflow-hidden">
      {/* TRIPLE LARGER SCROLLING RAILS */}
      <div className="mt-0">
        <div className="container mx-auto px-4 mb-10">
          <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-blue-500/60 border-l-2 border-blue-500 pl-4">Discover Local Favorites</h3>
        </div>

        <div className="space-y-6">
          {[
            { dir: -1, speed: 40, offset: 0 },
            { dir: 1, speed: 50, offset: -500 },
            { dir: -1, speed: 35, offset: -250 }
          ].map((rail, rowIndex) => (
            <div key={rowIndex} className="relative py-2 bg-white/[0.01] border-y border-white/5 overflow-hidden">
              <motion.div
                className="flex gap-8 whitespace-nowrap"
                initial={{ x: rail.offset }}
                animate={{ x: rail.dir === -1 ? [rail.offset, rail.offset - 1500] : [rail.offset - 1500, rail.offset] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: rail.speed,
                    ease: "linear",
                  },
                }}
              >
                {[...activities, ...activities, ...activities, ...activities].map((act, i) => (
                  <div
                    key={`${act.name}-${rowIndex}-${i}`}
                    className="relative h-72 w-[420px] rounded-[2rem] overflow-hidden flex-shrink-0 group/card shadow-2xl"
                  >
                    <Image
                      src={act.image}
                      alt={act.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover/card:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover/card:opacity-100 transition-opacity" />

                    <div className="absolute bottom-10 left-10 z-10">
                      <span className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block opacity-60">Wilson Premier</span>
                      <h4 className="text-white font-bold text-3xl tracking-tight">{act.name}</h4>
                      <div className="h-1 w-0 bg-blue-500 group-hover/card:w-full transition-all duration-700 mt-2" />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-20 text-center">
        <Button
          onClick={scrollToContact}
          variant="outline"
          className="bg-transparent border-white/20 text-white hover:bg-white hover:text-slate-950 rounded-full px-12 py-8 text-xl tracking-tight transition-all"
        >
          Design Your Itinerary
        </Button>
      </div>
    </section>
  )
}
