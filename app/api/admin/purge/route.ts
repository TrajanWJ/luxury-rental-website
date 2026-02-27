import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

interface TrashRow { id: number; src: string; property_slug: string }

export async function POST(request: NextRequest) {
  const { id, purgeExpired } = await request.json()

  if (purgeExpired) {
    const expired = await query<TrashRow[]>(
      "SELECT id, src, property_slug FROM trash_items WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
    )
    if (expired.length > 0) {
      await query(
        "DELETE FROM trash_items WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
      )
    }
    return NextResponse.json({ ok: true, purged: expired.length })
  }

  if (id) {
    await query("DELETE FROM trash_items WHERE id = ?", [id])
    return NextResponse.json({ ok: true, purged: 1 })
  }

  return NextResponse.json({ error: "Nothing to purge" }, { status: 400 })
}
