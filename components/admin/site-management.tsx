"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { properties } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { SiteConfig } from "@/lib/site-config-store"
import { Check, Loader2, ChevronDown } from "lucide-react"

/* ── Section definitions ──────────────────────────── */

interface ToggleItem {
  key: string
  label: string
  description: string
}

const strHomepageSections: ToggleItem[] = [
  { key: "hero", label: "Hero Banner", description: "Main hero section with property slideshow" },
  { key: "fullScreenHomes", label: "Properties (Full-Screen Homes)", description: "Sticky-scroll property panels" },
  { key: "socialStrip", label: "Social Strip", description: "Social media links bar" },
  { key: "pledge", label: "Pledge Section", description: "Mission, values, and pledge cards" },
  { key: "insidersGuide", label: "Insider's Guide", description: "SML category cards (Events, Boating, Dining, etc.)" },
  { key: "conciergeDirectory", label: "Concierge Partners Directory", description: "Curated partner services listing" },
  { key: "footerCta", label: "Footer CTA", description: "Bottom call-to-action with contact" },
]

const strPageSections: ToggleItem[] = [
  { key: "bookPage", label: "Book Page", description: "/book — Booking calendar page" },
  { key: "contactPage", label: "Contact Page", description: "/contact — Contact form page" },
  { key: "experiencesPage", label: "Experiences Page", description: "/experiences — Full experiences page" },
  { key: "houseRulesPage", label: "House Rules", description: "/house-rules — Property rules page" },
  { key: "mapPage", label: "Map Page", description: "/map — Property map view" },
]

const realEstateSections: ToggleItem[] = [
  { key: "lakeOverview", label: "Lake Overview", description: "Smith Mountain Lake overview section" },
  { key: "lakeLife", label: "Lake Life", description: "Lifestyle and community section" },
  { key: "market", label: "Market Section", description: "Real estate market data" },
  { key: "featuredListing", label: "Featured Listing", description: "Highlighted property listing" },
]

// Milan Manor (id "6") is the only property on the real estate frontend
const REAL_ESTATE_DEFAULT_LISTED: Record<string, boolean> = {
  "1": false,   // Suite Retreat
  "2": false,   // Suite View
  "6": true,    // Milan Manor
  "7": false,   // Penthouse View
  "5": false,   // Lake View
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

/* ── Component ────────────────────────────────────── */

export function SiteManagement() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [activeTab, setActiveTab] = useState<"str" | "realEstate">("str")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [propertyPagesOpen, setPropertyPagesOpen] = useState(false)
  const saveTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {})
  }, [])

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

  function toggleSection(site: "str" | "realEstate", key: string) {
    if (!config) return
    const current = (config.sectionToggles[site] as Record<string, unknown>)[key]
    const newVal = current === undefined ? false : !current

    const updated: SiteConfig = {
      ...config,
      sectionToggles: {
        ...config.sectionToggles,
        [site]: {
          ...config.sectionToggles[site],
          [key]: newVal,
        },
      },
    }
    setConfig(updated)
    saveConfig(updated, `${key} ${newVal ? "enabled" : "disabled"} on ${site === "str" ? "STR" : "Real Estate"} site`)
  }

  function togglePropertyPage(propertyId: string) {
    if (!config) return
    // propertyPages stored as Record<string, boolean> under str section toggles
    const currentPages = (config.sectionToggles.str as Record<string, unknown>).propertyPages as Record<string, boolean> | undefined
    const current = currentPages?.[propertyId]
    const newVal = current === undefined ? false : !current

    const prop = properties.find((p) => p.id === propertyId)
    const updated: SiteConfig = {
      ...config,
      sectionToggles: {
        ...config.sectionToggles,
        str: {
          ...config.sectionToggles.str,
          propertyPages: {
            ...(currentPages || {}),
            [propertyId]: newVal,
          },
        },
      },
    }
    setConfig(updated)
    saveConfig(
      updated,
      `/properties/${toSlug(prop?.name || propertyId)} page ${newVal ? "enabled" : "disabled"}`
    )
  }

  function toggleListedProperty(propertyId: string) {
    if (!config) return
    const defaultVal = REAL_ESTATE_DEFAULT_LISTED[propertyId] ?? false
    const explicit = config.sectionToggles.realEstate.listedProperties[propertyId]
    const current = explicit !== undefined ? explicit : defaultVal
    const newVal = !current

    const prop = properties.find((p) => p.id === propertyId)
    const updated: SiteConfig = {
      ...config,
      sectionToggles: {
        ...config.sectionToggles,
        realEstate: {
          ...config.sectionToggles.realEstate,
          listedProperties: {
            ...config.sectionToggles.realEstate.listedProperties,
            [propertyId]: newVal,
          },
        },
      },
    }
    setConfig(updated)
    saveConfig(
      updated,
      `${prop?.name || propertyId} ${newVal ? "shown" : "hidden"} on real estate listings`
    )
  }

  function isListedProperty(propertyId: string): boolean {
    if (!config) return false
    const explicit = config.sectionToggles.realEstate.listedProperties[propertyId]
    if (explicit !== undefined) return explicit
    return REAL_ESTATE_DEFAULT_LISTED[propertyId] ?? false
  }

  function isPropertyPageEnabled(propertyId: string): boolean {
    if (!config) return true
    const currentPages = (config.sectionToggles.str as Record<string, unknown>).propertyPages as Record<string, boolean> | undefined
    if (!currentPages || currentPages[propertyId] === undefined) return true
    return currentPages[propertyId]
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#9D5F36]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-[#1C1C1C] rounded-xl p-1 border border-white/5 w-fit">
        <button
          onClick={() => setActiveTab("str")}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
            activeTab === "str"
              ? "bg-[#9D5F36] text-white"
              : "text-[#ECE9E7]/40 hover:text-[#ECE9E7]/70"
          )}
        >
          STR Site
        </button>
        <button
          onClick={() => setActiveTab("realEstate")}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
            activeTab === "realEstate"
              ? "bg-[#9D5F36] text-white"
              : "text-[#ECE9E7]/40 hover:text-[#ECE9E7]/70"
          )}
        >
          Real Estate
        </button>
      </div>

      {/* Save status */}
      {saveStatus !== "idle" && (
        <div className="flex items-center gap-2 text-xs">
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

      {/* STR Tab */}
      {activeTab === "str" && (
        <>
          <ToggleGroup
            title="Homepage Sections"
            items={strHomepageSections}
            toggles={config.sectionToggles.str}
            onToggle={(key) => toggleSection("str", key)}
          />
          <ToggleGroup
            title="Site Pages"
            items={strPageSections}
            toggles={config.sectionToggles.str}
            onToggle={(key) => toggleSection("str", key)}
          />

          {/* Property Detail Pages — collapsible dropdown */}
          <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
            <button
              onClick={() => setPropertyPagesOpen(!propertyPagesOpen)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-[#ECE9E7]/60 text-xs uppercase tracking-wider">
                Property Detail Pages
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#ECE9E7]/25">
                  {properties.filter((p) => isPropertyPageEnabled(p.id)).length} of {properties.length} enabled
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-[#ECE9E7]/30 transition-transform",
                    propertyPagesOpen && "rotate-180"
                  )}
                />
              </div>
            </button>

            {propertyPagesOpen && (
              <div className="space-y-2 mt-4">
                <p className="text-[11px] text-[#ECE9E7]/20 mb-3">
                  Enable or disable individual property detail pages (/properties/[name])
                </p>
                {properties.map((property) => {
                  const enabled = isPropertyPageEnabled(property.id)
                  return (
                    <div
                      key={property.id}
                      className="flex items-center justify-between px-4 py-3 bg-[#2B2B2B]/50 rounded-xl"
                    >
                      <div>
                        <div
                          className={cn(
                            "text-sm font-medium",
                            enabled ? "text-[#ECE9E7]" : "text-[#ECE9E7]/30"
                          )}
                        >
                          {property.name}
                        </div>
                        <div className="text-[11px] text-[#ECE9E7]/20 mt-0.5">
                          /properties/{toSlug(property.name)}
                        </div>
                      </div>
                      <Toggle
                        enabled={enabled}
                        onToggle={() => togglePropertyPage(property.id)}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Real Estate Tab */}
      {activeTab === "realEstate" && (
        <>
          <ToggleGroup
            title="Sections"
            items={realEstateSections}
            toggles={config.sectionToggles.realEstate}
            onToggle={(key) => toggleSection("realEstate", key)}
          />

          {/* Listed Properties */}
          <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
            <h3 className="text-[#ECE9E7]/60 text-xs uppercase tracking-wider mb-2">
              Listed Properties
            </h3>
            <p className="text-[11px] text-[#ECE9E7]/20 mb-4">
              Properties shown on the real estate page. Currently only Milan Manor has a listing on the frontend.
            </p>
            <div className="space-y-2">
              {properties.map((property) => {
                const isListed = isListedProperty(property.id)
                const isMilan = property.id === "6"
                return (
                  <div
                    key={property.id}
                    className="flex items-center justify-between px-4 py-3 bg-[#2B2B2B]/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-sm",
                          isListed ? "text-[#ECE9E7]" : "text-[#ECE9E7]/30"
                        )}
                      >
                        {property.name}
                      </span>
                      {isMilan && (
                        <span className="text-[9px] uppercase tracking-wider text-[#9D5F36]/60 px-1.5 py-0.5 rounded bg-[#9D5F36]/10 font-semibold">
                          Active listing
                        </span>
                      )}
                    </div>
                    <Toggle
                      enabled={isListed}
                      onToggle={() => toggleListedProperty(property.id)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Toggle switch ────────────────────────────────── */

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-9 h-5 rounded-full transition-colors relative flex-shrink-0",
        enabled ? "bg-[#9D5F36]" : "bg-white/10"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
          enabled ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

/* ── Toggle group ─────────────────────────────────── */

function ToggleGroup({
  title,
  items,
  toggles,
  onToggle,
}: {
  title: string
  items: ToggleItem[]
  toggles: Record<string, unknown>
  onToggle: (key: string) => void
}) {
  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
      <h3 className="text-[#ECE9E7]/60 text-xs uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item) => {
          const enabled = toggles[item.key] !== false
          return (
            <div
              key={item.key}
              className="flex items-center justify-between px-4 py-3 bg-[#2B2B2B]/50 rounded-xl"
            >
              <div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    enabled ? "text-[#ECE9E7]" : "text-[#ECE9E7]/30"
                  )}
                >
                  {item.label}
                </div>
                <div className="text-[11px] text-[#ECE9E7]/20 mt-0.5">
                  {item.description}
                </div>
              </div>
              <Toggle enabled={enabled} onToggle={() => onToggle(item.key)} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
