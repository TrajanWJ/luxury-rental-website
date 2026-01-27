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
    position?: string
    matterportUrl?: string
    videoUrl?: string
  }
  index: number
  total: number
  onClick: () => void
  on3DClick?: (e: React.MouseEvent) => void
  onVideoClick?: (e: React.MouseEvent) => void
}

export function PropertyPanel({ property, index, total, onClick, on3DClick, onVideoClick }: PropertyPanelProps) {
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
      className="h-screen w-full flex items-center justify-center sticky top-0 overflow-hidden"
    >
      <motion.div
        style={{
          scale,
          opacity,
          zIndex: index,
        }}
        className="relative h-screen w-full overflow-hidden cursor-pointer group shadow-2xl origin-center"
        onClick={onClick}
      >
        {/* Background Image */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('${property.image}')`,
            backgroundPosition: property.position || 'center'
          }}
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
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-10 py-7 text-xl shadow-lg hover:scale-105 transition-transform"
            >
              Explore Property
            </Button>
            {property.videoUrl && (
              <Button
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onVideoClick?.(e);
                }}
                className="bg-white text-blue-600 hover:bg-slate-50 rounded-full px-10 py-7 text-xl shadow-lg hover:scale-105 transition-transform border-0"
              >
                Video Preview
              </Button>
            )}
            {property.matterportUrl && (
              <Button
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  on3DClick?.(e);
                }}
                className="bg-white text-blue-600 hover:bg-slate-50 rounded-full px-10 py-7 text-xl shadow-lg hover:scale-105 transition-transform border-0"
              >
                3D View
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
