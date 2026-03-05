import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

/**
 * Serves uploaded files from PERSISTENT_DATA_DIR/uploads/ on VPS.
 *
 * On local dev (no PERSISTENT_DATA_DIR), files live in public/uploads/
 * and are served as static files by Next.js — this route won't be hit.
 *
 * On VPS, next.config.mjs rewrites /uploads/* → /api/uploads/* so
 * this route serves files from the persistent directory.
 */

const PERSISTENT_DIR = process.env.PERSISTENT_DATA_DIR
  ? path.join(process.env.PERSISTENT_DATA_DIR, "uploads")
  : null

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!PERSISTENT_DIR) {
    // No persistent dir — let Next.js static file serving handle it
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { path: segments } = await params
  const filePath = path.join(PERSISTENT_DIR, ...segments)

  // Prevent path traversal
  if (!filePath.startsWith(PERSISTENT_DIR)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const ext = path.extname(filePath).slice(1).toLowerCase()
  const contentType = MIME_TYPES[ext] || "application/octet-stream"
  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
