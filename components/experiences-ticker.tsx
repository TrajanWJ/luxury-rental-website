"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { experiences } from "@/lib/experiences"

export default function ExperiencesTicker() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isPaused, setIsPaused] = useState(false)

    // Map experiences to the format we need
    const experienceCards = experiences.map(exp => ({
        id: exp.id,
        title: exp.name,
        type: exp.type,
        image: exp.imageUrl || "/images/placeholder.jpg",
        description: exp.description
    }))

    // Duplicate the array multiple times for seamless infinite scroll
    const infiniteExperiences = [
        ...experienceCards,
        ...experienceCards,
        ...experienceCards,
        ...experienceCards
    ]

    useEffect(() => {
        const scrollContainer = scrollRef.current
        if (!scrollContainer) return

        let animationFrameId: number
        let scrollPosition = 0
        const scrollSpeed = 0.5 // Pixels per frame - adjust for speed (lower = slower, more premium)

        const animate = () => {
            if (!isPaused && scrollContainer) {
                scrollPosition += scrollSpeed

                // Reset scroll position when we've scrolled through one full set
                const maxScroll = scrollContainer.scrollWidth / 4
                if (scrollPosition >= maxScroll) {
                    scrollPosition = 0
                }

                scrollContainer.scrollLeft = scrollPosition
            }
            animationFrameId = requestAnimationFrame(animate)
        }

        animationFrameId = requestAnimationFrame(animate)

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [isPaused])

    return (
        <section className="py-16 md:py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 mb-12">
                <div className="text-center max-w-3xl mx-auto">
                    <span className="text-[#BCA28A] text-xs font-bold uppercase tracking-[0.25em] mb-4 block font-serif">
                        A Glimpse of Lake Experiences
                    </span>
                    <p className="text-[#2B2B2B]/70 text-base md:text-lg leading-relaxed font-light">
                        From sunrise yoga to sunset cruises, every moment at Smith Mountain Lake is an opportunity for discovery.
                    </p>
                </div>
            </div>

            {/* Infinite Auto-Scrolling Carousel */}
            <div
                ref={scrollRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                className="flex gap-6 overflow-x-hidden scrollbar-hide"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {infiniteExperiences.map((exp, index) => (
                    <a
                        key={`${exp.id}-${index}`}
                        href="https://smith-mountain-lake.com/things-to-do/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-[280px] md:w-[320px] group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9D5F36] focus:ring-offset-4 rounded-2xl transition-all duration-300"
                        tabIndex={0}
                    >
                        {/* Image Container */}
                        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#BCA28A] mb-4">
                            {exp.image && (
                                <Image
                                    src={exp.image}
                                    alt={exp.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105 group-focus:scale-105"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent group-focus:bg-transparent transition-colors duration-500" />

                            {/* Type Badge */}
                            <div className="absolute top-4 left-4">
                                <span className="bg-[#ECE9E7]/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#2B2B2B] rounded-full">
                                    {exp.type}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2 px-2">
                            <h3 className="text-lg font-serif font-medium text-[#2B2B2B] group-hover:text-[#9D5F36] group-focus:text-[#9D5F36] transition-colors line-clamp-2">
                                {exp.title}
                            </h3>
                            <p className="text-[#2B2B2B]/60 text-sm leading-relaxed font-light line-clamp-2">
                                {exp.description}
                            </p>
                        </div>
                    </a>
                ))}
            </div>

            {/* Subtle hint about interaction */}
            <div className="text-center mt-8">
                <p className="text-[#BCA28A] text-xs uppercase tracking-[0.2em]">
                    Hover to pause • Click to explore
                </p>
            </div>
        </section>
    )
}
