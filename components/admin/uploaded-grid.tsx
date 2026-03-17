"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { Upload, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type UploadedKind = "property-photo" | "floor-plan" | "experience"
const MEDIA_LIBRARY_UPDATED_EVENT = "admin-media-library-updated"

type UploadedFile = {
  src: string
  property: string | null
  kind: UploadedKind
  filename: string
  size: number
  modified: string
}

function formatPropertyName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function kindLabel(kind: UploadedKind): string {
  if (kind === "property-photo") return "Property Photo"
  if (kind === "floor-plan") return "Floor Plan"
  return "Experience"
}

export function UploadedGrid() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeKind, setActiveKind] = useState<UploadedKind | "all">("all")

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/uploaded-files")
      if (res.ok) {
        const data = await res.json()
        setFiles((data.files || []) as UploadedFile[])
      }
    } catch (err) {
      console.error("Failed to fetch uploaded files:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
    const handleRefresh = () => {
      setLoading(true)
      fetchFiles()
    }
    window.addEventListener(MEDIA_LIBRARY_UPDATED_EVENT, handleRefresh)
    return () => window.removeEventListener(MEDIA_LIBRARY_UPDATED_EVENT, handleRefresh)
  }, [fetchFiles])

  const counts = useMemo(() => {
    return {
      all: files.length,
      property: files.filter((f) => f.kind === "property-photo").length,
      floorPlans: files.filter((f) => f.kind === "floor-plan").length,
      experiences: files.filter((f) => f.kind === "experience").length,
    }
  }, [files])

  const filtered = useMemo(() => {
    if (activeKind === "all") return files
    return files.filter((file) => file.kind === activeKind)
  }, [files, activeKind])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 text-[#9D5F36] animate-spin" />
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/5 bg-white/[0.02]">
        <Upload className="h-10 w-10 text-[#ECE9E7]/15 mb-3" />
        <h2 className="text-[#ECE9E7]/40 font-serif text-lg mb-1">No uploaded images</h2>
        <p className="text-[#ECE9E7]/20 text-sm">
          Images uploaded through the admin will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          active={activeKind === "all"}
          label={`All (${counts.all})`}
          onClick={() => setActiveKind("all")}
        />
        <FilterPill
          active={activeKind === "property-photo"}
          label={`Property (${counts.property})`}
          onClick={() => setActiveKind("property-photo")}
        />
        <FilterPill
          active={activeKind === "floor-plan"}
          label={`Floor Plans (${counts.floorPlans})`}
          onClick={() => setActiveKind("floor-plan")}
        />
        <FilterPill
          active={activeKind === "experience"}
          label={`Experiences (${counts.experiences})`}
          onClick={() => setActiveKind("experience")}
        />
      </div>

      <p className="text-[#ECE9E7]/45 text-sm">
        {filtered.length} file{filtered.length !== 1 ? "s" : ""} shown
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((file) => (
          <div
            key={file.src}
            className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden group"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={file.src}
                alt={file.filename}
                fill
                className="object-cover group-hover:opacity-90 transition-opacity"
                unoptimized
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 text-white">
                {kindLabel(file.kind)}
              </div>
              {file.property && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#9D5F36]/80 text-white">
                  {formatPropertyName(file.property)}
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-[#ECE9E7]/60 text-xs truncate">{file.filename}</p>
              <p className="text-[#ECE9E7]/25 text-[10px]">
                {formatSize(file.size)} · {timeAgo(file.modified)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
        active
          ? "bg-[#9D5F36]/15 text-[#9D5F36] border-[#9D5F36]/40"
          : "text-[#ECE9E7]/45 border-white/10 hover:text-[#ECE9E7]/70 hover:border-white/20"
      )}
    >
      {label}
    </button>
  )
}
