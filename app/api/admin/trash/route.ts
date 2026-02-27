import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  const rows = await query<Array<{
    id: number
    property_slug: string
    src: string
    deleted_at: string
  }>>("SELECT id, property_slug, src, deleted_at FROM trash_items ORDER BY deleted_at DESC")

  return NextResponse.json({ trash: rows })
}
