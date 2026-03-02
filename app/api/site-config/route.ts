import { NextRequest, NextResponse } from "next/server"
import {
  getSiteConfig,
  saveSiteConfig,
  appendActivityLog,
  type SiteConfig,
} from "@/lib/site-config-store"

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section")

  const config = await getSiteConfig()

  if (section) {
    const value = config[section as keyof SiteConfig]
    if (value === undefined) {
      return NextResponse.json({ error: "Unknown section" }, { status: 400 })
    }
    return NextResponse.json({ [section]: value })
  }

  return NextResponse.json(config)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { config, logAction } = body as {
      config: Partial<SiteConfig>
      logAction?: string
    }

    if (!config) {
      return NextResponse.json({ error: "Missing config" }, { status: 400 })
    }

    const current = await getSiteConfig()
    const merged: SiteConfig = {
      ...current,
      ...config,
      // Deep-merge section toggles
      sectionToggles: config.sectionToggles
        ? {
            str: { ...current.sectionToggles.str, ...config.sectionToggles.str },
            realEstate: {
              ...current.sectionToggles.realEstate,
              ...config.sectionToggles.realEstate,
              listedProperties: {
                ...current.sectionToggles.realEstate.listedProperties,
                ...(config.sectionToggles.realEstate?.listedProperties || {}),
              },
            },
          }
        : current.sectionToggles,
      // Deep-merge property overrides
      propertyOverrides: config.propertyOverrides
        ? (() => {
            const result = { ...current.propertyOverrides }
            for (const [key, val] of Object.entries(config.propertyOverrides)) {
              result[key] = { ...result[key], ...val }
            }
            return result
          })()
        : current.propertyOverrides,
      // Deep-merge concierge overrides
      conciergeOverrides: config.conciergeOverrides
        ? (() => {
            const result = { ...current.conciergeOverrides }
            for (const [key, val] of Object.entries(config.conciergeOverrides)) {
              result[key] = { ...result[key], ...val }
            }
            return result
          })()
        : current.conciergeOverrides,
      // Keep existing activity log (don't overwrite from client)
      activityLog: current.activityLog,
    }

    const ok = await saveSiteConfig(merged)
    if (!ok) {
      return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }

    if (logAction) {
      await appendActivityLog(logAction)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
