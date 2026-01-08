"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"

interface PropertyPanelProps {
  property: {
    id: string
    name: string
    teaser: string
    image: string
  }
  index: number
  total: number
  onClick: () => void
}

export function PropertyPanel({ property, index, total, onClick }: PropertyPanelProps) {
  const container = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end start']
  })

  // Calculate scale based on index and scroll progress
  // As the section scrolls up, it scales down slightly
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0.6])

  return (
    <div
      ref={container}
      className="h-screen w-full sticky top-0 overflow-hidden"
    >
      <motion.div
        style={{
          scale,
          opacity,
          zIndex: index,
        }}
        className="relative h-full w-full overflow-hidden cursor-pointer group shadow-2xl origin-center"
        onClick={onClick}
      >
        {/* Background Image */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${property.image}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-slate-900/10" />
        </motion.div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center h-full">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold text-white mb-6"
          >
            {property.name}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-white/90 mb-10"
          >
            {property.teaser}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-10 py-7 text-xl shadow-lg hover:scale-105 transition-transform"
            >
              Explore Property
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
