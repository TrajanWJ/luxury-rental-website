"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mountain, Waves, TrendingUp, Car } from "lucide-react"

const DOCK_ITEMS = [
  { key: "about-sml", label: "About SML", icon: Mountain, href: "#about-sml" },
  { key: "sml-life", label: "SML Life", icon: Waves, href: "#sml-life" },
  { key: "market", label: "Market", icon: TrendingUp, href: "#market" },
  { key: "driving-distances", label: "Distances", icon: Car, href: "#driving-distances" },
]

export function MobileDock() {
  const [activeSection, setActiveSection] = useState<string>("")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show dock after scrolling past the hero
      setVisible(window.scrollY > 400)

      // Determine active section
      const sections = ["about-sml", "sml-life", "market", "driving-distances"]
      let current = ""
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200) current = id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleClick = (item: typeof DOCK_ITEMS[number]) => {
    if (item.href.startsWith("#")) {
      const el = document.getElementById(item.href.slice(1))
      if (el) el.scrollIntoView({ behavior: "smooth" })
    } else {
      window.location.href = item.href
    }
  }

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: 80, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] rounded-2xl border border-[#2B2B2B]/12 bg-white/90 backdrop-blur-md px-2 py-1.5 shadow-[0_14px_28px_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-center gap-1">
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activeSection === item.key
          return (
            <button
              key={item.key}
              onClick={() => handleClick(item)}
              className={`rounded-xl p-2.5 transition-colors ${
                active ? "bg-[#9D5F36] text-white" : "text-[#2B2B2B]/72 hover:bg-[#2B2B2B]/6"
              }`}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
