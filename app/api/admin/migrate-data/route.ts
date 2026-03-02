import { NextResponse } from "next/server"
import { execute, DB_CONFIGURED } from "@/lib/db"
import fs from "fs"
import path from "path"

const DATA_DIR =
  process.env.PERSISTENT_DATA_DIR || path.join(process.cwd(), "data")

export async function POST() {
  if (!DB_CONFIGURED) {
    return NextResponse.json(
      { error: "Database not configured (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN missing)" },
      { status: 500 }
    )
  }

  const report: Record<string, unknown> = {}

  // 1. Migrate photo orders
  try {
    const photoFile = path.join(DATA_DIR, "photo-orders.json")
    if (fs.existsSync(photoFile)) {
      const data = JSON.parse(fs.readFileSync(photoFile, "utf-8"))
      let count = 0
      for (const [key, val] of Object.entries(data)) {
        if (key.startsWith("_")) continue // skip _trash, _inquiries
        if (!Array.isArray(val)) continue
        await execute(
          `INSERT INTO photo_orders (property_slug, order_data, version)
           VALUES (?, ?, 1)
           ON CONFLICT(property_slug) DO UPDATE SET order_data = excluded.order_data, version = version + 1, updated_at = datetime('now')`,
          [key, JSON.stringify(val)]
        )
        count++
      }
      report.photoOrders = { migrated: count }

      // 2. Migrate trash items from photo-orders.json._trash
      //    Clear existing trash first to make migration idempotent
      const trash = data._trash as Array<{
        id?: number
        property_slug: string
        src: string
        deleted_at: string
      }> | undefined
      if (trash && trash.length > 0) {
        await execute("DELETE FROM trash_items")
        let trashCount = 0
        for (const item of trash) {
          await execute(
            "INSERT INTO trash_items (property_slug, src, deleted_at) VALUES (?, ?, ?)",
            [item.property_slug, item.src, item.deleted_at]
          )
          trashCount++
        }
        report.trashItems = { migrated: trashCount }
      } else {
        report.trashItems = { migrated: 0, note: "No _trash key found" }
      }

      // 3. Migrate inquiries from photo-orders.json._inquiries
      //    Clear existing inquiries first to make migration idempotent
      const inquiries = data._inquiries as Array<{
        name: string
        email: string
        phone: string | null
        message: string
        experience: string | null
        source: string
        email_status: string
        created_at: string
      }> | undefined
      if (inquiries && inquiries.length > 0) {
        await execute("DELETE FROM inquiries")
        let inqCount = 0
        for (const inq of inquiries) {
          await execute(
            "INSERT INTO inquiries (name, email, phone, message, experience, source, email_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [inq.name, inq.email, inq.phone, inq.message, inq.experience, inq.source, inq.email_status, inq.created_at]
          )
          inqCount++
        }
        report.inquiries = { migrated: inqCount }
      } else {
        report.inquiries = { migrated: 0, note: "No _inquiries key found" }
      }
    } else {
      report.photoOrders = { skipped: true, note: "photo-orders.json not found" }
    }
  } catch (err) {
    report.photoOrders = { error: err instanceof Error ? err.message : "Unknown error" }
  }

  // 4. Migrate site config
  try {
    const configFile = path.join(DATA_DIR, "site-config.json")
    if (fs.existsSync(configFile)) {
      const configData = JSON.parse(fs.readFileSync(configFile, "utf-8"))
      await execute(
        `INSERT INTO site_config (config_key, config_data, version)
         VALUES (?, ?, 1)
         ON CONFLICT(config_key) DO UPDATE SET config_data = excluded.config_data, version = version + 1, updated_at = datetime('now')`,
        ["main", JSON.stringify(configData)]
      )
      report.siteConfig = { migrated: true }
    } else {
      report.siteConfig = { skipped: true, note: "site-config.json not found" }
    }
  } catch (err) {
    report.siteConfig = { error: err instanceof Error ? err.message : "Unknown error" }
  }

  return NextResponse.json({ ok: true, report })
}
