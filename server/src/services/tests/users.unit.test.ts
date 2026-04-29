import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the auth hashPassword used by the users service
vi.mock("../auth.js", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed"),
}));

// Mock underlying DB queries
vi.mock("../../db/queries/users.js", () => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

import * as usersService from "../users.js";
import * as userDb from "../../db/queries/users.js";
import { hashPassword } from "../auth.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("users service", () => {
  it("addUser hashes password and creates user", async () => {
    const fakeUser = {
      id: "u1",
      name: "A",
      email: "a@b",
      hashedPassword: "hashed",
    };
    (userDb.createUser as any).mockResolvedValue(fakeUser);

    const res = await usersService.addUser("A", "a@b", "pw");
    expect(hashPassword).toHaveBeenCalledWith("pw");
    expect(userDb.createUser).toHaveBeenCalled();
    expect(res).toEqual(fakeUser);
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
