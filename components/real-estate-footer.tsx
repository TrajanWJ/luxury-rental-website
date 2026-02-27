"use client"

import { useCallback } from "react"
import { usePathname } from "next/navigation"
import { Facebook, Instagram, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Link data ── */

interface FooterLink {
  label: string
  href: string
  anchor?: string | null
}

const QUICK_LINKS: FooterLink[] = [
  { label: "About Craig", href: "/real-estate/about" },
  { label: "Contact", href: "/real-estate/contact" },
  { label: "Vacation Rentals", href: "/" },
]

const EXPLORE_LINKS: FooterLink[] = [
  { label: "About SML", href: "/real-estate#about-sml", anchor: "#about-sml" },
  { label: "SML Life", href: "/real-estate#sml-life", anchor: "#sml-life" },
  { label: "The Market", href: "/real-estate#market", anchor: "#market" },
]

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/askcraig",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: Linkedin,
  },
]

const ASSOCIATION_BADGES = ["Licensed VA", "NAR", "RVAR"]

/* ── Component ── */

export default function RealEstateFooter() {
  const pathname = usePathname()

  const handleLinkClick = useCallback(
    (link: FooterLink) => {
      if (link.anchor) {
        if (pathname === "/real-estate") {
          const el = document.querySelector(link.anchor)
          if (el) el.scrollIntoView({ behavior: "smooth" })
          return
        }
      }
      window.location.href = link.href
    },
    [pathname],
  )

  return (
    <footer className="bg-[#1f1d1a] text-[#ECE9E7]">
      {/* ── Top section: Craig info + Link grid ── */}
      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-16">
          {/* ── Craig Info ── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <img
              src="/real-estate/craig-headshot.jpg"
              alt="Craig Wilson"
              className="h-20 w-20 rounded-full object-cover border-2 border-[#D8C6AF]/30 mb-4"
            />
            <h3 className="text-lg font-semibold text-[#ECE9E7]">
              Craig Wilson
            </h3>
            <p className="text-[13px] text-[#ECE9E7]/72 mt-0.5">
              President &amp; Founder
            </p>
            <p className="text-[13px] text-[#ECE9E7]/72 mt-0.5">
              Wilson Premier Properties
            </p>
            <p className="text-[13px] text-[#ECE9E7]/72 mt-0.5">
              RE/MAX Lakefront Realty Inc.
            </p>

            {/* Association badges */}
            <div className="flex items-center gap-2 mt-4">
              {ASSOCIATION_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] border border-[#ECE9E7]/20 rounded px-2.5 py-1 text-[#D8C6AF]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* ── Divider (mobile only, horizontal) ── */}
          <div className="block lg:hidden w-full h-px bg-[#ECE9E7]/10" />

          {/* ── Link Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:border-l lg:border-[#ECE9E7]/10 lg:pl-16">
            {/* Quick Links */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8C6AF] mb-4">
                Quick Links
              </span>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="text-[13px] text-[#ECE9E7]/72 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Explore */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8C6AF] mb-4">
                Explore
              </span>
              <ul className="space-y-2.5">
                {EXPLORE_LINKS.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="text-[13px] text-[#ECE9E7]/72 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8C6AF] mb-4">
                Connect
              </span>
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded border border-[#ECE9E7]/20",
                      "text-[#ECE9E7]/72 hover:text-white hover:border-[#ECE9E7]/40",
                      "transition-colors duration-300",
                    )}
                  >
                    <link.icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div className="border-t border-[#ECE9E7]/10">
        <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-[#ECE9E7]/50">
            <span>
              Copyright &copy; {new Date().getFullYear()} All Rights Reserved | Wilson Premier Properties
            </span>
            <span className="text-center md:text-right">
              Smith Mountain Lake Real Estate | Privacy Policy | Terms &amp; Disclaimers | Sitemap
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
