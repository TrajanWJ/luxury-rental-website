import { NextRequest, NextResponse } from "next/server"
import { removeFromTrash } from "@/lib/trash-store"

export async function POST(request: NextRequest) {
  const { id } = await request.json()
  await removeFromTrash(id)
  return NextResponse.json({ ok: true })
}
