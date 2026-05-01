import { defineConfig } from "drizzle-kit";

import { dbConfig } from "./src/config/db";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  verbose: false,
  dbCredentials: {
    url: dbConfig.url,
  },
});
