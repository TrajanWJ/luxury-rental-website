"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Check, Star } from "lucide-react"

export default function PledgeSection() {
  return (
    <section id="pledge" className="py-20 md:py-32 bg-gradient-to-b from-[#ECE9E7] to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[#2B2B2B]/5 opacity-30"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#2B2B2B] tracking-tight">
            Our Mission, Promise, and Pledge
          </h2>
          <div className="h-0.5 w-16 bg-[#9D5F36] mx-auto mt-4"></div>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-16 md:space-y-20">
          {/* Our Mission */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }
            }
            className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 md:p-12 shadow-lg"
          >
            <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#2B2B2B] mb-6">
              Our Mission
            </h3>
            <p className="text-lg md:text-xl text-[#2B2B2B]/80 leading-relaxed font-light">
              Our mission is to help families and groups experience everything Smith Mountain Lake has to offer—together. We provide spacious, thoughtfully designed homes for large families and groups, paired with elevated service, resort-style amenities, and “they thought of everything” details that make relaxing and reconnecting effortless. We hold ourselves to a standard that consistently surpasses expectations and invest in a Smith Mountain Lake experience that is elevated, memorable, and unmistakably beyond the ordinary for our guests and our community.
            </p>
          </motion.div>

          {/* Our Promise */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 md:p-12 shadow-lg"
          >
            <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#2B2B2B] mb-6">
              Our Promise
            </h3>
            <div className="bg-[#2B2B2B]/5 rounded-2xl p-6 md:p-8">
              <h4 className="text-3xl md:text-4xl font-serif font-medium text-[#2B2B2B] text-center tracking-tight mb-4">
                OUR COMMITMENT
              </h4>
              <p className="text-center text-lg md:text-xl text-[#2B2B2B]/80 leading-relaxed font-light max-w-3xl mx-auto">
                To go beyond the ordinary and create extraordinary luxury rentals and experiences for our guests and community
              </p>
            </div>
          </motion.div>

          {/* Our 'They Thought of Everything' Pledge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 md:p-12 shadow-lg"
          >
            <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#2B2B2B] mb-6">
              Our 'They Thought of Everything' Pledge
            </h3>
            <p className="text-lg md:text-xl text-[#2B2B2B]/80 leading-relaxed font-light">
              Planning a special lake vacation should feel exciting, not stressful. When one detail is off, the whole experience can unravel—that's exactly what we work to prevent.
            </p>
            <p className="text-lg md:text-xl text-[#2B2B2B]/80 leading-relaxed font-light mt-4">
              At Wilson Premier, every home and every experience is shaped by our “They Thought of Everything” pledge. From thoughtfully designed suites and bunk rooms to well-stocked kitchens, intuitive in-home technology, and plenty of lake toys, we anticipate what you'll need long before you arrive.
            </p>
            <p className="text-lg md:text-xl text-[#2B2B2B]/80 leading-relaxed font-light mt-4">
              Again and again, guests tell us the same thing: “Wow—they really thought of everything.” Stay with us and see why a Wilson Premier vacation feels unlike any other lakefront escape.
            </p>
          </motion.div>

          {/* Our Values */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 md:p-12 shadow-lg"
          >
            <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#2B2B2B] mb-8">
              Our Values
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex gap-4 p-6 bg-white/50 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-[#9D5F36] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-serif font-medium text-xl text-[#2B2B2B] mb-2">Authentic</h4>
                  <p className="text-[#2B2B2B]/80 leading-relaxed">Simple, elegant, and genuine—never pretentious or overdone.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/50 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-[#9D5F36] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-serif font-medium text-xl text-[#2B2B2B] mb-2">We've Thought of Everything</h4>
                  <p className="text-[#2B2B2B]/80 leading-relaxed">Luxury and ease at every touchpoint, so you don't have to think of a thing.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/50 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-[#9D5F36] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-serif font-medium text-xl text-[#2B2B2B] mb-2">Extraordinary</h4>
                  <p className="text-[#2B2B2B]/80 leading-relaxed">If it's expected, we go a step beyond—for our guests and our community.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/50 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-[#9D5F36] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-serif font-medium text-xl text-[#2B2B2B] mb-2">Humility</h4>
                  <p className="text-[#2B2B2B]/80 leading-relaxed">We're honored to host you and grateful for every opportunity to serve.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/50 rounded-2xl md:col-span-2">
                <div className="w-8 h-8 rounded-full bg-[#9D5F36] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">5</span>
                </div>
                <div>
                  <h4 className="font-serif font-medium text-xl text-[#2B2B2B] mb-2">Integrity</h4>
                  <p className="text-[#2B2B2B]/80 leading-relaxed">We do the right thing, especially when it's hard.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Our Logo – The Majestic Crane */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 md:p-12 shadow-lg"
          >
            <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#2B2B2B] mb-8">
              Our Logo – The Majestic Crane
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="relative h-40 w-40 shrink-0">
                <Image
                  src="/brand/logo no background.png"
                  alt="Wilson Premier Properties Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex-1">
                <blockquote className="text-xl md:text-2xl text-[#2B2B2B]/80 font-light leading-relaxed italic mb-6">
                  “Exceptionally elegant, these serene creatures grace their surroundings with tranquility and beauty, lending a touch of the extraordinary to their environment.”
                </blockquote>
                <p className="text-lg text-[#2B2B2B]/80 leading-relaxed">
                  The crane represents our commitment to elegance, serenity, and creating extraordinary experiences for every guest.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
