import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDatabase = globalThis as unknown as {
  mehediRahatPool?: Pool;
};

function databaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error(
      "DATABASE_URL is not configured. Add a PostgreSQL connection string to the server environment.",
    );
  }
  return value;
}

export function getPool() {
  if (!globalForDatabase.mehediRahatPool) {
    globalForDatabase.mehediRahatPool = new Pool({
      connectionString: databaseUrl(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl:
        process.env.DATABASE_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }
  return globalForDatabase.mehediRahatPool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}
