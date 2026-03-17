"use client"

import { useState, useEffect, useRef } from "react" // useRef used in FloorPlansTab
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { SiteConfig, PropertyOverride } from "@/lib/site-config-store"
import type { Property } from "@/lib/data"
import { Video, Box, FileImage, Upload, Trash2, Loader2 } from "lucide-react"

/* ── Types ─────────────────────────────────────────── */

export type MediaTab = "photos" | "video" | "3d-tour" | "floor-plans"

export interface MediaTabProps {
  config: SiteConfig
  propertyKey: string
  selectedProperty: Property
  updateOverride: (fields: Partial<PropertyOverride>, logMsg?: string) => void
  saveConfig: (config: SiteConfig, logAction?: string) => Promise<void>
}

/* ── TabBar ─────────────────────────────────────────── */

export function MediaTabBar({
  active,
  onChange,
}: {
  active: MediaTab
  onChange: (t: MediaTab) => void
}) {
  const tabs: { key: MediaTab; label: string }[] = [
    { key: "photos", label: "Photos" },
    { key: "video", label: "Video" },
    { key: "3d-tour", label: "3D Tour" },
    { key: "floor-plans", label: "Floor Plans" },
  ]

  return (
    <div className="flex gap-1 bg-[#1C1C1C] rounded-xl p-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
            active === tab.key
              ? "bg-[#9D5F36]/15 text-[#9D5F36]"
              : "text-[#ECE9E7]/40 hover:text-[#ECE9E7]/60 hover:bg-white/5"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* ── VideoTab ───────────────────────────────────────── */

export function VideoTab({
  config,
  propertyKey,
  selectedProperty,
  updateOverride,
  saveConfig,
}: MediaTabProps) {
  const override: PropertyOverride = config?.propertyOverrides?.[propertyKey] || {}
  const videoUrl = override.videoUrl ?? selectedProperty.videoUrl ?? ""
  const videoEnabled = override.videoEnabled ?? !!selectedProperty.videoUrl
  const [localUrl, setLocalUrl] = useState(videoUrl)

  // Reset local URL input when property changes
  useEffect(() => {
    setLocalUrl(override.videoUrl ?? selectedProperty.videoUrl ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyKey])

  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Video className="h-5 w-5 text-[#9D5F36]" />
        <h2 className="text-[#ECE9E7] font-medium">Video Walkthrough</h2>
      </div>

      <label className="flex items-center gap-3 mb-4 cursor-pointer group">
        <div
          className={cn(
            "w-9 h-5 rounded-full transition-colors relative",
            videoEnabled ? "bg-[#9D5F36]" : "bg-white/10"
          )}
          onClick={() =>
            updateOverride(
              { videoEnabled: !videoEnabled },
              `Video button ${!videoEnabled ? "enabled" : "disabled"} for ${selectedProperty.name}`
            )
          }
        >
          <div
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
              videoEnabled ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </div>
        <span className="text-sm text-[#ECE9E7]/60 group-hover:text-[#ECE9E7]/80">
          Enable Video Preview button on property card
        </span>
      </label>

      <div>
        <label className="block text-[#ECE9E7]/40 text-xs uppercase tracking-wider mb-1.5">
          YouTube URL
        </label>
        <input
          type="url"
          value={localUrl}
          onChange={(e) => {
            setLocalUrl(e.target.value)
            updateOverride({ videoUrl: e.target.value })
          }}
          onBlur={() => {
            const baseUrl = selectedProperty.videoUrl ?? ""
            if (localUrl !== baseUrl) {
              saveConfig(config, `Video URL updated for ${selectedProperty.name}`)
            }
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-[#ECE9E7]/20 focus:outline-none focus:border-[#9D5F36]/50"
        />
      </div>
    </div>
  )
}

/* ── VirtualTourTab ─────────────────────────────────── */

export function VirtualTourTab({
  config,
  propertyKey,
  selectedProperty,
  updateOverride,
  saveConfig,
}: MediaTabProps) {
  const override: PropertyOverride = config?.propertyOverrides?.[propertyKey] || {}
  const matterportUrl = override.matterportUrl ?? selectedProperty.matterportUrl ?? ""
  const matterportEnabled = override.matterportEnabled ?? !!selectedProperty.matterportUrl
  const [localUrl, setLocalUrl] = useState(matterportUrl)

  // Reset local URL input when property changes
  useEffect(() => {
    setLocalUrl(override.matterportUrl ?? selectedProperty.matterportUrl ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyKey])

  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Box className="h-5 w-5 text-[#9D5F36]" />
        <h2 className="text-[#ECE9E7] font-medium">3D Virtual Tour</h2>
      </div>

      <label className="flex items-center gap-3 mb-4 cursor-pointer group">
        <div
          className={cn(
            "w-9 h-5 rounded-full transition-colors relative",
            matterportEnabled ? "bg-[#9D5F36]" : "bg-white/10"
          )}
          onClick={() =>
            updateOverride(
              { matterportEnabled: !matterportEnabled },
              `3D View ${!matterportEnabled ? "enabled" : "disabled"} for ${selectedProperty.name}`
            )
          }
        >
          <div
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
              matterportEnabled ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </div>
        <span className="text-sm text-[#ECE9E7]/60 group-hover:text-[#ECE9E7]/80">
          Enable 3D View button on property card
        </span>
      </label>

      <div>
        <label className="block text-[#ECE9E7]/40 text-xs uppercase tracking-wider mb-1.5">
          Matterport URL
        </label>
        <input
          type="url"
          value={localUrl}
          onChange={(e) => {
            setLocalUrl(e.target.value)
            updateOverride({ matterportUrl: e.target.value })
          }}
          onBlur={() => {
            const baseUrl = selectedProperty.matterportUrl ?? ""
            if (localUrl !== baseUrl) {
              saveConfig(config, `Matterport URL updated for ${selectedProperty.name}`)
            }
          }}
          placeholder="https://my.matterport.com/show/?m=..."
          className="w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-[#ECE9E7]/20 focus:outline-none focus:border-[#9D5F36]/50"
        />
      </div>
    </div>
  )
}

/* ── FloorPlansTab ──────────────────────────────────── */

export function FloorPlansTab({
  config,
  propertyKey,
  selectedProperty,
  updateOverride,
}: MediaTabProps) {
  const override: PropertyOverride = config?.propertyOverrides?.[propertyKey] || {}
  const floorPlanImages = override.floorPlanImages ?? []
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function removeFloorPlan(index: number) {
    const updated = [...floorPlanImages]
    updated.splice(index, 1)
    updateOverride({ floorPlanImages: updated }, `Floor plan removed from ${selectedProperty.name}`)
  }

  async function addFloorPlanUrl(url: string) {
    if (!url.trim()) return
    try {
      const res = await fetch("/api/admin/save-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), subfolder: "floor-plans" }),
      })
      const data = await res.json()
      const localPath = data.localPath || url.trim()
      updateOverride(
        { floorPlanImages: [...floorPlanImages, localPath] },
        `Floor plan added to ${selectedProperty.name}`
      )
    } catch {
      updateOverride(
        { floorPlanImages: [...floorPlanImages, url.trim()] },
        `Floor plan added to ${selectedProperty.name}`
      )
    }
  }

  async function handleFileUpload(files: FileList | File[]) {
    if (!files.length) return
    setUploading(true)
    const newPaths: string[] = []
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("subfolder", "floor-plans")
        const res = await fetch("/api/admin/save-image", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.localPath) newPaths.push(data.localPath)
      } catch {
        // skip failed uploads
      }
    }
    if (newPaths.length > 0) {
      updateOverride(
        { floorPlanImages: [...floorPlanImages, ...newPaths] },
        `${newPaths.length} floor plan${newPaths.length > 1 ? "s" : ""} uploaded for ${selectedProperty.name}`
      )
    }
    setUploading(false)
  }

  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <FileImage className="h-5 w-5 text-[#9D5F36]" />
        <h2 className="text-[#ECE9E7] font-medium">Floor Plans</h2>
        <span className="text-[10px] text-[#ECE9E7]/20 uppercase tracking-wider ml-auto">
          {floorPlanImages.length} plan{floorPlanImages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files)
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all mb-4",
          uploading
            ? "border-[#9D5F36]/50 bg-[#9D5F36]/5 pointer-events-none"
            : "border-white/10 bg-white/[0.02] hover:border-[#9D5F36]/30 hover:bg-[#9D5F36]/5"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 text-[#9D5F36] animate-spin" />
            <p className="text-sm text-[#ECE9E7]/50">Uploading floor plans...</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-[#BCA28A]/60" />
            <p className="text-sm text-[#ECE9E7]/40">
              Drop floor plan images here or{" "}
              <span className="text-[#9D5F36] font-medium">browse</span>
            </p>
            <p className="text-[11px] text-[#ECE9E7]/20">
              JPG, PNG, PDF accepted — saved locally for persistence
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFileUpload(e.target.files)
              e.target.value = ""
            }
          }}
        />
      </div>

      {/* URL input */}
      <FloorPlanUrlInput onAdd={addFloorPlanUrl} />

      {/* Floor plan grid */}
      {floorPlanImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {floorPlanImages.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative group aspect-[4/3] bg-[#2B2B2B] rounded-xl overflow-hidden border border-white/5"
            >
              <Image
                src={src}
                alt={`Floor plan ${i + 1}`}
                fill
                className="object-contain p-2"
                unoptimized
              />
              <button
                onClick={() => removeFloorPlan(i)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-[#ECE9E7]/60">
                Floor {i + 1}
              </div>
              {src.startsWith("/uploads/") && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-[9px] text-emerald-400 font-medium">
                  Local
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#ECE9E7]/20 text-sm mt-3">
          No floor plans added yet. Upload images or paste a URL above.
        </p>
      )}
    </div>
  )
}

/* ── FloorPlanUrlInput ──────────────────────────────── */

function FloorPlanUrlInput({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState("")

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Or paste a floor plan image URL..."
        className="flex-1 bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-[#ECE9E7]/20 focus:outline-none focus:border-[#9D5F36]/50"
        onKeyDown={(e) => {
          if (e.key === "Enter" && url.trim()) {
            onAdd(url)
            setUrl("")
          }
        }}
      />
      <button
        onClick={() => {
          if (url.trim()) {
            onAdd(url)
            setUrl("")
          }
        }}
        className="px-4 py-2.5 bg-[#9D5F36] hover:bg-[#9D5F36]/80 text-white rounded-xl text-sm font-medium transition-colors"
      >
        Add URL
      </button>
    </div>
  )
}
