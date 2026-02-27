"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Trash2, RotateCcw, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePhotoOrder } from "@/components/photo-order-context"
import { properties } from "@/lib/data"

type TrashItem = {
  id: number
  property_slug: string
  src: string
  deleted_at: string
}

function formatPropertyName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function daysAgo(dateStr: string): number {
  const deleted = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - deleted.getTime()) / (1000 * 60 * 60 * 24))
}

function daysLeftBadge(elapsed: number) {
  const left = Math.max(0, 7 - elapsed)
  if (left >= 5) return { text: `${left} days left`, color: "bg-green-600/80 text-green-100" }
  if (left >= 2) return { text: `${left} days left`, color: "bg-yellow-600/80 text-yellow-100" }
  return { text: left <= 0 ? "Expiring" : `${left} day left`, color: "bg-red-600/80 text-red-100" }
}

export function TrashGrid() {
  const { orders, saveOrder } = usePhotoOrder()
  const [items, setItems] = useState<TrashItem[]>([])
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [purgingId, setPurgingId] = useState<number | null>(null)
  const [emptyingAll, setEmptyingAll] = useState(false)

  const fetchTrash = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/trash")
      if (res.ok) {
        const data = await res.json()
        setItems(data.trash || [])
      }
    } catch (err) {
      console.error("Failed to fetch trash:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + auto-purge expired items
  useEffect(() => {
    fetchTrash()
    // Auto-purge expired items on mount
    fetch("/api/admin/purge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purgeExpired: true }),
    }).catch(() => {})
  }, [fetchTrash])

  const handleRestore = useCallback(async (item: TrashItem) => {
    setRestoringId(item.id)
    try {
      // Add image back to photo order
      const property = properties.find(
        (p) => p.name.toLowerCase().replace(/\s+/g, "-") === item.property_slug
      )
      if (property) {
        const key = item.property_slug
        const currentOrder = orders[key] || []
        const newItem = { src: item.src, pos: currentOrder.length + 1, locked: false }
        await saveOrder(key, [...currentOrder, newItem])
      }
      // Remove from trash
      await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      })
      await fetchTrash()
    } catch (err) {
      console.error("Restore failed:", err)
    } finally {
      setRestoringId(null)
    }
  }, [orders, saveOrder, fetchTrash])

  const handlePurge = useCallback(async (id: number) => {
    setPurgingId(id)
    try {
      await fetch("/api/admin/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      await fetchTrash()
    } catch (err) {
      console.error("Purge failed:", err)
    } finally {
      setPurgingId(null)
    }
  }, [fetchTrash])

  const handleEmptyAll = useCallback(async () => {
    setEmptyingAll(true)
    try {
      // Purge each item individually
      await Promise.all(
        items.map((item) =>
          fetch("/api/admin/purge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.id }),
          })
        )
      )
      await fetchTrash()
    } catch (err) {
      console.error("Empty all failed:", err)
    } finally {
      setEmptyingAll(false)
    }
  }, [items, fetchTrash])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-[#9D5F36] animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/5 bg-white/[0.02]">
        <Trash2 className="h-12 w-12 text-[#ECE9E7]/15 mb-4" />
        <h2 className="text-[#ECE9E7]/40 font-serif text-xl mb-2">No deleted photos</h2>
        <p className="text-[#ECE9E7]/20 text-sm">
          Deleted photos will appear here for 7 days before being permanently removed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bulk actions */}
      <div className="flex items-center justify-between">
        <p className="text-[#ECE9E7]/50 text-sm">
          {items.length} item{items.length !== 1 ? "s" : ""} in trash
        </p>
        <button
          onClick={handleEmptyAll}
          disabled={emptyingAll}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors",
            emptyingAll
              ? "bg-red-900/40 text-red-300/50 cursor-wait"
              : "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20 hover:border-red-500/40"
          )}
        >
          {emptyingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          Empty All Trash
        </button>
      </div>

      {/* Trash grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const elapsed = daysAgo(item.deleted_at)
          const badge = daysLeftBadge(elapsed)
          const isRestoring = restoringId === item.id
          const isPurging = purgingId === item.id

          return (
            <div
              key={item.id}
              className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.src}
                  alt={`Deleted photo from ${formatPropertyName(item.property_slug)}`}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  unoptimized
                />
                {/* Days left badge */}
                <div
                  className={cn(
                    "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-bold",
                    badge.color
                  )}
                >
                  {badge.text}
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div>
                  <p className="text-[#ECE9E7] text-sm font-medium truncate">
                    {formatPropertyName(item.property_slug)}
                  </p>
                  <p className="text-[#ECE9E7]/30 text-xs">
                    Deleted {elapsed === 0 ? "today" : `${elapsed} day${elapsed !== 1 ? "s" : ""} ago`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={isRestoring}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      isRestoring
                        ? "bg-[#9D5F36]/30 text-[#9D5F36]/50 cursor-wait"
                        : "bg-[#9D5F36]/20 text-[#9D5F36] hover:bg-[#9D5F36]/30 border border-[#9D5F36]/20"
                    )}
                  >
                    {isRestoring ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Restore
                  </button>
                  <button
                    onClick={() => handlePurge(item.id)}
                    disabled={isPurging}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      isPurging
                        ? "bg-red-600/20 text-red-400/50 cursor-wait"
                        : "bg-red-600/10 text-red-400/70 hover:bg-red-600/20 hover:text-red-400 border border-red-500/10"
                    )}
                  >
                    {isPurging ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
