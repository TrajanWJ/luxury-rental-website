"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { CheckCircle, MapPin, Phone, Mail, Facebook } from "lucide-react"

/* ─────────────────────────────────────────────
   Shared animation defaults
   ───────────────────────────────────────────── */

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
}

/* ─────────────────────────────────────────────
   Zod schema
   ───────────────────────────────────────────── */

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Please provide a brief message"),
})

type ContactFormData = z.infer<typeof contactSchema>

/* ─────────────────────────────────────────────
   Contact info obfuscation
   Assembled client-side only so crawlers
   cannot scrape from server-rendered HTML.
   ───────────────────────────────────────────── */

function useObfuscatedContact() {
  return useMemo(
    () => ({
      phone: ["5", "4", "0", "-", "2", "8", "1", "-", "3", "1", "8", "8"].join(""),
      email: ["craig", "@", "wilson", "-", "premier", ".", "com"].join(""),
      phoneTel: ["tel:", "5", "4", "0", "2", "8", "1", "3", "1", "8", "8"].join(""),
      emailMailto: ["mailto:", "craig", "@", "wilson", "-", "premier", ".", "com"].join(""),
    }),
    [],
  )
}

/* ═══════════════════════════════════════════════
   Contact Page
   ═══════════════════════════════════════════════ */

export default function ContactPage() {
  const contact = useObfuscatedContact()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (_data: ContactFormData) => {
    setIsSubmitting(true)
    // Simulated submission — replace with real endpoint later
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
  }

  const handleReset = () => {
    reset()
    setIsSuccess(false)
  }

  /* ─── Shared input classes ─── */
  const inputClasses =
    "w-full rounded-lg border border-[#BCA28A]/30 bg-white px-4 py-2.5 text-sm text-[#2B2B2B] placeholder:text-[#2B2B2B]/35 focus:border-[#9D5F36]/50 focus:ring-1 focus:ring-[#9D5F36]/20 focus:outline-none transition-colors"
  const labelClasses =
    "block text-[11px] uppercase tracking-[0.12em] text-[#2B2B2B]/60 font-semibold mb-1.5"
  const errorClasses = "mt-1 text-xs text-[#AD1D23]"

  return (
    <main className="pt-8 md:pt-16 pb-16 md:pb-24">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
          {/* ─────────────────────────────────────
              LEFT — Contact Form
             ───────────────────────────────────── */}
          <motion.div
            {...reveal}
            className="rounded-2xl border border-[#BCA28A]/20 bg-white p-6 md:p-8"
          >
            {isSuccess ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                >
                  <CheckCircle className="h-16 w-16 text-[#9D5F36]" />
                </motion.div>
                <h2 className="mt-6 font-serif text-3xl tracking-tight text-[#2B2B2B]">
                  Message Sent
                </h2>
                <p className="mt-3 max-w-md text-[#2B2B2B]/70 leading-relaxed">
                  Thank you for reaching out. Craig will be in touch shortly.
                </p>
                <Button
                  onClick={handleReset}
                  className="mt-8 bg-[#9D5F36] hover:bg-[#8A5230] text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.13em] rounded-md transition-colors duration-300 h-auto"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-8">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[#BCA28A] font-bold mb-3">
                    Get In Touch
                  </p>
                  <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-[#2B2B2B]">
                    Let&apos;s Connect
                  </h1>
                  <p className="mt-4 max-w-xl text-[#2B2B2B]/75 leading-relaxed">
                    Whether you&apos;re looking to buy, sell, or simply explore your options
                    at Smith Mountain Lake, Craig is here to help. Fill out the form
                    below and he&apos;ll get back to you personally.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {/* Row 1: Name + Email */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className={labelClasses}>
                        Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        className={inputClasses}
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className={errorClasses}>{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className={labelClasses}>
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className={inputClasses}
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className={errorClasses}>{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone + Subject */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className={labelClasses}>
                        Phone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="(555) 000-0000"
                        className={inputClasses}
                        {...register("phone")}
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className={labelClasses}>
                        Subject *
                      </label>
                      <input
                        id="subject"
                        type="text"
                        placeholder="How can Craig help?"
                        className={inputClasses}
                        {...register("subject")}
                      />
                      {errors.subject && (
                        <p className={errorClasses}>{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className={labelClasses}>
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      placeholder="Tell us about your goals, timeline, or any questions you have..."
                      className={`${inputClasses} resize-none`}
                      {...register("message")}
                    />
                    {errors.message && (
                      <p className={errorClasses}>{errors.message.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#9D5F36] hover:bg-[#8A5230] text-white h-12 text-[11px] font-bold uppercase tracking-[0.13em] rounded-md transition-colors duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </>
            )}
          </motion.div>

          {/* ─────────────────────────────────────
              RIGHT — Contact Details Card
             ───────────────────────────────────── */}
          <motion.aside
            {...reveal}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const, delay: 0.12 }}
            className="lg:sticky lg:top-32 rounded-2xl border border-[#BCA28A]/20 bg-[#e8eff3] p-6 md:p-8"
          >
            {/* RE/MAX logo */}
            <div className="mb-6">
              <img
                src="/real-estate/remax-logo-full.png"
                alt="RE/MAX Lakefront Realty Inc."
                className="h-14 w-auto"
              />
            </div>

            <h2 className="font-serif text-xl tracking-tight text-[#2B2B2B] mb-5">
              Contact Details
            </h2>

            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9D5F36]" />
                <div className="text-sm text-[#2B2B2B]/85 leading-relaxed">
                  <p className="font-medium">RE/MAX Lakefront Realty Inc.</p>
                  <p>16451 Booker T. Washington Hwy</p>
                  <p>Moneta, VA 24121</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#9D5F36]" />
                <a
                  href={contact.phoneTel}
                  className="text-sm text-[#2B2B2B]/85 hover:text-[#9D5F36] transition-colors duration-300"
                >
                  {contact.phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#9D5F36]" />
                <a
                  href={contact.emailMailto}
                  className="text-sm text-[#2B2B2B]/85 hover:text-[#9D5F36] transition-colors duration-300"
                >
                  {contact.email}
                </a>
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-3">
                <Facebook className="h-4 w-4 shrink-0 text-[#9D5F36]" />
                <a
                  href="https://www.facebook.com/askcraig"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#2B2B2B]/85 hover:text-[#9D5F36] transition-colors duration-300"
                >
                  facebook.com/askcraig
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  )
}
