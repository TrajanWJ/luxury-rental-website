import mysql from "serverless-mysql"

const DB_CONFIGURED = !!(
  process.env.MYSQL_HOST &&
  process.env.MYSQL_USER &&
  process.env.MYSQL_PASSWORD &&
  process.env.MYSQL_DATABASE
)

const db = DB_CONFIGURED
  ? mysql({
      config: {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectTimeout: 5000,
      },
    })
  : null

export async function query<T = unknown>(
  sql: string,
  values?: unknown[]
): Promise<T> {
  if (!db) throw new Error("Database not configured")
  const results = await db.query(sql, values)
  await db.end()
  return results as T
}

export { DB_CONFIGURED }
export default db
