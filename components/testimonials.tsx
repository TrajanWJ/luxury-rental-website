"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Star } from "lucide-react"

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const testimonials = [
    {
      quote: "Absolutely stunning property! Perfect for our family reunion. The lake views were breathtaking.",
      author: "Sarah M.",
      rating: 5,
    },
    {
      quote: "Our corporate retreat was a huge success. The amenities were top-notch and the team loved it.",
      author: "Michael T.",
      rating: 5,
    },
    {
      quote: "We hosted our wedding here and it was magical. The staff was incredible and the venue was perfect.",
      author: "Jennifer L.",
      rating: 5,
    },
    {
      quote: "Best vacation rental we've ever stayed at. Can't wait to come back next summer!",
      author: "David R.",
      rating: 5,
    },
    {
      quote: "The private dock and water access made our trip unforgettable. Highly recommend!",
      author: "Amanda K.",
      rating: 5,
    },
  ]

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
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <section ref={ref} className="py-16 md:py-24 bg-background overflow-hidden border-t border-black/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            What Our Guests Say
          </motion.h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative"
        >
          <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-8 px-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex-shrink-0 w-[85vw] md:w-[400px] snap-center"
              >
                <div className="bg-white/10 rounded-2xl p-8 h-full border border-black/5 hover:border-black/10 transition-all duration-300 hover:-translate-y-2 shadow-sm">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-4 leading-relaxed text-lg italic">"{testimonial.quote}"</p>
                  <p className="text-foreground font-semibold">— {testimonial.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
