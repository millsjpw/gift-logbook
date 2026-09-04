import { describe, it, expect } from "vitest";
import { assertSelf, assertListAccess } from "../authz.js";
import { UserForbiddenError } from "../../api/errors.js";

describe("assertSelf", () => {
  it("does not throw when the ids match", () => {
    expect(() => assertSelf("u1", "u1")).not.toThrow();
  });

  it("throws UserForbiddenError when the ids differ", () => {
    expect(() => assertSelf("u1", "u2")).toThrow(UserForbiddenError);
  });
});

describe("assertListAccess", () => {
  const list = { userId: "owner" };

  it("allows the owner to read", () => {
    expect(() => assertListAccess("owner", list, "read")).not.toThrow();
  });

  it("allows the owner to write", () => {
    expect(() => assertListAccess("owner", list, "write")).not.toThrow();
  });

  it("forbids a non-owner, non-shared read", () => {
    expect(() => assertListAccess("other", list, "read")).toThrow(
      UserForbiddenError,
    );
  });

  it("allows a non-owner read when shared with the requester", () => {
    expect(() => assertListAccess("other", list, "read", true)).not.toThrow();
  });

  it("forbids a non-owner write even when shared with the requester", () => {
    expect(() => assertListAccess("other", list, "write", true)).toThrow(
      UserForbiddenError,
    );
  });
});
