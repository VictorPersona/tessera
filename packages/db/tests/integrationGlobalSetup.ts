// CHANGED: no dotenv here: importing @tessera/config loads .env and validates it.
import { config } from "@tessera/config";
import pg from "pg";

export default async () => {
  const client = new pg.Client({
    connectionString: config.DATABASE_URL,
    connectionTimeoutMillis: 2000,
  });
  try {
    await client.connect();
    await client.query("SELECT 1");
  } catch (error) {
    const code = (error as { code?: unknown }).code ?? "unknown";
    const { host } = new URL(config.DATABASE_URL);
    const notReachable = new Error(
      `Postgres not reachable at ${host} (${String(code)}). Is Docker running? (docker compose up -d)`,
    );
    notReachable.stack = `Error: ${notReachable.message}`;
    throw notReachable;
  } finally {
    await client.end().catch(() => {});
  }
};
