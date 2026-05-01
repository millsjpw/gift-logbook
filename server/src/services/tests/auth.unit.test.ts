import { vi, describe, it, expect } from "vitest";

// mock config before importing auth. Include a db.url so other modules that import config don't break.
vi.mock("../../config/runtime.js", () => ({
  config: {
    session: { issuer: "test-issuer", defaultDuration: 3600, secret: "shh" },
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
  it("generate and verify token", () => {
    const token = auth.generateToken("user-1");
    const sub = auth.verifyToken(token);
    expect(sub).toBe("user-1");
  });

  it("getBearerToken extracts token", () => {
    const fakeReq: any = { get: () => "Bearer abc.def.ghi" };
    const token = auth.getBearerToken(fakeReq as any);
    expect(token).toBe("abc.def.ghi");
  });

  it("makeRefreshToken returns hex string of length 64", () => {
    const t = auth.makeRefreshToken();
    expect(typeof t).toBe("string");
    expect(t.length).toBeGreaterThanOrEqual(32);
  });
});
