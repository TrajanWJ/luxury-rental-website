"use client"

import { useRef, useState, type FormEvent } from "react"
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useConcierge } from "./concierge-context"

const COLORS = {
  linen: "#ECE9E7",
  charcoal: "#2B2B2B",
  taupe: "#BCA28A",
  rust: "#9D5F36"
}

export default function FooterCTA() {
  const [updatesOpen, setUpdatesOpen] = useState(false)
  const [updatesEmail, setUpdatesEmail] = useState("")
  const [updatesSubmitted, setUpdatesSubmitted] = useState(false)
  const [updatesError, setUpdatesError] = useState("")
  const { openContactModal } = useConcierge()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"]
  })

  // Gentle reveal
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])

  const closeUpdatesPopup = () => {
    setUpdatesOpen(false)
    setUpdatesEmail("")
    setUpdatesSubmitted(false)
    setUpdatesError("")
  }

  const handleUpdatesSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = updatesEmail.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      setUpdatesError("Please enter a valid email address.")
      return
    }

    setUpdatesError("")
    setUpdatesSubmitted(true)
  }

  return (
    <>
      <section
        id="contact"
        ref={ref}
        className="relative min-h-[112vh] md:min-h-[122vh] pt-10 pb-1 md:pt-14 md:pb-1 overflow-hidden bg-[#2B2B2B] text-[#ECE9E7]"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <motion.div
            style={{ scale, opacity, backgroundImage: "url('/images/suite-view/suite-view-9.jpg')" }}
            className="absolute inset-0 bg-cover bg-[center_58%] md:bg-[center_62%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2B2B2B]/35 via-[#2B2B2B]/18 to-[#2B2B2B]/55" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,233,231,0.02)_0%,rgba(43,43,43,0.28)_65%,rgba(43,43,43,0.5)_100%)]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 min-h-[100vh] md:min-h-[110vh] flex flex-col justify-end">
          <div className="text-center">
            <div className="max-w-2xl mx-auto px-4 py-5 md:px-6 md:py-6 rounded-3xl bg-[#2B2B2B]/24 backdrop-blur-[2px] border border-[#ECE9E7]/18 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <span className="text-[#D8C6AF] text-[11px] font-bold uppercase tracking-[0.2em] mb-3 block">
                Begin Your Stay
              </span>

              <p
                className="text-base md:text-lg text-[#F0ECE8] mb-2 max-w-xl mx-auto font-normal leading-relaxed"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.38)" }}
              >
                The lake is waiting. Book your luxury retreat at Smith Mountain Lake today.
              </p>

              <p
                className="text-sm md:text-base text-[#DDCDBA] mb-5 max-w-xl mx-auto font-normal leading-relaxed"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}
              >
                Our team will guide you through every detail, ensuring your stay is nothing short of extraordinary.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  onClick={() => {
                    setUpdatesSubmitted(false)
                    setUpdatesError("")
                    setUpdatesOpen(true)
                  }}
                  className="bg-[#ECE9E7] text-[#2B2B2B] hover:bg-white rounded-full px-8 py-6 text-xs uppercase tracking-[0.16em] font-semibold transition-all duration-500 min-w-[190px]"
                >
                  Get Exclusive Updates
                </Button>

                <Button
                  onClick={() => openContactModal()}
                  className="bg-[#ECE9E7]/12 text-[#ECE9E7] hover:bg-[#ECE9E7]/22 rounded-full px-8 py-6 text-xs uppercase tracking-[0.16em] font-semibold transition-all duration-500 min-w-[190px] border border-[#ECE9E7]/45"
                >
                  Contact Concierge
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom Bar */}
      <div className="bg-[#BCA28A] text-[#2B2B2B] py-5 md:py-6 px-6 md:px-12">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] uppercase tracking-[0.15em]">
          <span className="font-medium">
            © {new Date().getFullYear()} Wilson Premier Properties
          </span>

          <span className="font-medium">
            Powered by{" "}
            <a
              href="https://vervura.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:text-[#9D5F36] transition-colors duration-300"
            >
              Vervura
            </a>
          </span>

          <div className="flex items-center gap-5">
            <span className="font-medium mr-1">Follow Us</span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-[#9D5F36] transition-colors duration-300"
            >
              <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-[#9D5F36] transition-colors duration-300"
            >
              <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-[#9D5F36] transition-colors duration-300"
            >
              <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="hover:text-[#9D5F36] transition-colors duration-300"
            >
              <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {updatesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeUpdatesPopup}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-lg rounded-2xl border p-6 md:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.42)] bg-[#26231f] border-[#d8c7af]/30 text-[#efe5d8]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl md:text-2xl font-serif font-semibold mb-2">Get Exclusive Updates</h3>
              <p className="text-sm md:text-[15px] mb-5 text-[#efe5d8]/82">
                Join our insider list for seasonal offers and private release availability.
              </p>

              {updatesSubmitted ? (
                <div className="rounded-xl border px-4 py-3 text-sm border-[#d8c7af]/24 bg-[#d8c7af]/10">
                  Thanks. You are on the updates list.
                </div>
              ) : (
                <form onSubmit={handleUpdatesSubmit} className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={updatesEmail}
                    onChange={(e) => setUpdatesEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors bg-[#1f1d1a]/70 border-[#d8c7af]/22 placeholder:text-[#efe5d8]/45 focus:border-[#d8c7af]/48"
                    aria-label="Email address for exclusive updates"
                  />
                  {updatesError && (
                    <p className="text-sm text-[#d67854]">{updatesError}</p>
                  )}
                  <p className="text-xs leading-relaxed text-[#efe5d8]/62">
                    We will use your information to contact you about deals, specials and promotions.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="rounded-full border px-5 py-2.5 text-xs md:text-sm font-semibold uppercase tracking-[0.08em] transition-colors bg-[#d8c7af] text-[#1f1d1a] border-[#d8c7af]/70 hover:bg-[#e8d7bf]"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={closeUpdatesPopup}
                      className="rounded-full border px-5 py-2.5 text-xs md:text-sm font-semibold uppercase tracking-[0.08em] transition-colors border-[#d8c7af]/45 text-[#efe5d8] hover:bg-[#d8c7af]/12"
                    >
                      Close
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
