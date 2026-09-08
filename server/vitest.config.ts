import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["src/db/tests/setup.ts"],
    // These tests share one real Postgres database and some (e.g. the
    // backfill-logbooks script tests) scan whole tables like `users` — running
    // test files in parallel lets one file's transient rows disappear mid-query
    // in another, causing spurious FK-violation failures. Run files sequentially.
    fileParallelism: false,
  },
});
