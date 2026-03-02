import { NextRequest, NextResponse } from "next/server"
import { query, execute, DB_CONFIGURED } from "@/lib/db"
import { readStore, writeStore } from "@/lib/file-store"

type ImageItem = { src: string; pos: number; locked: boolean }
type OrderMap = Record<string, ImageItem[]>

interface PhotoOrderRow {
  property_slug: string
  order_data: string
  version: number
}

export async function GET(request: NextRequest) {
  const property = request.nextUrl.searchParams.get("property")
  if (!property) {
    return NextResponse.json({ error: "Missing property param" }, { status: 400 })
  }

  // Try Turso first
  if (DB_CONFIGURED) {
    try {
      if (property === "_all") {
        const rows = await query<PhotoOrderRow>("SELECT property_slug, order_data, version FROM photo_orders")
        const orders: OrderMap = {}
        for (const row of rows) {
          orders[row.property_slug] = JSON.parse(row.order_data)
        }
        return NextResponse.json({ orders })
      }

      const rows = await query<PhotoOrderRow>(
        "SELECT order_data, version FROM photo_orders WHERE property_slug = ?",
        [property]
      )
      if (rows.length === 0) {
        return NextResponse.json({ images: null })
      }
      return NextResponse.json({
        images: JSON.parse(rows[0].order_data),
        version: rows[0].version,
      })
    } catch {
      // Fall through to filesystem
    }
  }

  // Filesystem fallback
  const data = readStore()
  if (property === "_all") {
    const orders: OrderMap = {}
    for (const [key, val] of Object.entries(data)) {
      if (!key.startsWith("_") && Array.isArray(val)) {
        orders[key] = val as ImageItem[]
      }
    }
    return NextResponse.json({ orders })
  }
  return NextResponse.json({ images: (data[property] as ImageItem[]) || null })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { property, images, version } = body as {
    property: string
    images: ImageItem[]
    version?: number
  }

  if (!property || !images) {
    return NextResponse.json({ error: "Missing property or images" }, { status: 400 })
  }

  // Try Turso first
  if (DB_CONFIGURED) {
    try {
      const orderJson = JSON.stringify(images)
      if (version !== undefined) {
        const result = await execute(
          `UPDATE photo_orders SET order_data = ?, version = version + 1, updated_at = datetime('now')
           WHERE property_slug = ? AND version = ?`,
          [orderJson, property, version]
        )
        if (result.rowsAffected === 0) {
          return NextResponse.json(
            { error: "Conflict — someone else updated this order. Please reload." },
            { status: 409 }
          )
        }
      } else {
        await execute(
          `INSERT INTO photo_orders (property_slug, order_data, version)
           VALUES (?, ?, 1)
           ON CONFLICT(property_slug) DO UPDATE SET order_data = excluded.order_data, version = version + 1, updated_at = datetime('now')`,
          [property, orderJson]
        )
      }
      // Write-through cache to filesystem
      try {
        const data = readStore()
        data[property] = images
        writeStore(data)
      } catch { /* silently fail on read-only FS */ }
      return NextResponse.json({ ok: true })
    } catch {
      // Fall through to filesystem
    }
  }

  // Filesystem fallback
  try {
    const data = readStore()
    data[property] = images
    writeStore(data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
