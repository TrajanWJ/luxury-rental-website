"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#232323]">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-[#1C1C1C] border border-white/10 rounded-lg text-[#ECE9E7]/60 hover:text-[#ECE9E7] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
