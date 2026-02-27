import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  const { id } = await request.json()
  await query("DELETE FROM trash_items WHERE id = ?", [id])
  return NextResponse.json({ ok: true })
}
