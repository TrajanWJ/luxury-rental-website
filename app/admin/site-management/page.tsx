"use client"

import { SiteManagement } from "@/components/admin/site-management"

export default function SiteManagementPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Site Management</h1>
        <p className="text-[#ECE9E7]/40 text-sm">
          Toggle homepage sections, pages, and real estate listings on or off
        </p>
      </div>
      <SiteManagement />
    </div>
  )
}
