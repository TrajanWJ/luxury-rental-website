"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import {
  Upload,
  GripVertical,
  Lock,
  Unlock,
  Trash2,
  Save,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { properties, Property } from "@/lib/data"
import { usePhotoOrder } from "@/components/photo-order-context"

type ImageItem = { src: string; pos: number; locked: boolean }

function toPropertyKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

function mergeSavedOrder(saved: ImageItem[], current: string[]): ImageItem[] {
  const currentSet = new Set(current)
  const kept = saved.filter((item) => currentSet.has(item.src))
  const keptSrcs = new Set(kept.map((item) => item.src))
  const newItems = current
    .filter((src) => !keptSrcs.has(src))
    .map((src, i) => ({ src, pos: kept.length + i + 1, locked: false }))
  return [...kept, ...newItems]
}

export function PhotoManager() {
  const { orders, versions, saveOrder } = usePhotoOrder()

  const [selectedProperty, setSelectedProperty] = useState<Property>(properties[0])
  const [reorderImages, setReorderImages] = useState<ImageItem[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "conflict">("idle")
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load images when property changes or orders update
  useEffect(() => {
    const key = toPropertyKey(selectedProperty.name)
    const saved = orders[key] || []
    setReorderImages(mergeSavedOrder(saved, selectedProperty.images))
    setEditingIndex(null)
    setDragIndex(null)
    setDeleteTarget(null)
    setSaveStatus("idle")
  }, [selectedProperty, orders])

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const propertyKey = toPropertyKey(selectedProperty.name)
  const version = versions[propertyKey]

  // --- Save handler ---
  const handleSave = useCallback(async () => {
    setSaveStatus("saving")
    const result = await saveOrder(propertyKey, reorderImages, version)
    if (result === "conflict") {
      setSaveStatus("conflict")
    } else {
      setSaveStatus(result ? "saved" : "idle")
      if (result) {
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2500)
      }
    }
  }, [propertyKey, reorderImages, version, saveOrder])

  // --- Upload handler ---
  const handleUpload = useCallback(async (files: FileList | File[]) => {
    if (!files.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("property", propertyKey)
      for (const file of Array.from(files)) {
        formData.append("files", file)
      }
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const newUrls: string[] = data.urls || []
        if (newUrls.length) {
          const newItems: ImageItem[] = newUrls.map((src, i) => ({
            src,
            pos: reorderImages.length + i + 1,
            locked: false,
          }))
          const updated = [...reorderImages, ...newItems]
          setReorderImages(updated)
          // Auto-save after upload
          setSaveStatus("saving")
          const result = await saveOrder(propertyKey, updated, version)
          if (result === "conflict") {
            setSaveStatus("conflict")
          } else {
            setSaveStatus(result ? "saved" : "idle")
            if (result) {
              if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
              savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2500)
            }
          }
        }
      }
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploading(false)
    }
  }, [propertyKey, reorderImages, version, saveOrder])

  // --- Delete handler ---
  const handleDelete = useCallback(async (index: number) => {
    const item = reorderImages[index]
    if (!item) return

    // Call delete API to add to trash
    try {
      await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property: propertyKey, src: item.src }),
      })
    } catch (err) {
      console.error("Delete API call failed:", err)
    }

    // Remove from local state and re-number
    const updated = reorderImages
      .filter((_, idx) => idx !== index)
      .map((img, idx) => ({ ...img, pos: img.locked ? img.pos : idx + 1 }))
    setReorderImages(updated)
    setDeleteTarget(null)

    // Save order after delete
    setSaveStatus("saving")
    const result = await saveOrder(propertyKey, updated, version)
    if (result === "conflict") {
      setSaveStatus("conflict")
    } else {
      setSaveStatus(result ? "saved" : "idle")
      if (result) {
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2500)
      }
    }
  }, [propertyKey, reorderImages, version, saveOrder])

  // --- Drop zone drag events ---
  const [dragOver, setDragOver] = useState(false)

  const handleDropZoneDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "copy"
    setDragOver(true)
  }, [])

  const handleDropZoneDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDropZoneDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length) handleUpload(files)
  }, [handleUpload])

  return (
    <div className="space-y-6">
      {/* Property Selector */}
      <div>
        <label
          htmlFor="property-select"
          className="block text-sm font-medium text-[#ECE9E7]/70 mb-2 uppercase tracking-[0.1em]"
        >
          Property
        </label>
        <select
          id="property-select"
          value={selectedProperty.id}
          onChange={(e) => {
            const prop = properties.find((p) => p.id === e.target.value)
            if (prop) setSelectedProperty(prop)
          }}
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-[#2B2B2B] border border-white/10 text-[#ECE9E7] text-sm focus:outline-none focus:border-[#9D5F36] focus:ring-1 focus:ring-[#9D5F36]/50 transition-colors appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23BCA28A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: "40px",
          }}
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Zone */}
      <div
        ref={dropZoneRef}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={handleDropZoneDragLeave}
        onDrop={handleDropZoneDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all",
          dragOver
            ? "border-[#9D5F36] bg-[#9D5F36]/10"
            : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-[#9D5F36] animate-spin" />
            <p className="text-sm text-[#ECE9E7]/60">Uploading photos...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-[#BCA28A]" />
            <p className="text-sm text-[#ECE9E7]/60">
              Drop photos here or{" "}
              <span className="text-[#9D5F36] font-medium underline underline-offset-2">
                click to browse
              </span>
            </p>
            <p className="text-xs text-[#ECE9E7]/30">JPG, PNG, WebP accepted</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleUpload(e.target.files)
              e.target.value = ""
            }
          }}
        />
      </div>

      {/* Photo Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[#ECE9E7] font-serif text-lg">
            {selectedProperty.name} — Photos ({reorderImages.length})
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#ECE9E7]/35">
            <span>Drag to reorder</span>
            <span>
              <span className="text-red-400 font-bold">Pos</span> = click to edit
            </span>
            <span>
              <span className="text-yellow-400">Lock</span> = pin in place
            </span>
            <span>
              <span className="text-green-400 font-bold">ID</span> = filename number
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {reorderImages.map((item, i) => (
            <div
              key={item.src}
              draggable={!item.locked}
              onDragStart={(e) => {
                if (item.locked) {
                  e.preventDefault()
                  return
                }
                setDragIndex(i)
                e.dataTransfer.effectAllowed = "move"
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (dragIndex === null || dragIndex === i) return
                const updated = [...reorderImages]
                const [dragged] = updated.splice(dragIndex, 1)
                updated.splice(i, 0, dragged)
                const result = updated.map((img, idx) => ({
                  ...img,
                  pos: img.locked ? img.pos : idx + 1,
                }))
                setReorderImages(result)
                setDragIndex(null)
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "relative aspect-[4/3] rounded-lg overflow-hidden group border-2 transition-all",
                dragIndex === i
                  ? "opacity-50 border-green-400"
                  : "border-transparent",
                item.locked
                  ? "ring-2 ring-yellow-400/50"
                  : "cursor-grab active:cursor-grabbing"
              )}
            >
              <Image
                src={item.src}
                alt={`${selectedProperty.name} photo ${i + 1}`}
                fill
                className="object-cover pointer-events-none"
                unoptimized
              />
              {/* Drag handle */}
              {!item.locked && (
                <div className="absolute top-2 left-2 p-1 rounded bg-black/50 text-white/70">
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              {/* Position number (red) — editable */}
              {editingIndex === i ? (
                <input
                  autoFocus
                  type="text"
                  defaultValue={item.pos}
                  className="absolute top-2 right-2 w-16 h-7 rounded-full bg-red-600 text-white text-xs font-bold text-center outline-none ring-2 ring-white"
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val)) {
                      const updated = [...reorderImages]
                      updated[i] = { ...updated[i], pos: val }
                      updated.sort((a, b) => a.pos - b.pos)
                      setReorderImages(updated)
                    }
                    setEditingIndex(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur()
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingIndex(i)
                  }}
                  className="absolute top-2 right-2 flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg hover:bg-red-500 transition-colors"
                  title="Click to edit position"
                >
                  Pos: {item.pos}
                </button>
              )}
              {/* Lock button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const updated = [...reorderImages]
                  updated[i] = { ...updated[i], locked: !updated[i].locked }
                  setReorderImages(updated)
                }}
                className={cn(
                  "absolute bottom-2 right-2 p-1.5 rounded-full shadow-lg transition-colors",
                  item.locked
                    ? "bg-yellow-500 text-black"
                    : "bg-black/50 text-white/60 hover:bg-black/70"
                )}
                title={item.locked ? "Unlock position" : "Lock position"}
              >
                {item.locked ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Unlock className="h-3.5 w-3.5" />
                )}
              </button>
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(i)
                }}
                className="absolute bottom-2 right-12 p-1.5 rounded-full bg-black/50 text-white/60 hover:bg-red-600 hover:text-white shadow-lg transition-colors"
                title="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              {/* ID number (from filename) */}
              <div
                className="absolute bottom-2 left-2 flex items-center justify-center min-w-[40px] h-10 px-2.5 rounded-lg bg-green-600 text-white text-lg font-black shadow-lg"
                title={item.src.split("/").pop()}
              >
                ID: {item.src.match(/(\d+)\.jpg/)?.[1] || "?"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 z-10 -mx-6 px-6 py-4 bg-[#232323]/95 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#ECE9E7]/50">
            {reorderImages.length} photo{reorderImages.length !== 1 ? "s" : ""} in{" "}
            {selectedProperty.name}
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === "conflict" && (
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                <AlertTriangle className="h-3.5 w-3.5" />
                Conflict — someone else saved. Refresh to see latest.
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-[0.08em] transition-colors",
                saveStatus === "saved"
                  ? "bg-green-600 text-white"
                  : saveStatus === "saving"
                  ? "bg-yellow-600 text-white cursor-wait"
                  : saveStatus === "conflict"
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-[#9D5F36] hover:bg-[#b8713f] text-white"
              )}
            >
              {saveStatus === "saved" ? (
                <Check className="h-4 w-4" />
              ) : saveStatus === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                ? "Saved!"
                : saveStatus === "conflict"
                ? "Retry Save"
                : "Save Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#1C1C1C] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-600/20">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <h4 className="text-white font-serif text-lg">Remove Photo?</h4>
            </div>
            <p className="text-white/60 text-sm mb-2">
              This will remove{" "}
              <span className="text-white font-medium">
                ID:{" "}
                {reorderImages[deleteTarget]?.src.match(/(\d+)\.jpg/)?.[1] ||
                  "?"}
              </span>{" "}
              from the photo layout and move it to trash.
            </p>
            <p className="text-white/40 text-xs mb-6">
              The file will be moved to the trash folder. You can restore it
              later if needed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
              >
                Delete & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
