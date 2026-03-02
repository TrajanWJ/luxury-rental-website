"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { properties } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { PropertyOverride, SiteConfig } from "@/lib/site-config-store"
import {
  Eye,
  EyeOff,
  GripVertical,
  Check,
  Loader2,
  Link2,
  Video,
  Box,
  FileImage,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  ExternalLink,
} from "lucide-react"

/* ── Helpers ──────────────────────────────────────── */

function toKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

/* ── Component ────────────────────────────────────── */

export function PropertySettings() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || "")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [floorPlanUploading, setFloorPlanUploading] = useState(false)
  const saveTimeout = useRef<NodeJS.Timeout>()
  const floorPlanInputRef = useRef<HTMLInputElement>(null)

  // Fetch config
  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {})
  }, [])

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId)!
  const propertyKey = selectedProperty ? toKey(selectedProperty.name) : ""

  // Get override for selected property (or defaults)
  const override: PropertyOverride = config?.propertyOverrides?.[propertyKey] || {}

  // Effective values (override → base data)
  const matterportUrl = override.matterportUrl ?? selectedProperty?.matterportUrl ?? ""
  const matterportEnabled = override.matterportEnabled ?? !!selectedProperty?.matterportUrl
  const videoUrl = override.videoUrl ?? selectedProperty?.videoUrl ?? ""
  const videoEnabled = override.videoEnabled ?? !!selectedProperty?.videoUrl
  const showOnHomepage = override.showOnHomepage ?? true
  const showOnSite = override.showOnSite ?? true
  const floorPlanImages = override.floorPlanImages ?? []

  // Property order
  const displayOrder =
    config?.propertyOrder && config.propertyOrder.length > 0
      ? config.propertyOrder
      : properties.map((p) => p.id)

  const orderedProperties = displayOrder
    .map((id) => properties.find((p) => p.id === id))
    .filter(Boolean) as typeof properties

  const missingProperties = properties.filter(
    (p) => !displayOrder.includes(p.id)
  )
  const fullOrderedProperties = [...orderedProperties, ...missingProperties]

  /* ── Save handler ────────────────────────────────── */

  const saveConfig = useCallback(
    async (updatedConfig: SiteConfig, logAction?: string) => {
      setSaveStatus("saving")
      try {
        await fetch("/api/site-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: updatedConfig, logAction }),
        })
        try {
          localStorage.setItem("site-config-updated", Date.now().toString())
        } catch {}
        setSaveStatus("saved")
        clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(() => setSaveStatus("idle"), 2000)
      } catch {
        setSaveStatus("idle")
      }
    },
    []
  )

  /* ── Field update helpers ────────────────────────── */

  function updateOverride(fields: Partial<PropertyOverride>, logMsg?: string) {
    if (!config) return
    const updated: SiteConfig = {
      ...config,
      propertyOverrides: {
        ...config.propertyOverrides,
        [propertyKey]: {
          ...config.propertyOverrides[propertyKey],
          ...fields,
        },
      },
    }
    setConfig(updated)
    saveConfig(updated, logMsg)
  }

  function updatePropertyOrder(newOrder: string[]) {
    if (!config) return
    const updated: SiteConfig = { ...config, propertyOrder: newOrder }
    setConfig(updated)
    saveConfig(updated, "Property display order updated")
  }

  /* ── Drag handlers for property order ────────────── */

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const order = [...(config?.propertyOrder?.length ? config.propertyOrder : properties.map((p) => p.id))]
    const [moved] = order.splice(dragIndex, 1)
    order.splice(index, 0, moved)
    updatePropertyOrder(order)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function moveProperty(index: number, direction: -1 | 1) {
    const order = [...(config?.propertyOrder?.length ? config.propertyOrder : properties.map((p) => p.id))]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= order.length) return
    ;[order[index], order[newIndex]] = [order[newIndex], order[index]]
    updatePropertyOrder(order)
  }

  /* ── Floor plan handlers ─────────────────────────── */

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

  async function handleFloorPlanFileUpload(files: FileList | File[]) {
    if (!files.length) return
    setFloorPlanUploading(true)
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
        // Skip failed uploads
      }
    }
    if (newPaths.length > 0) {
      updateOverride(
        { floorPlanImages: [...floorPlanImages, ...newPaths] },
        `${newPaths.length} floor plan${newPaths.length > 1 ? "s" : ""} uploaded for ${selectedProperty.name}`
      )
    }
    setFloorPlanUploading(false)
  }

  /* ── Loading state ──────────────────────────────── */

  if (!config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#9D5F36]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── Property Selector ────────────────────────── */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-[#ECE9E7]/40 text-xs uppercase tracking-wider mb-2">
              Select Property
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9D5F36]/50"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility toggles — improved labels */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() =>
                updateOverride(
                  { showOnHomepage: !showOnHomepage },
                  `${selectedProperty.name} ${!showOnHomepage ? "shown on" : "hidden from"} homepage`
                )
              }
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors border",
                showOnHomepage
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/20 bg-red-500/5 text-red-400/70"
              )}
            >
              {showOnHomepage ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold">{showOnHomepage ? "Visible" : "Hidden"} on Homepage</span>
                <span className="text-[10px] opacity-60">
                  {showOnHomepage ? "Appears in property panels" : "Removed from homepage panels"}
                </span>
              </span>
            </button>
            <button
              onClick={() =>
                updateOverride(
                  { showOnSite: !showOnSite },
                  `${selectedProperty.name} ${!showOnSite ? "shown on" : "hidden from"} site`
                )
              }
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors border",
                showOnSite
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/20 bg-red-500/5 text-red-400/70"
              )}
            >
              {showOnSite ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold">{showOnSite ? "Visible" : "Hidden"} Across Entire Site</span>
                <span className="text-[10px] opacity-60">
                  {showOnSite ? "Detail page & all listings accessible" : "Not visible anywhere on site"}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Hostaway info + Photo Management link */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#ECE9E7]/30">
            {selectedProperty?.hostawayId && (
              <>
                <Link2 className="h-3 w-3" />
                <span>Hostaway ID: {selectedProperty.hostawayId}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400/60">Linked</span>
              </>
            )}
          </div>
          <a
            href="/admin/photos"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#9D5F36] border border-[#9D5F36]/20 hover:bg-[#9D5F36]/10 transition-colors"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Manage Photos
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        </div>

        {/* Save indicator */}
        {saveStatus !== "idle" && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-[#BCA28A]" />
                <span className="text-[#BCA28A]">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Saved</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── 3D Virtual Tour ──────────────────────────── */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
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
            value={matterportUrl}
            onChange={(e) => updateOverride({ matterportUrl: e.target.value })}
            onBlur={() => {
              if (matterportUrl !== (selectedProperty?.matterportUrl ?? "")) {
                saveConfig(config!, `Matterport URL updated for ${selectedProperty.name}`)
              }
            }}
            placeholder="https://my.matterport.com/show/?m=..."
            className="w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-[#ECE9E7]/20 focus:outline-none focus:border-[#9D5F36]/50"
          />
        </div>
      </div>

      {/* ── Video Walkthrough ────────────────────────── */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
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
            value={videoUrl}
            onChange={(e) => updateOverride({ videoUrl: e.target.value })}
            onBlur={() => {
              if (videoUrl !== (selectedProperty?.videoUrl ?? "")) {
                saveConfig(config!, `Video URL updated for ${selectedProperty.name}`)
              }
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-[#ECE9E7]/20 focus:outline-none focus:border-[#9D5F36]/50"
          />
        </div>
      </div>

      {/* ── Floor Plans (drag-and-drop + URL input) ──── */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileImage className="h-5 w-5 text-[#9D5F36]" />
          <h2 className="text-[#ECE9E7] font-medium">Floor Plans</h2>
          <span className="text-[10px] text-[#ECE9E7]/20 uppercase tracking-wider ml-auto">
            {floorPlanImages.length} plan{floorPlanImages.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Drag-and-drop upload zone */}
        <div
          onClick={() => floorPlanInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.dataTransfer.files.length) handleFloorPlanFileUpload(e.dataTransfer.files)
          }}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all mb-4",
            floorPlanUploading
              ? "border-[#9D5F36]/50 bg-[#9D5F36]/5 pointer-events-none"
              : "border-white/10 bg-white/[0.02] hover:border-[#9D5F36]/30 hover:bg-[#9D5F36]/5"
          )}
        >
          {floorPlanUploading ? (
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
              <p className="text-[11px] text-[#ECE9E7]/20">JPG, PNG, PDF accepted — saved locally for persistence</p>
            </>
          )}
          <input
            ref={floorPlanInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                handleFloorPlanFileUpload(e.target.files)
                e.target.value = ""
              }
            }}
          />
        </div>

        {/* OR: URL input */}
        <FloorPlanUrlInput onAdd={addFloorPlanUrl} />

        {/* Floor plan grid */}
        {floorPlanImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
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
          <p className="text-[#ECE9E7]/20 text-sm mt-3">No floor plans added yet. Upload images or paste a URL above.</p>
        )}
      </div>

      {/* ── Property Display Order ───────────────────── */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GripVertical className="h-5 w-5 text-[#9D5F36]" />
          <h2 className="text-[#ECE9E7] font-medium">Property Display Order</h2>
        </div>
        <p className="text-[#ECE9E7]/30 text-xs mb-4">
          Drag or use arrows to reorder how properties appear on the homepage
        </p>

        <div className="space-y-1">
          {fullOrderedProperties.map((property, index) => {
            const propOverride = config.propertyOverrides[toKey(property.name)] || {}
            const isHomepageVisible = propOverride.showOnHomepage !== false
            const isSiteVisible = propOverride.showOnSite !== false
            const isDragging = dragIndex === index
            const isDragOver = dragOverIndex === index

            return (
              <div
                key={property.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => {
                  setDragIndex(null)
                  setDragOverIndex(null)
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-grab active:cursor-grabbing",
                  isDragging && "opacity-30",
                  isDragOver && "bg-[#9D5F36]/10 border border-[#9D5F36]/30",
                  !isDragging && !isDragOver && "bg-[#2B2B2B]/50 hover:bg-[#2B2B2B]"
                )}
              >
                <GripVertical className="h-4 w-4 text-[#ECE9E7]/20 flex-shrink-0" />
                <span className="w-6 text-center text-xs text-[#ECE9E7]/30 font-mono">
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    isHomepageVisible && isSiteVisible ? "text-[#ECE9E7]" : "text-[#ECE9E7]/30 line-through"
                  )}
                >
                  {property.name}
                </span>
                {!isSiteVisible && (
                  <span className="text-[10px] uppercase tracking-wider text-red-400/50 px-2 py-0.5 rounded bg-red-500/10">
                    Hidden from site
                  </span>
                )}
                {isSiteVisible && !isHomepageVisible && (
                  <span className="text-[10px] uppercase tracking-wider text-[#ECE9E7]/20 px-2 py-0.5 rounded bg-white/5">
                    Hidden from homepage
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveProperty(index, -1)}
                    disabled={index === 0}
                    className="p-1 rounded text-[#ECE9E7]/20 hover:text-[#ECE9E7]/60 disabled:opacity-20"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => moveProperty(index, 1)}
                    disabled={index === fullOrderedProperties.length - 1}
                    className="p-1 rounded text-[#ECE9E7]/20 hover:text-[#ECE9E7]/60 disabled:opacity-20"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Floor Plan URL Input ─────────────────────────── */

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
