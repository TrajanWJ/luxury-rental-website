import { SignJWT, jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "fallback-dev-secret-change-me")
const COOKIE_NAME = "admin-session"
const EXPIRY = "7d"

const ADMIN_USER = "Wilson"
const ADMIN_PASS = "PropertyAdmin7283"

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER && password === ADMIN_PASS
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
