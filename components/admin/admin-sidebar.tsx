"use client"

import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  ImageIcon,
  Settings2,
  Users,
  Mail,
  Activity,
  BarChart3,
  LogOut,
  ExternalLink,
} from "lucide-react"

/* ── Nav structure ─────────────────────────────────── */

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  label?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
    ],
  },
  {
    label: "Properties",
    items: [
      { href: "/admin/properties", label: "Overview & Ordering", icon: Building2 },
      { href: "/admin/photos", label: "Photos & Media", icon: ImageIcon },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/concierge", label: "Concierge Partners", icon: Users },
      { href: "/admin/site-settings", label: "Site Settings", icon: Settings2 },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/activity-log", label: "Activity Log", icon: Activity },
    ],
  },
]

/* ── Sidebar component ─────────────────────────────── */

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin/login")
  }

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-[#1C1C1C] border-r border-white/5 flex flex-col z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo-icon-linen.png"
              alt="Wilson Premier"
              width={32}
              height={32}
              className="opacity-70"
            />
            <div>
              <h1 className="text-[#ECE9E7] font-serif text-sm font-semibold">
                Wilson Premier
              </h1>
              <p className="text-[#ECE9E7]/30 text-[11px] uppercase tracking-[0.12em]">
                Admin
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {navSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {/* Section divider + label */}
              {sectionIdx > 0 && (
                <div className="mx-2 mt-4 mb-2">
                  <div className="border-t border-white/5" />
                  {section.label && (
                    <p className="text-[#ECE9E7]/20 text-[10px] uppercase tracking-widest mt-3 mb-1 px-2">
                      {section.label}
                    </p>
                  )}
                </div>
              )}

              {/* Nav items */}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-[#9D5F36]/15 text-[#9D5F36]"
                        : "text-[#ECE9E7]/50 hover:text-[#ECE9E7]/80 hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <a
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#ECE9E7]/30 hover:text-[#ECE9E7]/60 text-xs transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#ECE9E7]/30 hover:text-red-400 text-xs transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
