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

/** Sanitize subfolder to prevent path traversal */
function sanitizeSubfolder(subfolder: string): string {
  return subfolder.replace(/[^a-z0-9\-_]/gi, "")
}

/** Block requests to private/internal IPs */
function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname
    // Block private ranges, localhost, metadata endpoints
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("192.168.") ||
      hostname === "169.254.169.254" ||
      hostname.endsWith(".internal") ||
      parsed.protocol === "file:"
    ) {
      return false
    }
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
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

    // Block internal/private URLs
    if (!isAllowedUrl(url)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 })
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

    const safeSubfolder = sanitizeSubfolder(subfolder)
    const targetDir = safeSubfolder
      ? path.join(UPLOAD_DIR, safeSubfolder)
      : UPLOAD_DIR
    ensureDir(targetDir)

    const filename = `${hash}.${ext}`
    const filePath = path.join(targetDir, filename)

    // Write atomically
    const tmpPath = filePath + ".tmp"
    fs.writeFileSync(tmpPath, buffer)
    fs.renameSync(tmpPath, filePath)

    const localPath = safeSubfolder
      ? `/uploads/${safeSubfolder}/${filename}`
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

    const safeSubfolder = sanitizeSubfolder(subfolder)
    const targetDir = safeSubfolder
      ? path.join(UPLOAD_DIR, safeSubfolder)
      : UPLOAD_DIR
    ensureDir(targetDir)

    const filename = `${hash}.${ext}`
    const filePath = path.join(targetDir, filename)

    const tmpPath = filePath + ".tmp"
    fs.writeFileSync(tmpPath, buffer)
    fs.renameSync(tmpPath, filePath)

    const localPath = safeSubfolder
      ? `/uploads/${safeSubfolder}/${filename}`
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
