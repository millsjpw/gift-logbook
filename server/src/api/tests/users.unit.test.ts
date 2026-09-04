import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Request, Response } from "express";

vi.mock("../../services/users.js", () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

import * as usersApi from "../users.js";
import * as userService from "../../services/users.js";
import { UserForbiddenError } from "../errors.js";

function mockRes(): Response {
  const res: any = {};
  res.header = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res as Response;
}

beforeEach(() => vi.clearAllMocks());

describe("users api authz", () => {
  it("handleGetUser throws UserForbiddenError when requesting another account", async () => {
    const req = {
      params: { id: "other" },
      auth: { userId: "u1" },
    } as any as Request;
    await expect(usersApi.handleGetUser(req, mockRes())).rejects.toThrow(
      UserForbiddenError,
    );
    expect(userService.getUserById).not.toHaveBeenCalled();
  });

  it("handleGetUser succeeds when requesting your own account", async () => {
    (userService.getUserById as any).mockResolvedValue({ id: "u1" });
    const req = {
      params: { id: "u1" },
      auth: { userId: "u1" },
    } as any as Request;
    await usersApi.handleGetUser(req, mockRes());
    expect(userService.getUserById).toHaveBeenCalledWith("u1");
  });

  it("handleUpdateUser throws UserForbiddenError when targeting another account", async () => {
    const req = {
      params: { id: "other" },
      auth: { userId: "u1" },
      body: { name: "New Name" },
    } as any as Request;
    await expect(usersApi.handleUpdateUser(req, mockRes())).rejects.toThrow(
      UserForbiddenError,
    );
    expect(userService.updateUser).not.toHaveBeenCalled();
  });

  it("handleDeleteUser throws UserForbiddenError when targeting another account", async () => {
    const req = {
      params: { id: "other" },
      auth: { userId: "u1" },
    } as any as Request;
    await expect(usersApi.handleDeleteUser(req, mockRes())).rejects.toThrow(
      UserForbiddenError,
    );
    expect(userService.deleteUser).not.toHaveBeenCalled();
  });
});
