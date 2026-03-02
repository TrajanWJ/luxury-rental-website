/**
 * Persistent JSON file store for photo orders and trash.
 *
 * Fallback chain: Turso → filesystem → empty seed.
 *
 * Storage locations:
 *   Development:  ./data/photo-orders.json  (project root, checked into git)
 *   Production:   $PERSISTENT_DATA_DIR/photo-orders.json
 *                 e.g. /home/wilsonprem/data/photo-orders.json
 *
 * Writes are atomic: write to .tmp then rename.
 */
import fs from "fs"
import path from "path"

const DATA_DIR =
  process.env.PERSISTENT_DATA_DIR || path.join(process.cwd(), "data")
const STORE_FILE = path.join(DATA_DIR, "photo-orders.json")

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

/**
 * Read the entire store. Returns {} if file missing or corrupt.
 */
export function readStore(): Record<string, unknown> {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      ensureDir()
      fs.writeFileSync(STORE_FILE, "{}")
      return {}
    }
    return JSON.parse(fs.readFileSync(STORE_FILE, "utf-8"))
  } catch {
    return {}
  }
}

/**
 * Atomically overwrite the store. Writes to .tmp then renames.
 */
export function writeStore(data: Record<string, unknown>): void {
  ensureDir()
  const tmp = STORE_FILE + ".tmp"
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, STORE_FILE)
}

export { STORE_FILE, DATA_DIR }
