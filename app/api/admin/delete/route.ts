import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  const { property, src } = await request.json()

  if (!property || !src) {
    return NextResponse.json({ error: "Missing property or src" }, { status: 400 })
  }

  await query(
    "INSERT INTO trash_items (property_slug, src) VALUES (?, ?)",
    [property, src]
  )

  return NextResponse.json({ ok: true })
}
