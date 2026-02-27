import { NextRequest, NextResponse } from "next/server"
import { removeFromTrash, purgeExpired } from "@/lib/trash-store"

export async function POST(request: NextRequest) {
  const { id, purgeExpired: doPurgeExpired } = await request.json()

  if (doPurgeExpired) {
    const purged = await purgeExpired()
    return NextResponse.json({ ok: true, purged })
  }

  if (id) {
    await removeFromTrash(id)
    return NextResponse.json({ ok: true, purged: 1 })
  }

  return NextResponse.json({ error: "Nothing to purge" }, { status: 400 })
}
