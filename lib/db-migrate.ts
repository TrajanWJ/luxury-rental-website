import { query } from "./db"

export async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS photo_orders (
      property_slug VARCHAR(100) PRIMARY KEY,
      order_data JSON NOT NULL,
      version INT NOT NULL DEFAULT 1,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS trash_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_slug VARCHAR(100) NOT NULL,
      src VARCHAR(500) NOT NULL,
      deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_property (property_slug),
      INDEX idx_deleted_at (deleted_at)
    )
  `)
}
