import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import crypto from "crypto"

/**
 * POST /api/admin/upload
 *
 * Saves uploaded property photos. Strategy:
 *   VPS (PERSISTENT_DATA_DIR): saves to $PERSISTENT_DATA_DIR/uploads/photos/<property>/
 *   Local dev: saves to public/uploads/photos/<property>/
 *
 * Returns { ok: true, urls: ["/uploads/photos/<property>/abc123.jpg", ...] }
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

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"])

function getExtension(file: File): string {
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  }
  if (mimeMap[file.type]) return mimeMap[file.type]
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  return ALLOWED_EXTENSIONS.has(ext) ? ext : "jpg"
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const property = formData.get("property") as string
  const files = formData.getAll("files") as File[]

  if (!property || files.length === 0) {
    return NextResponse.json({ error: "Missing property or files" }, { status: 400 })
  }

  // Validate property slug (alphanumeric + hyphens only)
  if (!/^[a-z0-9-]+$/.test(property)) {
    return NextResponse.json({ error: "Invalid property slug" }, { status: 400 })
  }

  const targetDir = path.join(UPLOAD_DIR, "photos", property)
  ensureDir(targetDir)

  const urls: string[] = []

  for (const file of files) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const hash = crypto.createHash("md5").update(buffer).digest("hex").slice(0, 12)
      const ext = getExtension(file)

      if (!ALLOWED_EXTENSIONS.has(ext)) continue

      const filename = `${hash}.${ext}`
      const filePath = path.join(targetDir, filename)

      // Write atomically
      const tmpPath = filePath + ".tmp"
      fs.writeFileSync(tmpPath, buffer)
      fs.renameSync(tmpPath, filePath)

      urls.push(`/uploads/photos/${property}/${filename}`)
    } catch (err) {
      console.error("Failed to save uploaded file:", err)
    }
  }

  return NextResponse.json({ ok: true, urls })
}
