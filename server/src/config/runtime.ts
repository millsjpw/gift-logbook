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
    defaultDuration: number;
    refreshDuration: number;
    secret: string;
    issuer: string;
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
    defaultDuration: requireNumber("JWT_DEFAULT_DURATION"),
    refreshDuration: requireNumber("JWT_REFRESH_DURATION"),
    secret: requireEnv("JWT_SECRET"),
    issuer: requireEnv("JWT_ISSUER"),
  },
};