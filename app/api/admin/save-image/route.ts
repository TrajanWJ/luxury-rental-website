import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import crypto from "crypto"

/**
 * Upload directory strategy:
 *   VPS (PERSISTENT_DATA_DIR set): Writes to $PERSISTENT_DATA_DIR/uploads/
 *     → served via /api/uploads/[...path] route
 *   Local dev / Vercel: Writes to public/uploads/
 *     → served as static files by Next.js
 *
 * Either way, the returned localPath is /uploads/subfolder/filename
 */
const PERSISTENT_DIR = process.env.PERSISTENT_DATA_DIR
  ? path.join(process.env.PERSISTENT_DATA_DIR, "uploads")
  : null
const FALLBACK_DIR = path.join(process.cwd(), "public", "uploads")
const UPLOAD_DIR = PERSISTENT_DIR || FALLBACK_DIR

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * POST /api/admin/save-image
 *
 * Accepts either:
 * 1. A URL to download and save locally
 * 2. A file upload (multipart form data)
 *
 * Returns the local path (e.g., /uploads/floor-plans/abc123.jpg)
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("multipart/form-data")) {
    return handleFileUpload(request)
  }

  return handleUrlDownload(request)
}

async function handleUrlDownload(request: NextRequest) {
  try {
    const { url, subfolder = "" } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url" }, { status: 400 })
    }

    // Skip if already a local path
    if (url.startsWith("/uploads/") || url.startsWith("/images/")) {
      return NextResponse.json({ localPath: url })
    }

    // Download the image
    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const hash = crypto.createHash("md5").update(buffer).digest("hex").slice(0, 12)

    // Determine extension from content type or URL
    const ext = getExtension(
      response.headers.get("content-type") || "",
      url
    )

    const targetDir = subfolder
      ? path.join(UPLOAD_DIR, subfolder)
      : UPLOAD_DIR
    ensureDir(targetDir)

    const filename = `${hash}.${ext}`
    const filePath = path.join(targetDir, filename)

    // Write atomically
    const tmpPath = filePath + ".tmp"
    fs.writeFileSync(tmpPath, buffer)
    fs.renameSync(tmpPath, filePath)

    const localPath = subfolder
      ? `/uploads/${subfolder}/${filename}`
      : `/uploads/${filename}`

    return NextResponse.json({ localPath, size: buffer.length })
  } catch {
    return NextResponse.json(
      { error: "Failed to save image" },
      { status: 500 }
    )
  }
}

async function handleFileUpload(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const subfolder = (formData.get("subfolder") as string) || ""

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const hash = crypto.createHash("md5").update(buffer).digest("hex").slice(0, 12)

    const ext = getExtension(file.type, file.name)

    const targetDir = subfolder
      ? path.join(UPLOAD_DIR, subfolder)
      : UPLOAD_DIR
    ensureDir(targetDir)

    const filename = `${hash}.${ext}`
    const filePath = path.join(targetDir, filename)

    const tmpPath = filePath + ".tmp"
    fs.writeFileSync(tmpPath, buffer)
    fs.renameSync(tmpPath, filePath)

    const localPath = subfolder
      ? `/uploads/${subfolder}/${filename}`
      : `/uploads/${filename}`

    return NextResponse.json({ localPath, size: buffer.length })
  } catch {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

function getExtension(contentType: string, urlOrName: string): string {
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
  }

  if (mimeMap[contentType]) return mimeMap[contentType]

  // Try to get from URL/filename
  const match = urlOrName.match(/\.(\w{2,4})(?:[?#]|$)/)
  if (match) return match[1].toLowerCase()

  return "jpg" // Default
}
