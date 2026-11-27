import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
  pgStatus: { checkedAt: number; available: boolean } | undefined;
};

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/postgres";

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: DATABASE_URL,
    // Database online (mis. Neon) bisa butuh beberapa detik untuk bangun dari mode idle.
    connectionTimeoutMillis: /localhost|127\.0\.0\.1/.test(DATABASE_URL) ? 1200 : 8000,
    idleTimeoutMillis: 10000,
    max: 10,
  });

pool.on("error", (err) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("PostgreSQL idle client error:", err.message);
  }
});

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export async function isPostgresAvailable(): Promise<boolean> {
  const now = Date.now();
  const cached = globalForPg.pgStatus;
  // Re-check every 15 seconds so recovering PostgreSQL connects automatically
  if (cached && now - cached.checkedAt < 15000) {
    return cached.available;
  }

  try {
    await pool.query("SELECT 1");
    globalForPg.pgStatus = { checkedAt: now, available: true };
    return true;
  } catch {
    globalForPg.pgStatus = { checkedAt: now, available: false };
    return false;
  }
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
