import { vi, describe, it, expect } from "vitest";

// mock config before importing auth. Include a db.url so other modules that import config don't break.
vi.mock("../../config/runtime.js", () => ({
  config: {
    session: { duration: 2592000 },
    db: {
      url:
        process.env.DB_URL_TEST ||
        process.env.DB_URL ||
        "postgres://localhost:5432/postgres",
    },
    api: { port: 0, platform: "test" },
  },
}));

import * as auth from "../auth.js";

describe("auth utilities", () => {
  it("makeSessionToken returns hex string of length 64", () => {
    const token = auth.makeSessionToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBe(64);
  });

  it("makeSessionToken generates unique tokens", () => {
    const t1 = auth.makeSessionToken();
    const t2 = auth.makeSessionToken();
    expect(t1).not.toBe(t2);
  });
});
