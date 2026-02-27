import mysql from "serverless-mysql"

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
})

export async function query<T = unknown>(
  sql: string,
  values?: unknown[]
): Promise<T> {
  const results = await db.query(sql, values)
  await db.end()
  return results as T
}

export default db
