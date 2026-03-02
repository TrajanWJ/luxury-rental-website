/**
 * Inquiry storage with Turso-first, filesystem-fallback strategy.
 * Each function tries Turso first. If it fails, falls back to
 * the local file store (storing inquiries under the "_inquiries" key).
 */
import { query, execute, DB_CONFIGURED } from "./db"
import { readStore, writeStore } from "./file-store"

export interface Inquiry {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  experience: string | null
  source: "modal" | "contact-page" | "real-estate-modal" | "real-estate-contact"
  email_status: "sent" | "failed" | "skipped"
  created_at: string
}

function getInquiries(data: Record<string, unknown>): Inquiry[] {
  return (data._inquiries as Inquiry[]) || []
}

// --- Public API ---

export async function addInquiry(inquiry: {
  name: string
  email: string
  phone: string | null
  message: string
  experience: string | null
  source: "modal" | "contact-page" | "real-estate-modal" | "real-estate-contact"
  email_status: "sent" | "failed" | "skipped"
}): Promise<void> {
  if (DB_CONFIGURED) {
    try {
      await execute(
        "INSERT INTO inquiries (name, email, phone, message, experience, source, email_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [inquiry.name, inquiry.email, inquiry.phone, inquiry.message, inquiry.experience, inquiry.source, inquiry.email_status]
      )
      // Write-through cache
      try {
        const data = readStore()
        const inquiries = getInquiries(data)
        inquiries.push({
          id: Date.now(),
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          message: inquiry.message,
          experience: inquiry.experience,
          source: inquiry.source,
          email_status: inquiry.email_status,
          created_at: new Date().toISOString(),
        })
        data._inquiries = inquiries
        writeStore(data)
      } catch { /* silently fail on read-only FS */ }
      return
    } catch {
      // DB unavailable — fall through to filesystem
    }
  }

  const data = readStore()
  const inquiries = getInquiries(data)
  inquiries.push({
    id: Date.now(),
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    experience: inquiry.experience,
    source: inquiry.source,
    email_status: inquiry.email_status,
    created_at: new Date().toISOString(),
  })
  data._inquiries = inquiries
  writeStore(data)
}

export async function listInquiries(): Promise<Inquiry[]> {
  if (DB_CONFIGURED) {
    try {
      const rows = await query<Inquiry>(
        "SELECT id, name, email, phone, message, experience, source, email_status, created_at FROM inquiries ORDER BY created_at DESC"
      )
      return rows
    } catch {
      // DB unavailable — fall through to filesystem
    }
  }

  const data = readStore()
  return getInquiries(data).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}
