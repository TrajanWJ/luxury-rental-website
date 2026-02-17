"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import Navigation from "@/components/navigation"
import FooterCTA from "@/components/footer-cta"
import { ArrowRight, Phone, Globe, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { experiences, Experience } from "@/lib/experiences"

const COLORS = {
    linen: "#EAE8E4",  // Main background
    charcoal: "#1C1C1C", // Primary text
    stone: "#8C8984",    // Secondary text
    brass: "#A4907C",    // Accents
}

// Editorial Experience Component
function EditorialExperience({ item, index }: { item: Experience, index: number }) {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], [100, -100])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1])

    const isEven = index % 2 === 0

    return (
        <section
            ref={containerRef}
            className={`min-h-[85vh] flex items-center justify-center py-24 relative overflow-hidden`}
        >
            <div className={`container mx-auto px-6 md:px-12 flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-center`}>

                {/* Text Side */}
                <motion.div
                    style={{ opacity }}
                    className="flex-1 space-y-8 z-10"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: COLORS.brass }}>
                            0{index + 1}
                        </span>
                        <div className="h-px w-12 bg-current opacity-20" style={{ color: COLORS.charcoal }} />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: COLORS.stone }}>
                            {item.type}
                        </span>
                    </div>

                    <h2
                        className="text-5xl md:text-7xl font-serif font-medium leading-[0.95]"
                        style={{ color: COLORS.charcoal }}
                    >
                        {item.name}
                    </h2>

                    <p
                        className="text-lg md:text-xl font-light leading-relaxed max-w-md"
                        style={{ color: COLORS.stone }}
                    >
                        {item.description}
                    </p>

                    {/* Contact Info */}
                    <div className="space-y-3 pt-2">
                        {item.contactName && (
                            <p className="text-sm font-medium" style={{ color: COLORS.charcoal }}>
                                {item.contactName}
                                {item.contactTitle && (
                                    <span className="font-light ml-2" style={{ color: COLORS.stone }}>
                                        &mdash; {item.contactTitle}
                                    </span>
                                )}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                            {item.phone && (
                                <Link
                                    href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}
                                    className="inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-70"
                                    style={{ color: COLORS.stone }}
                                >
                                    <Phone className="h-3.5 w-3.5" />
                                    {item.phone}
                                </Link>
                            )}
                            {item.email && (
                                <Link
                                    href={`mailto:${item.email}`}
                                    className="inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-70"
                                    style={{ color: COLORS.stone }}
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                    {item.email}
                                </Link>
                            )}
                        </div>

                        {item.serviceOffered && (
                            <span
                                className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border"
                                style={{ color: COLORS.brass, borderColor: `${COLORS.brass}40` }}
                            >
                                {item.serviceOffered}
                            </span>
                        )}
                    </div>

                    {/* CTA */}
                    {item.website ? (
                        <Link href={item.website} target="_blank" rel="noopener noreferrer">
                            <motion.div
                                whileHover={{ x: 10 }}
                                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest cursor-pointer group"
                                style={{ color: COLORS.charcoal }}
                            >
                                Get in Touch
                                <Globe className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </motion.div>
                        </Link>
                    ) : (
                        <motion.div
                            whileHover={{ x: 10 }}
                            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest cursor-pointer group"
                            style={{ color: COLORS.charcoal }}
                        >
                            Learn More
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </motion.div>
                    )}
                </motion.div>

                {/* Image Side */}
                <div className="flex-1 relative aspect-[3/4] md:aspect-[4/5] w-full max-w-xl">
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            style={{ scale, y }}
                            className="w-full h-[120%] relative -top-[10%]"
                        >
                            <Image
                                src={item.imageUrl || "/placeholder.jpg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function ExperiencesPage() {
    return (
        <main style={{ backgroundColor: COLORS.linen }} className="min-h-screen font-sans selection:bg-stone-300 selection:text-black">
            <Navigation theme="light" />

            {/* Editorial Hero */}
            <section className="min-h-screen flex items-center pt-32 pb-20 relative px-6 md:px-12 overflow-hidden">
                <div className="container mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-4xl"
                    >
                        <span className="block text-xs md:text-sm font-bold tracking-[0.25em] mb-8 uppercase" style={{ color: COLORS.brass }}>
                            Your Concierge Collection
                        </span>
                        <h1
                            className="text-6xl md:text-9xl font-serif font-regular tracking-tight leading-[0.9] mb-12"
                            style={{ color: COLORS.charcoal }}
                        >
                            At Your <br />
                            <span className="italic">Service</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-light max-w-xl leading-relaxed" style={{ color: COLORS.stone }}>
                            Private chefs, lake cruises, in-home spa — our hand-picked partners are ready before you arrive, so every detail is already taken care of.
                        </p>
                    </motion.div>
                </div>

                {/* Subtle Grain/Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </section>

            {/* List of Experiences */}
            <div className="pb-32">
                {experiences.map((experience, index) => (
                    <EditorialExperience key={experience.id} item={experience} index={index} />
                ))}
            </div>

            <FooterCTA />
        </main>
    )
}
