"use client"

import { OverviewOrdering } from "@/components/admin/overview-ordering"

export default function AdminPropertiesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-2xl lg:text-3xl mb-1">Overview & Ordering</h1>
        <p className="text-[#ECE9E7]/40 text-sm">
          Control which properties are visible and how they appear on the site
        </p>
      </div>
      <OverviewOrdering />
    </div>
  )
}
