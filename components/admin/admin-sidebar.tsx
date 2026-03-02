"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  Building2,
  ImageIcon,
  Trash2,
  Settings2,
  Users,
  Mail,
  Activity,
  BarChart3,
  LogOut,
  ChevronDown,
} from "lucide-react"

/* ── Nav structure ─────────────────────────────────── */

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
  {
    href: "/admin",
    label: "Property & Photo Management",
    icon: Building2,
    children: [
      { href: "/admin", label: "Properties & Settings", icon: Building2 },
      { href: "/admin/photos", label: "Photo Management", icon: ImageIcon },
      { href: "/admin/trash", label: "Recently Deleted", icon: Trash2 },
    ],
  },
  {
    href: "/admin/site-management",
    label: "Site Management",
    icon: Settings2,
    children: [
      { href: "/admin/site-management", label: "Site Settings", icon: Settings2 },
      { href: "/admin/concierge", label: "Concierge Partners", icon: Users },
    ],
  },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/activity-log", label: "Activity Log", icon: Activity },
]

/* ── Sidebar component ─────────────────────────────── */

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Track open state for each collapsible group
  const groupItems = navItems.filter((item) => item.children)
  const initialOpenState: Record<string, boolean> = {}
  for (const group of groupItems) {
    const isActive = group.children!.some((child) =>
      child.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(child.href)
    )
    initialOpenState[group.href] = isActive
  }
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpenState)

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
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            // Group with children
            if (item.children) {
              const isGroupActive = item.children.some((child) =>
                child.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(child.href)
              )
              const isGroupOpen = openGroups[item.href] ?? false
              return (
                <div key={item.href}>
                  <button
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [item.href]: !prev[item.href],
                      }))
                    }
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isGroupActive
                        ? "text-[#9D5F36]"
                        : "text-[#ECE9E7]/50 hover:text-[#ECE9E7]/80 hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isGroupOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isGroupOpen && (
                    <div className="ml-4 pl-3 border-l border-white/5 space-y-0.5 mt-0.5">
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                            isActive(child.href)
                              ? "bg-[#9D5F36]/15 text-[#9D5F36]"
                              : "text-[#ECE9E7]/40 hover:text-[#ECE9E7]/70 hover:bg-white/5"
                          )}
                        >
                          <child.icon className="h-3.5 w-3.5" />
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            // Standard nav item
            return (
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
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <a
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#ECE9E7]/30 hover:text-[#ECE9E7]/60 text-xs transition-colors"
          >
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
