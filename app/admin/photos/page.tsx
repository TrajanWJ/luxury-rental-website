"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { PhotoManager } from "@/components/admin/photo-manager"
import { PropertySelector, useSelectedProperty } from "@/components/admin/property-selector"
import {
  MediaTabBar,
  VideoTab,
  VirtualTourTab,
  FloorPlansTab,
  type MediaTab,
} from "@/components/admin/media-tabs"
import { SaveIndicator } from "@/components/admin/save-indicator"
import { TrashGrid } from "@/components/admin/trash-grid"
import { UploadedGrid } from "@/components/admin/uploaded-grid"
import type { SiteConfig, PropertyOverride } from "@/lib/site-config-store"
import { Trash2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Helpers ─────────────────────────────────────────── */

function toKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

/* ── Page ────────────────────────────────────────────── */

export default function AdminPhotosPage() {
  const { selectedId, selectedProperty, select } = useSelectedProperty()
  const [activeTab, setActiveTab] = useState<MediaTab>("photos")
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [bottomTab, setBottomTab] = useState<"deleted" | "uploaded" | null>(null)
  const saveTimeout = useRef<NodeJS.Timeout>(undefined)

  // Fetch config on mount
  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {})
  }, [])

  const propertyKey = selectedProperty ? toKey(selectedProperty.name) : ""

  /* ── Save handler ──────────────────────────────────── */

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

  /* ── Override updater ──────────────────────────────── */

  function updateOverride(fields: Partial<PropertyOverride>, logMsg?: string) {
    if (!config || !propertyKey) return
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

  /* ── Render ────────────────────────────────────────── */

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[#ECE9E7] font-serif text-2xl lg:text-3xl mb-1">Photos & Media</h1>
            <p className="text-[#ECE9E7]/40 text-sm">Manage photos, videos, 3D tours, and floor plans</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBottomTab(bottomTab === "deleted" ? null : "deleted")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                bottomTab === "deleted"
                  ? "bg-[#9D5F36]/15 text-[#9D5F36] border border-[#9D5F36]/30"
                  : "text-[#ECE9E7]/40 hover:text-[#ECE9E7]/60 border border-white/5 hover:border-white/10"
              )}
            >
              <Trash2 className="h-3 w-3" />
              Recently Deleted
            </button>
            <button
              onClick={() => setBottomTab(bottomTab === "uploaded" ? null : "uploaded")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                bottomTab === "uploaded"
                  ? "bg-[#9D5F36]/15 text-[#9D5F36] border border-[#9D5F36]/30"
                  : "text-[#ECE9E7]/40 hover:text-[#ECE9E7]/60 border border-white/5 hover:border-white/10"
              )}
            >
              <Upload className="h-3 w-3" />
              Uploaded Images
            </button>
            <SaveIndicator status={saveStatus} />
          </div>
        </div>
      </div>

      {/* Recently Deleted / Uploaded Images (expanded inline) */}
      {bottomTab && (
        <div className="mb-8 bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
          {bottomTab === "deleted" && <TrashGrid />}
          {bottomTab === "uploaded" && <UploadedGrid />}
        </div>
      )}

      {/* Property selector (controls media tabs) */}
      <div className="mb-6 w-full sm:max-w-xs">
        <PropertySelector value={selectedId} onChange={select} />
      </div>

      {/* Tab bar */}
      <div className="mb-6">
        <MediaTabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab content */}
      {activeTab === "photos" && (
        <div>
          <PhotoManager />
        </div>
      )}

      {activeTab === "video" && config && selectedProperty && (
        <VideoTab
          config={config}
          propertyKey={propertyKey}
          selectedProperty={selectedProperty}
          updateOverride={updateOverride}
          saveConfig={saveConfig}
        />
      )}

      {activeTab === "3d-tour" && config && selectedProperty && (
        <VirtualTourTab
          config={config}
          propertyKey={propertyKey}
          selectedProperty={selectedProperty}
          updateOverride={updateOverride}
          saveConfig={saveConfig}
        />
      )}

      {activeTab === "floor-plans" && config && selectedProperty && (
        <FloorPlansTab
          config={config}
          propertyKey={propertyKey}
          selectedProperty={selectedProperty}
          updateOverride={updateOverride}
          saveConfig={saveConfig}
        />
      )}

    </div>
  )
}
