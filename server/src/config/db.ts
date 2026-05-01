import { requireEnv } from "./env.js";
import type { MigrationConfig } from "drizzle-orm/migrator";

export const dbConfig = {
  url: requireEnv("DB_URL"),
  migrationConfig: {
    migrationsFolder: "./src/db/migrations",
  } satisfies MigrationConfig,
};
