"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
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
import type { SiteConfig, PropertyOverride } from "@/lib/site-config-store"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

function toKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

export function PropertyMediaManager() {
  const { selectedId, selectedProperty, select } = useSelectedProperty()
  const [activeTab, setActiveTab] = useState<MediaTab>("photos")
  const [listingAssetsOpen, setListingAssetsOpen] = useState(true)
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const saveTimeout = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {})
  }, [])

  const propertyKey = selectedProperty ? toKey(selectedProperty.name) : ""

  const saveConfig = useCallback(
    async (updatedConfig: SiteConfig, logAction?: string) => {
      setSaveStatus("saving")
      try {
        await fetch("/api/site-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: updatedConfig, logAction }),
        })
        setConfig(updatedConfig)
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[#ECE9E7] font-serif text-2xl lg:text-3xl mb-1">Property Photos</h1>
          <p className="text-[#ECE9E7]/40 text-sm">
            Manage each property&apos;s gallery, video, 3D tour, and floor plans in one focused workspace.
          </p>
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      <div className="rounded-2xl border border-[#9D5F36]/20 bg-[#9D5F36]/[0.06] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[#ECE9E7] text-base font-medium">Need uploads, experiences, or deleted items?</h2>
            <p className="text-[#ECE9E7]/40 text-sm mt-1">
              Those tools now live in Media Library so this page stays property-focused.
            </p>
          </div>
          <Link
            href="/admin/media-library"
            className="inline-flex items-center justify-center rounded-xl border border-[#9D5F36]/35 px-4 py-2 text-sm font-medium text-[#D9B89F] hover:bg-[#9D5F36]/10"
          >
            Open Media Library
          </Link>
        </div>
      </div>

      <Collapsible open={listingAssetsOpen} onOpenChange={setListingAssetsOpen}>
        <section className="bg-[#141414] rounded-2xl border border-white/5 p-5 sm:p-6 space-y-6">
          <CollapsibleTrigger className="w-full text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[#ECE9E7] font-serif text-xl">Property Listing Assets</h2>
                <p className="text-[#ECE9E7]/35 text-sm mt-1">
                  Pick a property, then manage the exact assets shown on its listing experience.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-[#ECE9E7]/60 hover:text-[#ECE9E7]/85">
                {listingAssetsOpen ? "Hide" : "Show"}
                <ChevronDown className={`h-4 w-4 transition-transform ${listingAssetsOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
            <div className="space-y-6 pt-2">
              <div className="w-full sm:max-w-xs">
                <PropertySelector value={selectedId} onChange={select} />
              </div>

              <MediaTabBar active={activeTab} onChange={setActiveTab} />

              {activeTab === "photos" && <PhotoManager />}

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
          </CollapsibleContent>
        </section>
      </Collapsible>
    </div>
  )
}
