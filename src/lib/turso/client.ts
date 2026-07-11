/**
 * Turso SQLite database client.
 * 
 * Provides a singleton database connection using @libsql/client.
 * Works on both server-side (Vercel) and local development.
 */

import { createClient as createTursoClient, type Client, type InValue } from '@libsql/client';

let dbInstance: Client | null = null;

/**
 * Get or create the Turso database client.
 * Uses environment variables for configuration.
 */
export function getDb(): Client {
  if (dbInstance) return dbInstance;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      'Missing TURSO_DATABASE_URL environment variable. ' +
      'Set it in .env.local or Vercel environment variables.'
    );
  }

  dbInstance = createTursoClient({
    url,
    authToken,
  });

  return dbInstance;
}

/**
 * Execute a SQL query with positional parameters.
 * Provides parameterised query support for SQL injection prevention.
 */
export async function executeQuery<T = Record<string, unknown>>(
  sql: string,
  params?: InValue[]
): Promise<T[]> {
  const db = getDb();
  const result = params ? await db.execute(sql, params) : await db.execute(sql);
  return result.rows as unknown as T[];
}

/**
 * Execute a SQL statement (INSERT, UPDATE, DELETE) with positional parameters.
 */
export async function executeStatement(
  sql: string,
  params?: InValue[]
): Promise<{ lastInsertRowid?: number | bigint; rowsAffected: number }> {
  const db = getDb();
  const result = params ? await db.execute(sql, params) : await db.execute(sql);
  return {
    lastInsertRowid: result.lastInsertRowid,
    rowsAffected: result.rowsAffected,
  };
}

/**
 * Execute multiple SQL statements in a batch.
 */
export async function executeBatch(
  statements: Array<{ sql: string; params?: InValue[] }>
): Promise<void> {
  const db = getDb();
  for (const stmt of statements) {
    if (stmt.params) {
      await db.execute(stmt.sql, stmt.params);
    } else {
      await db.execute(stmt.sql);
    }
  }
}

/**
 * Close the database connection.
 */
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}