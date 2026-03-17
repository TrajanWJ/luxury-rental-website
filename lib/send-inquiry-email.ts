import { getSiteConfig, DEFAULT_EMAIL_CONFIG } from "./site-config-store"

const BREVO_API_KEY = process.env.BREVO_API_KEY
const SENDER_EMAIL = process.env.SENDER_EMAIL || "wilsonppreply@outlook.com"

type InquirySource = "modal" | "contact-page" | "real-estate-modal" | "real-estate-contact"

function isRealEstate(source: InquirySource): boolean {
  return source === "real-estate-modal" || source === "real-estate-contact"
}

export async function sendInquiryEmail(inquiry: {
  name: string
  email: string
  phone: string | null
  message: string
  experience: string | null
  source: InquirySource
}): Promise<"sent" | "failed" | "skipped"> {
  if (!BREVO_API_KEY) return "skipped"

  try {
    const config = await getSiteConfig()
    const emailConfig = config.emailConfig || DEFAULT_EMAIL_CONFIG

    const re = isRealEstate(inquiry.source)
    const recipients = re
      ? emailConfig.realEstateRecipients
      : emailConfig.strRecipients

    if (!recipients || recipients.length === 0) return "skipped"

    const label = re ? "Real Estate" : "STR"
    const subject = `New ${label} Inquiry from ${inquiry.name}`

    const lines = [
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      inquiry.phone ? `Phone: ${inquiry.phone}` : null,
      inquiry.experience ? `${re ? "Property" : "Interest"}: ${inquiry.experience}` : null,
      `Source: ${inquiry.source}`,
      "",
      "Message:",
      inquiry.message,
    ]
      .filter((l) => l !== null)
      .join("\n")

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Wilson Premier Properties", email: SENDER_EMAIL },
        to: recipients.map((email) => ({ email })),
        replyTo: { email: inquiry.email, name: inquiry.name },
        subject,
        textContent: lines,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Brevo send failed:", res.status, err)
      return "failed"
    }

    return "sent"
  } catch (err) {
    console.error("Failed to send inquiry email:", err)
    return "failed"
  }
}
