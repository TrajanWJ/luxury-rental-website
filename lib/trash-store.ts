/**
 * Trash storage with DB-first, JSONBlob-fallback strategy.
 * Each function tries MariaDB first. If it fails, falls back to
 * JSONBlob (storing trash under the "_trash" key alongside photo orders).
 */
import { query } from "./db"

export interface TrashItem {
  id: number
  property_slug: string
  src: string
  deleted_at: string
}

const BLOB_ID = "019ca122-8c3b-773f-874b-c378c0605166"
const BLOB_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`

// --- JSONBlob helpers ---

async function readBlob(): Promise<Record<string, unknown>> {
  const res = await fetch(BLOB_URL, { headers: { Accept: "application/json" }, cache: "no-store" })
  if (res.ok) return await res.json()
  return {}
}

async function writeBlob(data: Record<string, unknown>): Promise<void> {
  await fetch(BLOB_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  })
}

function getTrashFromBlob(data: Record<string, unknown>): TrashItem[] {
  return (data._trash as TrashItem[]) || []
}

// --- Public API ---

export async function addToTrash(property: string, src: string): Promise<void> {
  try {
    await query("INSERT INTO trash_items (property_slug, src) VALUES (?, ?)", [property, src])
    return
  } catch {
    // DB unavailable — fall through to JSONBlob
  }

  const data = await readBlob()
  const trash = getTrashFromBlob(data)
  trash.push({
    id: Date.now(),
    property_slug: property,
    src,
    deleted_at: new Date().toISOString(),
  })
  data._trash = trash
  await writeBlob(data)
}

export async function listTrash(): Promise<TrashItem[]> {
  try {
    const rows = await query<TrashItem[]>(
      "SELECT id, property_slug, src, deleted_at FROM trash_items ORDER BY deleted_at DESC"
    )
    return rows
  } catch {
    // DB unavailable — fall through to JSONBlob
  }

  const data = await readBlob()
  return getTrashFromBlob(data).sort(
    (a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
  )
}

export async function removeFromTrash(id: number): Promise<void> {
  try {
    await query("DELETE FROM trash_items WHERE id = ?", [id])
    return
  } catch {
    // DB unavailable — fall through to JSONBlob
  }

  const data = await readBlob()
  const trash = getTrashFromBlob(data)
  data._trash = trash.filter((item) => item.id !== id)
  await writeBlob(data)
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
    // DB unavailable — fall through to JSONBlob
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const data = await readBlob()
  const trash = getTrashFromBlob(data)
  const kept = trash.filter((item) => new Date(item.deleted_at).getTime() >= sevenDaysAgo)
  const purged = trash.length - kept.length
  if (purged > 0) {
    data._trash = kept
    await writeBlob(data)
  }
  return purged
}
