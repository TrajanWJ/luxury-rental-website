import { NextRequest, NextResponse } from "next/server"
import { addToTrash } from "@/lib/trash-store"

export async function POST(request: NextRequest) {
  const { property, src } = await request.json()

  if (!property || !src) {
    return NextResponse.json({ error: "Missing property or src" }, { status: 400 })
  }

  await addToTrash(property, src)
  return NextResponse.json({ ok: true })
}
