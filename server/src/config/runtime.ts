import { requireEnv, requireNumber } from "./env.js";
import type { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
  api: {
    port: number;
    platform: string;
  };
  db: {
    url: string;
    migrationConfig: MigrationConfig;
  };
  session: {
    duration: number;
  };
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    port: requireNumber("PORT"),
    platform: requireEnv("PLATFORM"),
  },
  db: {
    url: requireEnv("DB_URL"),
    migrationConfig,
  },
  session: {
    duration: requireNumber("SESSION_DURATION"),
  },
};
