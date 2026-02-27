import { NextResponse } from "next/server"
import { listTrash } from "@/lib/trash-store"

export async function GET() {
  const trash = await listTrash()
  return NextResponse.json({ trash })
}
