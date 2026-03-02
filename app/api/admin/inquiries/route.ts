import { NextResponse } from "next/server"
import { listInquiries } from "@/lib/inquiry-store"

export async function GET() {
  const inquiries = await listInquiries()
  return NextResponse.json({ inquiries })
}
