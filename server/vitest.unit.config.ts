import { defineConfig } from "vitest/config";

// Unit test config: no database required. All DB calls are mocked at the query layer.
// Use this in CI or any environment without a real Postgres instance.
// Run with: vitest --config vitest.unit.config.ts --run
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/services/tests/*.unit.test.ts"],
  },
});
