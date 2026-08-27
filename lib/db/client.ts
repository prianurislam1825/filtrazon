// ─────────────────────────────────────────────────────────────
//  FILTRAZON — MySQL connection pool (singleton for Next.js)
// ─────────────────────────────────────────────────────────────

import mysql from 'mysql2/promise'

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined
}

function createPool(): mysql.Pool {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const parsed = new URL(url)

  return mysql.createPool({
    host:               parsed.hostname,
    port:               parseInt(parsed.port || '3306', 10),
    user:               parsed.username,
    password:           parsed.password,
    database:           parsed.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           'Z',
    dateStrings:        false,
    namedPlaceholders:  true,
  })
}

export function getPool(): mysql.Pool {
  if (process.env.NODE_ENV === 'development') {
    if (!global.__mysqlPool) {
      global.__mysqlPool = createPool()
    }
    return global.__mysqlPool
  }
  return createPool()
}

// mysql2's execute() overloads are strict about value types.
// We use `as unknown as mysql.OkPacket` pattern to avoid fighting their generics.
type SqlValue = string | number | boolean | null

export async function query<T>(
  sql: string,
  values?: SqlValue[],
): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows] = await getPool().execute(sql, values as any)
  return rows as T[]
}

export async function execute(
  sql: string,
  values?: SqlValue[],
): Promise<mysql.ResultSetHeader> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result] = await getPool().execute(sql, values as any)
  return result as mysql.ResultSetHeader
}
