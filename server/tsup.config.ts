import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/scripts/migrate.ts",
    "src/scripts/backfill-logbooks.ts",
  ],
  outDir: "dist",
  format: ["cjs"],
  platform: "node",
  target: "node22",

  bundle: true,
  splitting: false,
  clean: true,
  noExternal: [
    "express",
    "cors",
    "jsonwebtoken",
    "drizzle-orm",
    "postgres",
    "cookie-parser",
  ],
  external: ["argon2"],
});
