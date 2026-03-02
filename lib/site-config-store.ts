/**
 * Persistent JSON store for site configuration (property overrides,
 * section toggles, concierge overrides, activity log).
 *
 * Turso-first with filesystem fallback + write-through cache.
 *
 * Storage locations:
 *   Development:  ./data/site-config.json  (project root, checked into git)
 *   Production:   $PERSISTENT_DATA_DIR/site-config.json
 */
import fs from "fs"
import path from "path"
import { query, execute, DB_CONFIGURED } from "./db"

/* ── Types ─────────────────────────────────────────── */

export interface PropertyOverride {
  matterportUrl?: string
  matterportEnabled?: boolean
  videoUrl?: string
  videoEnabled?: boolean
  showOnHomepage?: boolean
  showOnSite?: boolean
  floorPlanImages?: string[]
  seo?: {
    title?: string
    description?: string
    ogImage?: string
  }
}

export interface SectionToggles {
  str: {
    hero: boolean
    fullScreenHomes: boolean
    socialStrip: boolean
    pledge: boolean
    insidersGuide: boolean
    conciergeDirectory: boolean
    footerCta: boolean
    bookPage: boolean
    contactPage: boolean
    experiencesPage: boolean
    houseRulesPage: boolean
    mapPage: boolean
  }
  realEstate: {
    lakeOverview: boolean
    lakeLife: boolean
    market: boolean
    featuredListing: boolean
    listedProperties: Record<string, boolean>
  }
}

export interface ConciergeOverride {
  hidden?: boolean
  name?: string | null
  type?: string | null
  description?: string | null
  details?: string | null
  contactName?: string | null
  contactTitle?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  serviceOffered?: string | null
  imageUrl?: string | null
}

export interface ConciergeAddition {
  id: string
  name: string
  type: string
  description: string
  details: string
  contactName?: string
  contactTitle?: string
  phone?: string
  email?: string
  website?: string
  serviceOffered?: string
  imageUrl?: string
}

export interface ActivityLogEntry {
  action: string
  timestamp: string
  user: string
}

export interface SiteConfig {
  propertyOverrides: Record<string, PropertyOverride>
  propertyOrder: string[]
  sectionToggles: SectionToggles
  conciergeOverrides: Record<string, ConciergeOverride>
  conciergeOrder: string[]
  conciergeAdditions: ConciergeAddition[]
  activityLog: ActivityLogEntry[]
}

/* ── Defaults ──────────────────────────────────────── */

export const DEFAULT_SECTION_TOGGLES: SectionToggles = {
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
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  propertyOverrides: {},
  propertyOrder: [],
  sectionToggles: DEFAULT_SECTION_TOGGLES,
  conciergeOverrides: {},
  conciergeOrder: [],
  conciergeAdditions: [],
  activityLog: [],
}

/* ── File-based storage ────────────────────────────── */

const DATA_DIR =
  process.env.PERSISTENT_DATA_DIR || path.join(process.cwd(), "data")
const CONFIG_FILE = path.join(DATA_DIR, "site-config.json")

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function readConfigFile(): SiteConfig {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      ensureDir()
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_SITE_CONFIG, null, 2))
      return { ...DEFAULT_SITE_CONFIG }
    }
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))
    return { ...DEFAULT_SITE_CONFIG, ...raw }
  } catch {
    return { ...DEFAULT_SITE_CONFIG }
  }
}

export function writeConfigFile(data: SiteConfig): void {
  ensureDir()
  const tmp = CONFIG_FILE + ".tmp"
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, CONFIG_FILE)
}

/* ── DB helpers ────────────────────────────────────── */

interface ConfigRow {
  config_key: string
  config_data: string
  version: number
}

async function dbRead(): Promise<{ config: SiteConfig; version: number } | null> {
  if (!DB_CONFIGURED) return null
  try {
    const rows = await query<ConfigRow>(
      "SELECT config_data, version FROM site_config WHERE config_key = ?",
      ["main"]
    )
    if (rows.length === 0) return null
    const parsed = JSON.parse(rows[0].config_data)
    return { config: { ...DEFAULT_SITE_CONFIG, ...parsed }, version: rows[0].version }
  } catch {
    return null
  }
}

async function dbWrite(data: SiteConfig, expectedVersion?: number): Promise<boolean> {
  if (!DB_CONFIGURED) return false
  try {
    const json = JSON.stringify(data)
    if (expectedVersion !== undefined) {
      const result = await execute(
        `UPDATE site_config SET config_data = ?, version = version + 1, updated_at = datetime('now')
         WHERE config_key = ? AND version = ?`,
        [json, "main", expectedVersion]
      )
      return result.rowsAffected > 0
    }
    await execute(
      `INSERT INTO site_config (config_key, config_data, version)
       VALUES (?, ?, 1)
       ON CONFLICT(config_key) DO UPDATE SET config_data = excluded.config_data, version = version + 1, updated_at = datetime('now')`,
      ["main", json]
    )
    return true
  } catch {
    return false
  }
}

/* ── Public API ────────────────────────────────────── */

export async function getSiteConfig(): Promise<SiteConfig> {
  // DB first
  const dbResult = await dbRead()
  if (dbResult) return dbResult.config

  // Filesystem fallback
  return readConfigFile()
}

export async function saveSiteConfig(data: SiteConfig): Promise<boolean> {
  // Try DB first
  const written = await dbWrite(data)
  if (written) {
    // Write-through cache to filesystem
    try { writeConfigFile(data) } catch { /* silently fail on read-only FS */ }
    return true
  }

  // Filesystem fallback
  try {
    writeConfigFile(data)
    return true
  } catch {
    return false
  }
}

export async function appendActivityLog(
  action: string,
  user: string = "Wilson"
): Promise<void> {
  const config = await getSiteConfig()
  config.activityLog.unshift({
    action,
    timestamp: new Date().toISOString(),
    user,
  })
  // Keep last 500 entries
  if (config.activityLog.length > 500) {
    config.activityLog = config.activityLog.slice(0, 500)
  }
  await saveSiteConfig(config)
}

export { CONFIG_FILE, DATA_DIR }
