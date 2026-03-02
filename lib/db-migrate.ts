import { execute } from "./db"

export async function runMigrations() {
  await execute(`
    CREATE TABLE IF NOT EXISTS photo_orders (
      property_slug TEXT PRIMARY KEY,
      order_data TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS trash_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_slug TEXT NOT NULL,
      src TEXT NOT NULL,
      deleted_at TEXT DEFAULT (datetime('now'))
    )
  `)
  await execute(
    `CREATE INDEX IF NOT EXISTS idx_trash_property ON trash_items (property_slug)`
  )
  await execute(
    `CREATE INDEX IF NOT EXISTS idx_trash_deleted_at ON trash_items (deleted_at)`
  )

  await execute(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      experience TEXT,
      source TEXT NOT NULL DEFAULT 'modal',
      email_status TEXT NOT NULL DEFAULT 'skipped',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)
  await execute(
    `CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at)`
  )

  await execute(`
    CREATE TABLE IF NOT EXISTS site_config (
      config_key TEXT PRIMARY KEY,
      config_data TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)
}
