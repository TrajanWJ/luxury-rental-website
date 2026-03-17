import { NextResponse } from "next/server"
import { getSiteConfig } from "@/lib/site-config-store"

export async function GET() {
  const config = await getSiteConfig()

  // Strip admin-only data
  const { activityLog: _, emailConfig: _e, ...publicConfig } = config

  return NextResponse.json(publicConfig)
}
