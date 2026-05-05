import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the auth functions used by the users service
vi.mock("../auth.js", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed"),
  generateToken: vi.fn().mockReturnValue("access-token"),
  makeRefreshToken: vi.fn().mockReturnValue("refresh-token"),
}));

// Mock underlying DB queries
vi.mock("../../db/queries/users.js", () => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock sessions DB
vi.mock("../../db/queries/sessions.js", () => ({
  createSession: vi.fn().mockResolvedValue(undefined),
}));

import * as usersService from "../users.js";
import * as userDb from "../../db/queries/users.js";
import * as sessionsDb from "../../db/queries/sessions.js";
import { hashPassword, generateToken, makeRefreshToken } from "../auth.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("users service", () => {
  it("addUser hashes password, creates user, creates session, and returns tokens", async () => {
    const fakeUser = {
      id: "u1",
      name: "A",
      email: "a@b",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (userDb.createUser as any).mockResolvedValue(fakeUser);
    (generateToken as any).mockReturnValue("access-token");
    (makeRefreshToken as any).mockReturnValue("refresh-token");

    const res = await usersService.addUser("A", "a@b", "pw");
    expect(hashPassword).toHaveBeenCalledWith("pw");
    expect(userDb.createUser).toHaveBeenCalled();
    expect(generateToken).toHaveBeenCalledWith("u1");
    expect(makeRefreshToken).toHaveBeenCalled();
    expect(sessionsDb.createSession).toHaveBeenCalledWith(
      "u1",
      "refresh-token",
    );
    expect(res).toEqual({
      ...fakeUser,
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  it("updateUser hashes password when provided", async () => {
    const updated = { id: "u1", name: "B" };
    (userDb.updateUser as any).mockResolvedValue(updated);

    const res = await usersService.updateUser("u1", "B", undefined, "newpw");
    expect(hashPassword).toHaveBeenCalledWith("newpw");
    expect(userDb.updateUser).toHaveBeenCalledWith(
      "u1",
      "B",
      undefined,
      "hashed",
    );
    expect(res).toEqual(updated);
  });

  it("deleteUser calls db delete", async () => {
    await usersService.deleteUser("u1");
    expect(userDb.deleteUser).toHaveBeenCalledWith("u1");
  });
});
