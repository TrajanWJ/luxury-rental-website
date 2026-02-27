import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

type ImageItem = { src: string; pos: number; locked: boolean }

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

  try {
    if (property === "_all") {
      const rows = await query<PhotoOrderRow[]>("SELECT property_slug, order_data, version FROM photo_orders")
      const orders: Record<string, ImageItem[]> = {}
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
    // Graceful fallback when DB is unavailable — return empty orders
    // so the site still works using static image arrays from lib/data.ts
    if (property === "_all") {
      return NextResponse.json({ orders: {} })
    }
    return NextResponse.json({ images: null })
  }
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

  const orderJson = JSON.stringify(images)

  try {
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
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }
}
