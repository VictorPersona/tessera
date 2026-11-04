import { config } from "dotenv";
import pg from "pg";

config();

export default async () => {
  const client = new pg.Client({ connectionTimeoutMillis: 2000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
  } catch (error) {
    const code = (error as { code?: unknown }).code ?? "unknown";
    const notReachable = new Error(
      `Postgres not reachable at ${process.env.PGHOST ?? "localhost"}:${process.env.PGPORT ?? 5432} (${String(code)}). Is Docker running? (docker compose up -d)`,
    );
    notReachable.stack = `Error: ${notReachable.message}`;
    throw notReachable;
  } finally {
    await client.end().catch(() => {});
  }
};
