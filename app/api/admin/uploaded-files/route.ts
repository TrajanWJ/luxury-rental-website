import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

/**
 * GET /api/admin/uploaded-files
 *
 * Lists all uploaded images from the persistent uploads directory.
 * Returns { files: [{ src, property, filename, size, modified }] }
 */

const PERSISTENT_DIR = process.env.PERSISTENT_DATA_DIR
  ? path.join(process.env.PERSISTENT_DATA_DIR, "uploads")
  : null
const FALLBACK_DIR = path.join(process.cwd(), "public", "uploads")
const UPLOAD_DIR = PERSISTENT_DIR || FALLBACK_DIR

export async function GET() {
  const files: {
    src: string
    property: string | null
    filename: string
    size: number
    modified: string
  }[] = []

  try {
    // Scan photos/ subdirectory
    const photosDir = path.join(UPLOAD_DIR, "photos")
    if (fs.existsSync(photosDir)) {
      const propertyDirs = fs.readdirSync(photosDir, { withFileTypes: true })
      for (const dir of propertyDirs) {
        if (!dir.isDirectory()) continue
        const propPath = path.join(photosDir, dir.name)
        const propFiles = fs.readdirSync(propPath)
        for (const file of propFiles) {
          if (file.startsWith(".") || file.endsWith(".tmp")) continue
          const filePath = path.join(propPath, file)
          const stat = fs.statSync(filePath)
          files.push({
            src: `/uploads/photos/${dir.name}/${file}`,
            property: dir.name,
            filename: file,
            size: stat.size,
            modified: stat.mtime.toISOString(),
          })
        }
      }
    }

    // Scan floor-plans/ subdirectory
    const floorDir = path.join(UPLOAD_DIR, "floor-plans")
    if (fs.existsSync(floorDir)) {
      const floorFiles = fs.readdirSync(floorDir)
      for (const file of floorFiles) {
        if (file.startsWith(".") || file.endsWith(".tmp")) continue
        const filePath = path.join(floorDir, file)
        const stat = fs.statSync(filePath)
        files.push({
          src: `/uploads/floor-plans/${file}`,
          property: null,
          filename: file,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        })
      }
    }

    // Sort newest first
    files.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
  } catch (err) {
    console.error("Failed to list uploaded files:", err)
  }

  return NextResponse.json({ files })
}
