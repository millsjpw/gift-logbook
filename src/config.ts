import type { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
    api: APIConfig;
    db: DBConfig;
    session: SessionConfig;
}

type APIConfig = {
    port: number;
    platform: string;
}

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
}

type SessionConfig = {
    defaultDuration: number;
    refreshDuration: number;
    secret: string;
    issuer: string;
}

process.loadEnvFile();

function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is required but not set.`);
    }
    return value;
}

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations",
}

export const config: Config = {
    api: {
        port: Number(envOrThrow("PORT")),
        platform: envOrThrow("PLATFORM"),
    },
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig,
    },
    session: {
        defaultDuration: Number(envOrThrow("JWT_DEFAULT_DURATION")),
        refreshDuration: Number(envOrThrow("JWT_REFRESH_DURATION")),
        secret: envOrThrow("JWT_SECRET"),
        issuer: envOrThrow("JWT_ISSUER"),
    },
};