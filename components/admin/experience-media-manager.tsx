"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { experiences, type Experience, type ExperienceType } from "@/lib/experiences"
import type { SiteConfig } from "@/lib/site-config-store"
import { Loader2, Upload, ImageIcon, Link2 } from "lucide-react"
import { SaveIndicator } from "@/components/admin/save-indicator"
import { cn } from "@/lib/utils"

type ManagedExperience = Experience & {
  isAddition: boolean
  isHidden: boolean
}

const EXPERIENCE_TYPES: ExperienceType[] = [
  "dining",
  "wellness",
  "boating",
  "entertainment",
  "lifestyle",
  "childcare",
]

function buildManagedExperiences(config: SiteConfig): ManagedExperience[] {
  const additions = (config.conciergeAdditions || []).map((item) => ({
    ...item,
    isAddition: true,
    isHidden: false,
  }))

  const base = experiences.map((item) => ({
    ...item,
    isAddition: false,
    isHidden: false,
  }))

  const all = [...base, ...additions]
  const overrides = config.conciergeOverrides || {}

  const merged = all.map((item) => {
    const override = overrides[item.id]
    if (!override) return item
    return {
      ...item,
      ...override,
      isHidden: !!override.hidden,
    }
  })

  const order = config.conciergeOrder || []
  if (!order.length) return merged

  const inOrder = order
    .map((id) => merged.find((item) => item.id === id))
    .filter(Boolean) as ManagedExperience[]
  const remainder = merged.filter((item) => !order.includes(item.id))
  return [...inOrder, ...remainder]
}

export function ExperienceMediaManager() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [targetUpload, setTargetUpload] = useState<{ id: string; isAddition: boolean } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data: SiteConfig) => {
        setConfig(data)
        const managed = buildManagedExperiences(data)
        const map: Record<string, string> = {}
        for (const item of managed) map[item.id] = item.imageUrl || ""
        setImageUrls(map)
      })
      .finally(() => setLoading(false))

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const managed = useMemo(() => (config ? buildManagedExperiences(config) : []), [config])

  const filtered = useMemo(() => {
    return managed.filter((item) => {
      const byType = filterType === "all" || item.type === filterType
      const bySearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase())
      return byType && bySearch
    })
  }, [managed, filterType, search])

  const persistConfig = useCallback(async (updated: SiteConfig, logAction: string) => {
    setSaveStatus("saving")
    await fetch("/api/site-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: updated, logAction }),
    })
    setConfig(updated)
    setSaveStatus("saved")
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 1800)
  }, [])

  const applyImageUrl = useCallback(
    async (item: ManagedExperience, imageUrl: string) => {
      if (!config) return
      const trimmed = imageUrl.trim()
      let updated: SiteConfig

      if (item.isAddition) {
        updated = {
          ...config,
          conciergeAdditions: (config.conciergeAdditions || []).map((entry) =>
            entry.id === item.id ? { ...entry, imageUrl: trimmed || undefined } : entry
          ),
        }
      } else {
        updated = {
          ...config,
          conciergeOverrides: {
            ...config.conciergeOverrides,
            [item.id]: {
              ...config.conciergeOverrides[item.id],
              imageUrl: trimmed || undefined,
            },
          },
        }
      }

      await persistConfig(updated, `Experience image updated for ${item.name}`)
    },
    [config, persistConfig]
  )

  const handleUploadButton = useCallback((id: string, isAddition: boolean) => {
    setTargetUpload({ id, isAddition })
    fileInputRef.current?.click()
  }, [])

  const handleUploadFile = useCallback(
    async (file: File) => {
      if (!targetUpload || !config) return
      setUploadingId(targetUpload.id)
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("subfolder", "experiences")
        const res = await fetch("/api/admin/save-image", { method: "POST", body: formData })
        const data = await res.json()
        if (!data.localPath) return

        const target = managed.find((item) => item.id === targetUpload.id)
        if (!target) return

        setImageUrls((prev) => ({ ...prev, [target.id]: data.localPath }))
        await applyImageUrl(target, data.localPath)
      } finally {
        setUploadingId(null)
        setTargetUpload(null)
      }
    },
    [targetUpload, config, managed, applyImageUrl]
  )

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-14">
        <Loader2 className="h-6 w-6 text-[#9D5F36] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activity..."
          className="w-full sm:w-60 bg-[#2B2B2B] border border-white/10 text-[#ECE9E7] placeholder:text-[#ECE9E7]/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D5F36]/50"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-[#2B2B2B] border border-white/10 text-[#ECE9E7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D5F36]/50"
        >
          <option value="all">All types</option>
          {EXPERIENCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <SaveIndicator status={saveStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const value = imageUrls[item.id] ?? item.imageUrl ?? ""
          const isUploading = uploadingId === item.id
          return (
            <div key={item.id} className="bg-[#1C1C1C] border border-white/5 rounded-2xl p-4">
              <div className="flex gap-4">
                <div className="relative h-20 w-24 rounded-xl overflow-hidden bg-[#2B2B2B] shrink-0">
                  {value ? (
                    <Image src={value} alt={item.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#ECE9E7]/20">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[#ECE9E7] text-sm font-medium truncate">{item.name}</div>
                  <div className="text-[#BCA28A]/70 text-[11px] uppercase tracking-wider mt-1">{item.type}</div>
                  <div className="text-[#ECE9E7]/25 text-[11px] mt-1">
                    {item.isAddition ? "Custom partner" : "Core partner"}
                    {item.isHidden ? " · Hidden" : ""}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="block text-[#ECE9E7]/40 text-[10px] uppercase tracking-wider">
                  Image URL or Uploaded Path
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setImageUrls((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="/uploads/experiences/..."
                    className="flex-1 bg-[#2B2B2B] border border-white/10 text-[#ECE9E7] placeholder:text-[#ECE9E7]/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D5F36]/50"
                  />
                  <button
                    onClick={() => applyImageUrl(item, imageUrls[item.id] || "")}
                    className="px-3 py-2 rounded-xl border border-[#9D5F36]/40 text-[#9D5F36] text-xs font-semibold hover:bg-[#9D5F36]/10 transition-colors"
                  >
                    Save
                  </button>
                </div>
                <button
                  onClick={() => handleUploadButton(item.id, item.isAddition)}
                  disabled={isUploading}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                    isUploading
                      ? "bg-[#9D5F36]/15 text-[#9D5F36]/60 cursor-wait"
                      : "bg-[#9D5F36]/15 text-[#9D5F36] hover:bg-[#9D5F36]/25"
                  )}
                >
                  {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Upload Image
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#1C1C1C] p-8 text-center text-[#ECE9E7]/35 text-sm">
          No experiences match this filter.
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUploadFile(file)
          e.currentTarget.value = ""
        }}
      />

      <div className="text-[11px] text-[#ECE9E7]/30 flex items-center gap-1.5">
        <Link2 className="h-3.5 w-3.5" />
        Uploaded files are stored under `/uploads/experiences/` and persist on VPS via `PERSISTENT_DATA_DIR`.
      </div>
    </div>
  )
}
