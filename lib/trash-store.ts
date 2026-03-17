/**
 * Trash storage with Turso-first, filesystem-fallback strategy.
 * Each function tries Turso first. If it fails, falls back to
 * the local file store (storing trash under the "_trash" key).
 */
import { query, execute, DB_CONFIGURED } from "./db"
import { readStore, writeStore } from "./file-store"

export interface TrashItem {
  id: number
  property_slug: string
  src: string
  deleted_at: string
}

function getTrash(data: Record<string, unknown>): TrashItem[] {
  return (data._trash as TrashItem[]) || []
}

// --- Public API ---

export async function addToTrash(property: string, src: string): Promise<void> {
  if (DB_CONFIGURED) {
    try {
      await execute("INSERT INTO trash_items (property_slug, src) VALUES (?, ?)", [property, src])
      // Write-through cache
      try {
        const data = readStore()
        const trash = getTrash(data)
        trash.push({ id: Date.now(), property_slug: property, src, deleted_at: new Date().toISOString() })
        data._trash = trash
        writeStore(data)
      } catch { /* silently fail on read-only FS */ }
      return
    } catch {
      // DB unavailable — fall through to filesystem
    }
  }

  const data = readStore()
  const trash = getTrash(data)
  trash.push({
    id: Date.now(),
    property_slug: property,
    src,
    deleted_at: new Date().toISOString(),
  })
  data._trash = trash
  writeStore(data)
}

export async function listTrash(): Promise<TrashItem[]> {
  let dbRows: TrashItem[] | null = null

  if (DB_CONFIGURED) {
    try {
      dbRows = await query<TrashItem>(
        "SELECT id, property_slug, src, deleted_at FROM trash_items ORDER BY deleted_at DESC"
      )
    } catch {
      // DB unavailable — fall through to filesystem only
    }
  }

  // Always check file-store for items that may have been written via fallback
  const data = readStore()
  const fileTrash = getTrash(data)

  if (dbRows === null) {
    // DB not configured or unavailable — use file-store only
    return fileTrash.sort(
      (a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
    )
  }

  // Merge: DB is primary, but include any file-store items not in DB (fallback writes)
  const dbSrcs = new Set(dbRows.map((r) => r.src))
  const extraFromFile = fileTrash.filter((item) => !dbSrcs.has(item.src))

  if (extraFromFile.length > 0) {
    // Sync orphaned file-store items back to DB
    for (const item of extraFromFile) {
      try {
        await execute("INSERT OR IGNORE INTO trash_items (property_slug, src) VALUES (?, ?)", [
          item.property_slug,
          item.src,
        ])
      } catch {
        // Best-effort sync
      }
    }
  }

  return [...dbRows, ...extraFromFile].sort(
    (a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
  )
}

export async function removeFromTrash(id: number): Promise<void> {
  if (DB_CONFIGURED) {
    try {
      await execute("DELETE FROM trash_items WHERE id = ?", [id])
      // Write-through cache
      try {
        const data = readStore()
        const trash = getTrash(data)
        data._trash = trash.filter((item) => item.id !== id)
        writeStore(data)
      } catch { /* silently fail on read-only FS */ }
      return
    } catch {
      // DB unavailable — fall through to filesystem
    }
  }

  const data = readStore()
  const trash = getTrash(data)
  data._trash = trash.filter((item) => item.id !== id)
  writeStore(data)
}

export async function purgeExpired(): Promise<number> {
  if (DB_CONFIGURED) {
    try {
      const expired = await query<TrashItem>(
        "SELECT id FROM trash_items WHERE deleted_at < datetime('now', '-7 days')"
      )
      if (expired.length > 0) {
        await execute("DELETE FROM trash_items WHERE deleted_at < datetime('now', '-7 days')")
      }
      return expired.length
    } catch {
      // DB unavailable — fall through to filesystem
    }
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const data = readStore()
  const trash = getTrash(data)
  const kept = trash.filter((item) => new Date(item.deleted_at).getTime() >= sevenDaysAgo)
  const purged = trash.length - kept.length
  if (purged > 0) {
    data._trash = kept
    writeStore(data)
  }
  return purged
}
