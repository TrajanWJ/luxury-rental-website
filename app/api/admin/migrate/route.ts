import { NextResponse } from "next/server"
import { runMigrations } from "@/lib/db-migrate"

export async function POST() {
  try {
    await runMigrations()
    return NextResponse.json({ ok: true, message: "Migrations complete" })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
