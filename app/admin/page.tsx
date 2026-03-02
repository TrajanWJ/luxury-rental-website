"use client"

import { PropertySettings } from "@/components/admin/property-settings"

export default function AdminPropertiesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Properties & Settings</h1>
        <p className="text-[#ECE9E7]/40 text-sm">
          Manage property visibility, media links, floor plans, SEO, and display order
        </p>
      </div>
      <PropertySettings />
    </div>
  )
}
