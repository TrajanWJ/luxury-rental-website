import { NextRequest, NextResponse } from "next/server"
import { addInquiry } from "@/lib/inquiry-store"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, message, experience, source } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "name, email, and message are required" },
        { status: 400 }
      )
    }

    const validSources = ["modal", "contact-page", "real-estate-modal", "real-estate-contact"] as const
    const resolvedSource = validSources.includes(source) ? source : "modal"

    await addInquiry({
      name,
      email,
      phone: phone || null,
      message,
      experience: experience || null,
      source: resolvedSource,
      email_status: "skipped",
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 })
  }
}
