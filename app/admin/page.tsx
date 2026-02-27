"use client"

import { PhotoManager } from "@/components/admin/photo-manager"

export default function AdminPhotosPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Photo Management</h1>
        <p className="text-[#ECE9E7]/40 text-sm">Reorder, upload, and manage property photos</p>
      </div>
      <PhotoManager />
    </div>
  )
}
