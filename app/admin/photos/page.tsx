"use client"

import { PhotoManager } from "@/components/admin/photo-manager"
import { ImageIcon, Info } from "lucide-react"

export default function AdminPhotosPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#9D5F36]/15">
            <ImageIcon className="h-5 w-5 text-[#9D5F36]" />
          </div>
          <div>
            <h1 className="text-[#ECE9E7] font-serif text-2xl lg:text-3xl">Photo Management</h1>
            <p className="text-[#ECE9E7]/40 text-sm">Reorder, upload, and manage property photos</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-[#9D5F36]/5 border border-[#9D5F36]/10">
          <Info className="h-4 w-4 text-[#9D5F36]/60 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#ECE9E7]/40 leading-relaxed">
            <span className="text-[#ECE9E7]/60 font-medium">Drag photos</span> to reorder.{" "}
            <span className="text-red-400 font-medium">Red badge</span> = position (click to edit).{" "}
            <span className="text-yellow-400 font-medium">Lock</span> = pin in place.{" "}
            <span className="text-green-400 font-medium">Green badge</span> = filename ID. Changes auto-save to cloud.
          </p>
        </div>
      </div>
      <PhotoManager />
    </div>
  )
}
