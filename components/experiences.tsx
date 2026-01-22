"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { experiences, activities } from "@/lib/experiences-data"
import Image from "next/image"

export default function Experiences() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  }

  const scrollToContact = () => {
    const contactSection = document.querySelector("#contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="experiences" ref={ref} className="py-24 md:py-32 bg-slate-950 overflow-hidden">
      <div className="container mx-auto px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            Curated Adventures
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight font-[family-name:var(--font-playfair)]"
          >
            The Ultimate Lake <span className="text-blue-500 italic">Lifestyle</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 font-light"
          >
            From extreme water sports to tranquil sunset celebrations, Wilson Premier provides the backdrop for memories that last a lifetime.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {experiences.map((exp) => {
            const Icon = exp.icon
            return (
              <motion.div
                key={exp.title}
                variants={itemVariants}
                className="group relative h-[256px] rounded-2xl overflow-hidden border border-white/5"
              >
                <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90" />
                </div>

                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2.5 transition-colors group-hover:bg-blue-600 group-hover:border-blue-500">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{exp.title}</h3>
                  <p className="text-slate-300 text-[11px] font-light leading-snug opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0">
                    {exp.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* TRIPLE LARGER SCROLLING RAILS */}
      <div className="mt-20">
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

