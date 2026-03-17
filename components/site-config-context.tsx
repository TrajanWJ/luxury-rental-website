"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import type {
  SiteConfig,
  PropertyOverride,
  SectionToggles,
  ConciergeOverride,
  ConciergeAddition,
  DEFAULT_SECTION_TOGGLES,
} from "@/lib/site-config-store"

/* ── Types ─────────────────────────────────────────── */

interface SiteConfigContextValue {
  config: SiteConfig
  loading: boolean
  /** Get merged overrides for a property (returns defaults if none set) */
  getPropertyConfig: (propertyId: string) => PropertyOverride
  /** Check if a homepage section is enabled */
  isSectionEnabled: (site: "str" | "realEstate", key: string) => boolean
  /** Get the ordered property IDs (falls back to default order) */
  getPropertyOrder: () => string[]
  /** Get merged concierge list (base + overrides + additions, hidden filtered) */
  getConciergeOverride: (partnerId: string) => ConciergeOverride
  /** Get concierge additions */
  getConciergeAdditions: () => ConciergeAddition[]
  /** Get concierge display order */
  getConciergeOrder: () => string[]
  /** Force refresh from server */
  refreshNow: () => Promise<void>
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null)

/* ── Defaults (client-side mirror) ─────────────────── */

const DEFAULT_CONFIG: SiteConfig = {
  propertyOverrides: {},
  propertyOrder: [],
  sectionToggles: {
    str: {
      hero: true,
      fullScreenHomes: true,
      socialStrip: true,
      pledge: true,
      insidersGuide: true,
      conciergeDirectory: true,
      footerCta: true,
      bookPage: true,
      contactPage: true,
      experiencesPage: true,
      houseRulesPage: true,
      mapPage: true,
    },
    realEstate: {
      lakeOverview: true,
      lakeLife: true,
      market: true,
      featuredListing: true,
      listedProperties: {},
    },
  },
  conciergeOverrides: {},
  conciergeOrder: [],
  conciergeAdditions: [],
  activityLog: [],
  emailConfig: { strRecipients: [], realEstateRecipients: [] },
}

/* ── Provider ──────────────────────────────────────── */

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const lastEtag = useRef("")
  const isAdmin = useRef(false)

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/site-config/public", { cache: "no-store" })
      const data = await res.json()
      const etag = JSON.stringify(data)
      if (etag !== lastEtag.current) {
        lastEtag.current = etag
        setConfig({ ...DEFAULT_CONFIG, ...data })
      }
    } catch {
      // Keep defaults on failure
    } finally {
      setLoading(false)
    }
  }, [])

  // Detect admin route for polling
  useEffect(() => {
    isAdmin.current = window.location.pathname.startsWith("/admin")
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  // Poll every 5s on admin, 30s on public
  useEffect(() => {
    const interval = isAdmin.current ? 5000 : 30000
    const id = setInterval(fetchConfig, interval)
    return () => clearInterval(id)
  }, [fetchConfig])

  // Cross-tab sync via localStorage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "site-config-updated") {
        fetchConfig()
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [fetchConfig])

  const getPropertyConfig = useCallback(
    (propertyId: string): PropertyOverride => {
      return config.propertyOverrides[propertyId] || {}
    },
    [config.propertyOverrides]
  )

  const isSectionEnabled = useCallback(
    (site: "str" | "realEstate", key: string): boolean => {
      const toggles = config.sectionToggles[site]
      if (!toggles) return true
      const val = (toggles as Record<string, unknown>)[key]
      // Default to true if key doesn't exist
      return val === undefined ? true : !!val
    },
    [config.sectionToggles]
  )

  const getPropertyOrder = useCallback((): string[] => {
    return config.propertyOrder
  }, [config.propertyOrder])

  const getConciergeOverride = useCallback(
    (partnerId: string): ConciergeOverride => {
      return config.conciergeOverrides[partnerId] || {}
    },
    [config.conciergeOverrides]
  )

  const getConciergeAdditions = useCallback((): ConciergeAddition[] => {
    return config.conciergeAdditions
  }, [config.conciergeAdditions])

  const getConciergeOrder = useCallback((): string[] => {
    return config.conciergeOrder
  }, [config.conciergeOrder])

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        loading,
        getPropertyConfig,
        isSectionEnabled,
        getPropertyOrder,
        getConciergeOverride,
        getConciergeAdditions,
        getConciergeOrder,
        refreshNow: fetchConfig,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext)
  if (!ctx) throw new Error("useSiteConfig must be used within SiteConfigProvider")
  return ctx
}
