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
  RotateCcw,
  ChevronDown,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { properties, Property } from "@/lib/data"
import { usePhotoOrder } from "@/components/photo-order-context"

type ImageItem = { src: string; pos: number; locked: boolean }

function toPropertyKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

function mergeSavedOrder(saved: ImageItem[], current: string[]): ImageItem[] {
  // If we have a saved order, it's the source of truth (includes uploads).
  // Only add static images that aren't in the saved order yet.
  if (saved.length > 0) {
    const savedSrcs = new Set(saved.map((item) => item.src))
    const newFromStatic = current
      .filter((src) => !savedSrcs.has(src))
      .map((src, i) => ({ src, pos: saved.length + i + 1, locked: false }))
    return [...saved, ...newFromStatic]
  }
  // No saved order yet — use static images as initial state
  return current.map((src, i) => ({ src, pos: i + 1, locked: false }))
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
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [trashOpen, setTrashOpen] = useState(false)
  const [trashItems, setTrashItems] = useState<{ id: number; property_slug: string; src: string; deleted_at: string }[]>([])
  const [trashLoading, setTrashLoading] = useState(false)

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
    setUploadError(null)
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
      const data = await res.json()

      // Show errors from server (unsupported format, too large, etc.)
      if (data.errors?.length) {
        setUploadError(data.errors.join("\n"))
      }

      if (!res.ok && !data.urls?.length) {
        // Total failure — no files saved
        if (!data.errors?.length) {
          setUploadError("Upload failed. Please try again.")
        }
        return
      }

      const newUrls: string[] = data.urls || []
      if (newUrls.length) {
        // Put new uploads FIRST so they're easy to find and reorder
        const newItems: ImageItem[] = newUrls.map((src, i) => ({
          src,
          pos: i + 1,
          locked: false,
        }))
        // Shift existing items down
        const shifted = reorderImages.map((img, i) => ({
          ...img,
          pos: img.locked ? img.pos : newUrls.length + i + 1,
        }))
        const updated = [...newItems, ...shifted]
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
    } catch (err) {
      console.error("Upload failed:", err)
      setUploadError("Upload failed — network error. Check your connection and try again.")
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

  // --- Trash management ---
  const loadTrash = useCallback(async () => {
    setTrashLoading(true)
    try {
      const res = await fetch("/api/admin/trash")
      if (res.ok) {
        const data = await res.json()
        setTrashItems(data.trash || [])
      }
    } catch (err) {
      console.error("Failed to load trash:", err)
    } finally {
      setTrashLoading(false)
    }
  }, [])

  const handleRestore = useCallback(async (trashItem: { id: number; property_slug: string; src: string }) => {
    try {
      // Remove from trash
      await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trashItem.id }),
      })
      // Add back to photo order at position 1 (first)
      const key = trashItem.property_slug
      const currentOrder = orders[key] || []
      const restoredItem: ImageItem = { src: trashItem.src, pos: 1, locked: false }
      const shifted = currentOrder.map((img) => ({ ...img, pos: img.locked ? img.pos : img.pos + 1 }))
      const updated = [restoredItem, ...shifted]
      await saveOrder(key, updated, versions[key])
      // Refresh trash list
      setTrashItems((prev) => prev.filter((t) => t.id !== trashItem.id))
      // If restored to current property, refresh local state
      if (key === propertyKey) {
        setReorderImages(updated)
      }
    } catch (err) {
      console.error("Restore failed:", err)
    }
  }, [orders, versions, saveOrder, propertyKey])

  const handlePurgeExpired = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purgeExpired: true }),
      })
      if (res.ok) {
        await loadTrash()
      }
    } catch (err) {
      console.error("Purge failed:", err)
    }
  }, [loadTrash])

  const handlePurgeSingle = useCallback(async (id: number) => {
    try {
      await fetch("/api/admin/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setTrashItems((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error("Purge single failed:", err)
    }
  }, [])

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
      {/* Property Selector + Upload in a card */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-5">
        <label
          htmlFor="property-select"
          className="block text-[#ECE9E7]/40 text-xs uppercase tracking-wider mb-2"
        >
          Select Property
        </label>
        <select
          id="property-select"
          value={selectedProperty.id}
          onChange={(e) => {
            const prop = properties.find((p) => p.id === e.target.value)
            if (prop) setSelectedProperty(prop)
          }}
          className="w-full max-w-md px-4 py-2.5 rounded-xl bg-[#2B2B2B] border border-white/10 text-[#ECE9E7] text-sm focus:outline-none focus:border-[#9D5F36]/50 transition-colors appearance-none cursor-pointer"
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
          accept=".jpg,.jpeg,.png,.webp,.avif"
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

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-600/15 border border-red-500/30">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 text-sm font-semibold mb-1">Upload Issue</p>
            {uploadError.split("\n").map((line, i) => (
              <p key={i} className="text-red-300/80 text-xs">{line}</p>
            ))}
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-400/60 hover:text-red-300 transition-colors text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Photo Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#ECE9E7] font-serif text-lg">
            {selectedProperty.name}
            <span className="ml-2 text-sm font-sans text-[#ECE9E7]/30 font-normal">
              {reorderImages.length} photo{reorderImages.length !== 1 ? "s" : ""}
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
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
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                loading="lazy"
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
                className="absolute bottom-2 left-2 flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md bg-green-600/90 text-white text-[10px] font-bold shadow-lg"
                title={item.src.split("/").pop()}
              >
                {item.src.match(/(\d+)\.jpg/)?.[1] || "?"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 bg-[#1C1C1C]/95 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#ECE9E7]/40">
            <span className="text-[#ECE9E7]/60 font-medium">{reorderImages.length}</span>{" "}
            photo{reorderImages.length !== 1 ? "s" : ""} in{" "}
            <span className="text-[#ECE9E7]/60">{selectedProperty.name}</span>
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

      {/* Trash Panel */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 overflow-hidden">
        <button
          onClick={() => { setTrashOpen(!trashOpen); if (!trashOpen) loadTrash() }}
          className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="h-4 w-4 text-[#BCA28A]" />
            <span className="text-[#ECE9E7] text-sm font-medium">Trash</span>
            {trashItems.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 font-medium">
                {trashItems.length}
              </span>
            )}
          </div>
          <ChevronDown className={cn("h-4 w-4 text-[#BCA28A] transition-transform", trashOpen && "rotate-180")} />
        </button>

        {trashOpen && (
          <div className="px-5 pb-5 border-t border-white/5">
            {trashLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 text-[#BCA28A] animate-spin" />
              </div>
            ) : trashItems.length === 0 ? (
              <p className="text-[#ECE9E7]/30 text-sm py-6 text-center">Trash is empty</p>
            ) : (
              <>
                <div className="flex items-center justify-between py-3">
                  <p className="text-[#ECE9E7]/40 text-xs">
                    Items older than 7 days are auto-purged
                  </p>
                  <button
                    onClick={handlePurgeExpired}
                    className="text-xs text-red-400/70 hover:text-red-400 transition-colors font-medium"
                  >
                    Purge Expired
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {trashItems.map((item) => (
                    <div key={item.id} className="relative aspect-[4/3] rounded-lg overflow-hidden group border border-white/5">
                      <Image
                        src={item.src}
                        alt={`Trashed photo from ${item.property_slug}`}
                        fill
                        className="object-cover opacity-50 group-hover:opacity-80 transition-opacity"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRestore(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600/90 hover:bg-green-500 text-white text-[10px] font-bold transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" /> Restore
                        </button>
                        <button
                          onClick={() => handlePurgeSingle(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold transition-colors"
                        >
                          <X className="h-3 w-3" /> Delete Forever
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1 right-1 text-center">
                        <span className="text-[9px] text-white/60 bg-black/50 px-1.5 py-0.5 rounded">
                          {item.property_slug}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
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
