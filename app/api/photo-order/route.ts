import { NextRequest, NextResponse } from "next/server"
import { query, DB_CONFIGURED } from "@/lib/db"

type ImageItem = { src: string; pos: number; locked: boolean }
type OrderMap = Record<string, ImageItem[]>

interface PhotoOrderRow {
  property_slug: string
  order_data: string
  version: number
}

// JSONBlob fallback when MariaDB is unavailable
const BLOB_ID = "019ca122-8c3b-773f-874b-c378c0605166"
const BLOB_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`

async function readBlob(): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(BLOB_URL, { headers: { Accept: "application/json" }, cache: "no-store" })
    if (res.ok) return await res.json()
  } catch {}
  return {}
}

async function writeBlob(data: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(BLOB_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    })
    return res.ok
  } catch { return false }
}

export async function GET(request: NextRequest) {
  const property = request.nextUrl.searchParams.get("property")
  if (!property) {
    return NextResponse.json({ error: "Missing property param" }, { status: 400 })
  }

  // Try MariaDB first
  if (DB_CONFIGURED) {
    try {
      if (property === "_all") {
        const rows = await query<PhotoOrderRow[]>("SELECT property_slug, order_data, version FROM photo_orders")
        const orders: OrderMap = {}
        for (const row of rows) {
          orders[row.property_slug] = JSON.parse(row.order_data)
        }
        return NextResponse.json({ orders })
      }

      const rows = await query<PhotoOrderRow[]>(
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
      // Fall through to JSONBlob
    }
  }

  // JSONBlob fallback
  const data = await readBlob()
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

  // Try MariaDB first
  if (DB_CONFIGURED) {
    try {
      const orderJson = JSON.stringify(images)
      if (version !== undefined) {
        const result = await query<{ affectedRows: number }>(
          `UPDATE photo_orders SET order_data = ?, version = version + 1
           WHERE property_slug = ? AND version = ?`,
          [orderJson, property, version]
        )
        if ((result as any).affectedRows === 0) {
          return NextResponse.json(
            { error: "Conflict — someone else updated this order. Please reload." },
            { status: 409 }
          )
        }
      } else {
        await query(
          `INSERT INTO photo_orders (property_slug, order_data, version)
           VALUES (?, ?, 1)
           ON DUPLICATE KEY UPDATE order_data = VALUES(order_data), version = version + 1`,
          [property, orderJson]
        )
      }
      return NextResponse.json({ ok: true })
    } catch {
      // Fall through to JSONBlob
    }
  }

  // JSONBlob fallback
  const data = await readBlob()
  data[property] = images
  const ok = await writeBlob(data)
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Failed to save" }, { status: 500 })
}
