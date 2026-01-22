"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { experiences } from "@/lib/experiences-data"

export default function Experiences() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  const scrollToContact = () => {
    const contactSection = document.querySelector("#contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="experiences" ref={ref} className="py-20 md:py-32 bg-slate-950 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Unforgettable Lake Experiences
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            From water sports to weddings, Smith Mountain Lake offers something special for everyone
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {experiences.map((exp) => {
            const Icon = exp.icon
            return (
              <motion.div
                key={exp.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group relative bg-slate-900/50 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${exp.image}')` }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-slate-950/20" />
                  </motion.div>
                  <div className="absolute bottom-4 left-4">
                    <div className="p-3 bg-secondary/90 backdrop-blur-sm rounded-xl">
                      <Icon className="h-6 w-6 text-secondary-foreground" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{exp.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{exp.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center"
        >
          <Button
            onClick={scrollToContact}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-lg hover:scale-105 active:scale-95 transition-transform"
          >
            Plan Your Experience
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
