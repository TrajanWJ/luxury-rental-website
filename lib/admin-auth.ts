import { SignJWT, jwtVerify } from "jose"

const rawSecret = process.env.ADMIN_JWT_SECRET
if (!rawSecret && process.env.NODE_ENV === "production") {
  throw new Error("ADMIN_JWT_SECRET environment variable is required in production")
}
const SECRET = new TextEncoder().encode(rawSecret || "dev-only-local-secret")
const COOKIE_NAME = "admin-session"
const EXPIRY = "7d"

function getValidCredentials(): Array<{ username: string; password: string }> {
  const raw = process.env.ADMIN_CREDENTIALS
  if (!raw) return []
  try {
    return JSON.parse(raw) as Array<{ username: string; password: string }>
  } catch {
    console.error("Failed to parse ADMIN_CREDENTIALS env var")
    return []
  }
}

export function validateCredentials(username: string, password: string): boolean {
  const creds = getValidCredentials()
  if (creds.length === 0) return false
  return creds.some(
    (cred) => cred.username === username && cred.password === password
  )
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET)
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET)
    return true
  } catch {
    return false
  }
}

export { COOKIE_NAME }
