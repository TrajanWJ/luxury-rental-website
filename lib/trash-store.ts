/**
 * Trash storage with DB-first, filesystem-fallback strategy.
 * Each function tries MariaDB first. If it fails, falls back to
 * the local file store (storing trash under the "_trash" key).
 */
import { query } from "./db"
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
  try {
    await query("INSERT INTO trash_items (property_slug, src) VALUES (?, ?)", [property, src])
    return
  } catch {
    // DB unavailable — fall through to filesystem
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
  try {
    const rows = await query<TrashItem[]>(
      "SELECT id, property_slug, src, deleted_at FROM trash_items ORDER BY deleted_at DESC"
    )
    return rows
  } catch {
    // DB unavailable — fall through to filesystem
  }

  const data = readStore()
  return getTrash(data).sort(
    (a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
  )
}

export async function removeFromTrash(id: number): Promise<void> {
  try {
    await query("DELETE FROM trash_items WHERE id = ?", [id])
    return
  } catch {
    // DB unavailable — fall through to filesystem
  }

  const data = readStore()
  const trash = getTrash(data)
  data._trash = trash.filter((item) => item.id !== id)
  writeStore(data)
}

export async function purgeExpired(): Promise<number> {
  try {
    const expired = await query<TrashItem[]>(
      "SELECT id FROM trash_items WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
    )
    if (expired.length > 0) {
      await query("DELETE FROM trash_items WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 7 DAY)")
    }
    return expired.length
  } catch {
    // DB unavailable — fall through to filesystem
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
