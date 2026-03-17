"use client"

import { SiteManagement } from "@/components/admin/site-management"

export default function SiteSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-2xl lg:text-3xl mb-1">Site Settings</h1>
        <p className="text-[#ECE9E7]/40 text-sm">
          Homepage section toggles and email forwarding configuration
        </p>
      </div>
      <SiteManagement />
    </div>
  )
}
