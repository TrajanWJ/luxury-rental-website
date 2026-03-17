"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { properties } from "@/lib/data"
import type { SiteConfig, PropertyOverride } from "@/lib/site-config-store"
import { SaveIndicator } from "@/components/admin/save-indicator"
import { GripVertical, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Helpers ──────────────────────────────────────── */

function toKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

/* ── Component ────────────────────────────────────── */

export function OverviewOrdering() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const saveTimeout = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {})
  }, [])

  /* ── Ordered property list ────────────────────────── */

  const displayOrder =
    config?.propertyOrder && config.propertyOrder.length > 0
      ? config.propertyOrder
      : properties.map((p) => p.id)

  const orderedProperties = displayOrder
    .map((id) => properties.find((p) => p.id === id))
    .filter(Boolean) as typeof properties

  const missingProperties = properties.filter((p) => !displayOrder.includes(p.id))
  const fullOrderedProperties = [...orderedProperties, ...missingProperties]

  /* ── Save handler ─────────────────────────────────── */

  const saveConfig = useCallback(async (updatedConfig: SiteConfig, logAction?: string) => {
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
  }, [])

  /* ── Ordering helpers ─────────────────────────────── */

  function updatePropertyOrder(newOrder: string[]) {
    if (!config) return
    const updated: SiteConfig = { ...config, propertyOrder: newOrder }
    setConfig(updated)
    saveConfig(updated, "Property display order updated")
  }

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
    const order = [
      ...(config?.propertyOrder?.length ? config.propertyOrder : properties.map((p) => p.id)),
    ]
    const [moved] = order.splice(dragIndex, 1)
    order.splice(index, 0, moved)
    updatePropertyOrder(order)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function moveProperty(index: number, direction: -1 | 1) {
    const order = [
      ...(config?.propertyOrder?.length ? config.propertyOrder : properties.map((p) => p.id)),
    ]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= order.length) return
    ;[order[index], order[newIndex]] = [order[newIndex], order[index]]
    updatePropertyOrder(order)
  }

  /* ── Visibility toggle helper ─────────────────────── */

  function updateOverride(propertyKey: string, fields: Partial<PropertyOverride>, logMsg?: string) {
    if (!config) return
    const updated: SiteConfig = {
      ...config,
      propertyOverrides: {
        ...config.propertyOverrides,
        [propertyKey]: {
          ...config.propertyOverrides?.[propertyKey],
          ...fields,
        },
      },
    }
    setConfig(updated)
    saveConfig(updated, logMsg)
  }

  /* ── Loading state ────────────────────────────────── */

  if (!config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#9D5F36]" />
      </div>
    )
  }

  return (
    <div className="space-y-3 max-w-4xl">
      {/* Save indicator */}
      <div className="flex justify-end">
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Property rows */}
      <div className="space-y-2">
        {fullOrderedProperties.map((property, index) => {
          const propKey = toKey(property.name)
          const propOverride: PropertyOverride = config.propertyOverrides?.[propKey] || {}
          const showOnHomepage = propOverride.showOnHomepage !== false
          const showOnSite = propOverride.showOnSite !== false
          const isHidden = !showOnHomepage || !showOnSite

          const isDragging = dragIndex === index
          const isDragOver = dragOverIndex === index

          // Media summary parts
          const photoCount = property.images?.length ?? 0
          const has3d =
            (propOverride.matterportEnabled ?? !!property.matterportUrl) &&
            (propOverride.matterportUrl ?? property.matterportUrl)
          const hasVideo =
            (propOverride.videoEnabled ?? !!property.videoUrl) &&
            (propOverride.videoUrl ?? property.videoUrl)

          const mediaParts: string[] = []
          if (property.hostawayId) mediaParts.push(`Hostaway #${property.hostawayId}`)
          if (photoCount > 0) mediaParts.push(`${photoCount} photos`)
          if (has3d) mediaParts.push("3D tour")
          if (hasVideo) mediaParts.push("Video")

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
                "bg-[#1C1C1C] border border-white/5 rounded-xl px-3 sm:px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 transition-all",
                isDragging && "opacity-30",
                isDragOver && "bg-[#9D5F36]/10 border-[#9D5F36]/30",
                isHidden && !isDragging && !isDragOver && "opacity-50"
              )}
            >
              {/* Drag handle + position: always on the left */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <GripVertical className="h-4 w-4 text-[#ECE9E7]/15 cursor-grab" />
                <span className="w-5 text-center text-xs font-mono text-[#ECE9E7]/20">
                  {index + 1}
                </span>
              </div>

              {/* Property info: takes remaining width on the first line */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium leading-snug",
                    isHidden
                      ? "line-through text-[#ECE9E7]/30"
                      : "text-[#ECE9E7]"
                  )}
                >
                  {property.name}
                </p>
                {mediaParts.length > 0 && (
                  <p className="text-[11px] text-[#ECE9E7]/25 mt-0.5 truncate">
                    {mediaParts.join(" · ")}
                  </p>
                )}
              </div>

              {/* Arrow buttons: keep with property name on desktop, wrap on mobile */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => moveProperty(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 rounded text-[#ECE9E7]/20 hover:text-[#ECE9E7]/60 disabled:opacity-20 transition-colors"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveProperty(index, 1)}
                  disabled={index === fullOrderedProperties.length - 1}
                  className="p-1.5 rounded text-[#ECE9E7]/20 hover:text-[#ECE9E7]/60 disabled:opacity-20 transition-colors"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Visibility badges + quick-jump pills: wrap to second line on mobile */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() =>
                    updateOverride(
                      propKey,
                      { showOnHomepage: !showOnHomepage },
                      `${property.name} ${!showOnHomepage ? "shown on" : "hidden from"} homepage`
                    )
                  }
                  className={cn(
                    "text-[10px] px-2.5 py-1.5 rounded-full border font-medium transition-colors",
                    showOnHomepage
                      ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400/70 hover:bg-emerald-500/15"
                      : "bg-red-500/5 border-red-500/15 text-red-400/50 hover:bg-red-500/10"
                  )}
                >
                  Homepage
                </button>
                <button
                  onClick={() =>
                    updateOverride(
                      propKey,
                      { showOnSite: !showOnSite },
                      `${property.name} ${!showOnSite ? "shown on" : "hidden from"} site`
                    )
                  }
                  className={cn(
                    "text-[10px] px-2.5 py-1.5 rounded-full border font-medium transition-colors",
                    showOnSite
                      ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400/70 hover:bg-emerald-500/15"
                      : "bg-red-500/5 border-red-500/15 text-red-400/50 hover:bg-red-500/10"
                  )}
                >
                  Site-wide
                </button>
                <a
                  href="/admin/photos"
                  className="text-[#9D5F36] bg-[#9D5F36]/10 hover:bg-[#9D5F36]/20 text-[10px] px-2.5 py-1.5 rounded transition-colors"
                >
                  Photos
                </a>
                <a
                  href="/admin/photos"
                  className="text-[#9D5F36] bg-[#9D5F36]/10 hover:bg-[#9D5F36]/20 text-[10px] px-2.5 py-1.5 rounded transition-colors"
                >
                  Media
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tip bar */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-[11px] text-[#ECE9E7]/25 leading-relaxed">
        <strong className="text-[#ECE9E7]/40">Tip:</strong> Drag rows to reorder how properties
        appear on the homepage. Click visibility badges to toggle. Quick-links jump to Photos or
        Media for that property.
      </div>
    </div>
  )
}
