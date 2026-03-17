import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { addInquiry } from "@/lib/inquiry-store"
import { sendInquiryEmail } from "@/lib/send-inquiry-email"

const InquirySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(30).nullable().optional(),
  message: z.string().min(1).max(5000),
  experience: z.string().max(200).nullable().optional(),
  source: z.enum(["modal", "contact-page", "real-estate-modal", "real-estate-contact"]).optional(),
})

// Simple in-memory rate limiter: max 5 submissions per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    // Validate input
    const parsed = InquirySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, phone, message, experience, source } = parsed.data
    const resolvedSource = source || "modal"

    const emailStatus = await sendInquiryEmail({
      name,
      email,
      phone: phone || null,
      message,
      experience: experience || null,
      source: resolvedSource,
    })

    await addInquiry({
      name,
      email,
      phone: phone || null,
      message,
      experience: experience || null,
      source: resolvedSource,
      email_status: emailStatus,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 })
  }
}
