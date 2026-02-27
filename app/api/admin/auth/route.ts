import { NextRequest, NextResponse } from "next/server"
import { validateCredentials, createSessionToken, COOKIE_NAME } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (!validateCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = await createSessionToken()

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
