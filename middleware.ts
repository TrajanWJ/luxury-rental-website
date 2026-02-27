import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken, COOKIE_NAME } from "@/lib/admin-auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token || !(await verifySessionToken(token))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
