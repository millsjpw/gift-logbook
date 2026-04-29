import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

// Attempt to load .env.test if present so Vitest setup can pick up DB_URL_TEST
function loadDotEnvFile(filePath: string) {
  try {
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let [, key, val] = m;
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (err) {
    // ignore missing file or parse errors
  }
}

// Exported setup for Vitest `globalSetup` usage. Runs once before the suite and returns a teardown.
export async function setup() {
  loadDotEnvFile(resolve(process.cwd(), ".env"));

  // Ensure tests use the test DB when provided
  process.env.NODE_ENV = "test";
  if (process.env.DB_URL_TEST) {
    process.env.DB_URL = process.env.DB_URL_TEST;
  }

  // Run migrations against the test DB
  if (!process.env.DB_URL) {
    console.error(
      "\nERROR: test DB URL is not set.\nPlease set DB_URL or DB_URL_TEST in your environment before running tests.\nExample:",
    );
    console.error(
      '  export DB_URL_TEST="postgresql://postgres:postgres@localhost:5433/gift_logbook_test?sslmode=disable"',
    );
    throw new Error("DB_URL is not configured for test setup");
  }

  // Quick DB connectivity check to help debug which server is being targeted
  try {
    const checkSql = postgres(process.env.DB_URL as string);
    try {
      const info = await checkSql.unsafe(
        "select current_database() as db, inet_server_port() as port",
      );
    } catch (err) {
      console.warn(
        "DB connectivity check failed (will continue):",
        err && (err as Error).message,
      );
    } finally {
      await checkSql.end({ timeout: 0 });
    }
  } catch (err) {
    console.warn(
      "Failed to perform DB connectivity check:",
      err && (err as Error).message,
    );
  }

  try {
    execSync("npx drizzle-kit migrate", { stdio: "inherit", env: process.env });
  } catch (err) {
    console.error("Failed to run migrations via drizzle-kit migrate:", err);
    throw err;
  }

  // Truncate all public tables to ensure clean state
  async function truncateAll() {
    const sql = postgres(process.env.DB_URL as string);
    try {
      const rows = await sql<
        { tablename: string }[]
      >`select tablename from pg_tables where schemaname='public'`;
      const tables = rows
        .map((r) => r.tablename)
        .filter((t) => t !== "drizzle_migrations");
      if (tables.length > 0) {
        const q = `TRUNCATE ${tables.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE;`;
        await sql.unsafe(q);
      }
    } finally {
      await sql.end({ timeout: 0 });
    }
  }

  await truncateAll();

  // Return a teardown function (no-op for now)
  return async function teardown() {
    // nothing to clean up globally; individual tests are responsible for isolation
  };
}
