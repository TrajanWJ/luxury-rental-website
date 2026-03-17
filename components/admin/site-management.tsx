"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import type { SiteConfig } from "@/lib/site-config-store"
import { Loader2 } from "lucide-react"
import { SaveIndicator } from "@/components/admin/save-indicator"

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

/* ── Component ────────────────────────────────────── */

export function SiteManagement() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [strEmails, setStrEmails] = useState("")
  const [reEmails, setReEmails] = useState("")
  const saveTimeout = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data)
        setStrEmails((data.emailConfig?.strRecipients || []).join(", "))
        setReEmails((data.emailConfig?.realEstateRecipients || []).join(", "))
      })
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

  function toggleSection(key: string) {
    if (!config) return
    const current = (config.sectionToggles.str as Record<string, unknown>)[key]
    const newVal = current === undefined ? false : !current

    const updated: SiteConfig = {
      ...config,
      sectionToggles: {
        ...config.sectionToggles,
        str: {
          ...config.sectionToggles.str,
          [key]: newVal,
        },
      },
    }
    setConfig(updated)
    saveConfig(updated, `${key} ${newVal ? "enabled" : "disabled"} on STR site`)
  }

  function saveEmailConfig() {
    if (!config) return
    const strList = strEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean)
    const reList = reEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean)

    const updated: SiteConfig = {
      ...config,
      emailConfig: {
        strRecipients: strList,
        realEstateRecipients: reList,
      },
    }
    setConfig(updated)
    saveConfig(updated, "Email forwarding recipients updated")
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
      {/* Save status */}
      <SaveIndicator status={saveStatus} />

      {/* Homepage Section Toggles */}
      <ToggleGroup
        title="Homepage Sections"
        items={strHomepageSections}
        toggles={config.sectionToggles.str}
        onToggle={toggleSection}
      />

      {/* Email Settings */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6">
        <h3 className="text-[#ECE9E7]/60 text-xs uppercase tracking-wider mb-4">
          Email Forwarding
        </h3>
        <p className="text-[11px] text-[#ECE9E7]/20 mb-5">
          Contact form submissions are emailed to these addresses. Separate multiple with commas.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#ECE9E7]/50 mb-1.5 block">
              STR Inquiries
            </label>
            <input
              type="text"
              value={strEmails}
              onChange={(e) => setStrEmails(e.target.value)}
              placeholder="leslie@wilson-premier.com"
              className="w-full bg-[#2B2B2B]/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-[#ECE9E7] placeholder:text-[#ECE9E7]/15 focus:outline-none focus:border-[#9D5F36]/50"
            />
            <p className="text-[10px] text-[#ECE9E7]/15 mt-1">
              From: contact page, concierge modal
            </p>
          </div>

          <div>
            <label className="text-xs text-[#ECE9E7]/50 mb-1.5 block">
              Real Estate Inquiries
            </label>
            <input
              type="text"
              value={reEmails}
              onChange={(e) => setReEmails(e.target.value)}
              placeholder="craig.r.wilson.jr@gmail.com"
              className="w-full bg-[#2B2B2B]/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-[#ECE9E7] placeholder:text-[#ECE9E7]/15 focus:outline-none focus:border-[#9D5F36]/50"
            />
            <p className="text-[10px] text-[#ECE9E7]/15 mt-1">
              From: real estate contact page, RE inquiry modal
            </p>
          </div>

          <button
            onClick={saveEmailConfig}
            className="px-4 py-2 bg-[#9D5F36] text-white text-sm font-medium rounded-lg hover:bg-[#9D5F36]/90 transition-colors"
          >
            Save Email Settings
          </button>
        </div>
      </div>
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
