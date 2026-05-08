import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/scripts/migrate.ts"],
  outDir: "dist",
  format: ["cjs"],
  platform: "node",
  target: "node22",

  bundle: true,
  splitting: false,
  clean: true,
  noExternal: ["express", "cors", "jsonwebtoken", "drizzle-orm", "postgres"],
  external: ["argon2"],
});
