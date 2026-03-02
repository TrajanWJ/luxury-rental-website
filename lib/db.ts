import { createClient, type Client, type InValue } from "@libsql/client"

const DB_CONFIGURED = !!(
  process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
)

let _client: Client | null = null
function getClient(): Client {
  if (!_client) {
    if (!DB_CONFIGURED) throw new Error("Database not configured")
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
  }
  return _client
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  values?: InValue[]
): Promise<T[]> {
  const result = await getClient().execute({ sql, args: values ?? [] })
  return result.rows as unknown as T[]
}

export async function execute(
  sql: string,
  values?: InValue[]
): Promise<{ rowsAffected: number }> {
  const result = await getClient().execute({ sql, args: values ?? [] })
  return { rowsAffected: result.rowsAffected }
}

export { DB_CONFIGURED }
export default null
