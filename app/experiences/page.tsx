"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import FooterCTA from "@/components/footer-cta"
import { Button } from "@/components/ui/button"
import { experiences } from "@/lib/experiences-data"

export default function ExperiencesPage() {
    const [selectedCategory, setSelectedCategory] = useState("all")

    const filteredExperiences = useMemo(() => {
        return experiences.filter(exp => {
            return selectedCategory === "all" || exp.type === selectedCategory
        })
    }, [selectedCategory])

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 font-sans">
            <Navigation />

            {/* Minimal Header */}
            <div className="pt-32 pb-12 container mx-auto px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                >
                    Curated Lake <span className="text-primary">Experiences</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed"
                >
                    Discover the finest dining, vibrant activities, and hidden local secrets recommended for your stay at Smith Mountain Lake.
                </motion.p>

                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center gap-4 mt-12"
                >
                    {["all", "activity", "event"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize ${selectedCategory === cat
                                ? "bg-white text-slate-950 shadow-lg scale-105"
                                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {cat === "all" ? "All Experiences" : cat + "s"}
                        </button>
                    ))}
                </motion.div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredExperiences.map((exp, index) => {
                        const Icon = exp.icon
                        return (
                            <motion.div
                                key={exp.title}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="group relative bg-slate-900/50 rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/20"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <motion.div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url('${exp.image}')` }}
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.7 }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                    </motion.div>
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <span className="text-xs font-medium text-white/90 capitalize">{exp.type}</span>
                                    </div>
                                </div>

                                <div className="p-8 relative">
                                    <div className="absolute -top-8 left-8 p-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-3 mt-4">{exp.title}</h3>
                                    <p className="text-slate-400 leading-relaxed mb-6">
                                        {exp.description}
                                    </p>

                                    <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent group-hover:translate-x-1 transition-transform">
                                        Learn more <span className="ml-2">→</span>
                                    </Button>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            <FooterCTA />
        </main>
    )
}
