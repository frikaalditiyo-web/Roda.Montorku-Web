import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
};

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/postgres",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export async function query<T = unknown>(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === "development") {
    console.log("Executed query", { text, duration, rows: res.rowCount });
  }
  return res as { rows: T[]; rowCount: number | null };
}
