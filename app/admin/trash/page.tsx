"use client"

import { TrashGrid } from "@/components/admin/trash-grid"

export default function AdminTrashPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Recently Deleted</h1>
        <p className="text-[#ECE9E7]/40 text-sm">Photos are permanently removed after 7 days</p>
      </div>
      <TrashGrid />
    </div>
  )
}
