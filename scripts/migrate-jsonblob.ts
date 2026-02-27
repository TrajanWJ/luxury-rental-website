// Run with: npx tsx scripts/migrate-jsonblob.ts
// Reads current JSONBlob data and inserts into MariaDB

const BLOB_URL = "https://jsonblob.com/api/jsonBlob/019c9b43-c13d-7d31-9f88-4fd2e7125d1c"

async function main() {
  const res = await fetch(BLOB_URL, { headers: { Accept: "application/json" } })
  const data = await res.json()

  const { query } = await import("../lib/db")

  for (const [slug, order] of Object.entries(data)) {
    if (slug.startsWith("_")) continue
    await query(
      `INSERT INTO photo_orders (property_slug, order_data, version)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE order_data = VALUES(order_data)`,
      [slug, JSON.stringify(order)]
    )
    console.log(`Migrated: ${slug} (${(order as unknown[]).length} images)`)
  }

  console.log("Migration complete!")
  process.exit(0)
}

main().catch(console.error)
