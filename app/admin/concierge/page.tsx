"use client"

import { ConciergeManager } from "@/components/admin/concierge-manager"

export default function ConciergePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Concierge Partners</h1>
        <p className="text-[#ECE9E7]/40 text-sm">
          Manage partner directory, edit details, reorder, and control visibility
        </p>
      </div>
      <ConciergeManager />
    </div>
  )
}
