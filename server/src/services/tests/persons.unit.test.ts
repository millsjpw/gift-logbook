import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../db/queries/persons.js", () => ({
  createPerson: vi.fn(),
  getPersonById: vi.fn(),
  getPersonsByUserId: vi.fn(),
  getPersonsByName: vi.fn(),
  updatePerson: vi.fn(),
  deletePerson: vi.fn(),
  deletePersonsByUserId: vi.fn(),
}));

import * as personsService from "../persons.js";
import * as personsDb from "../../db/queries/persons.js";
import { NotFoundError, UserForbiddenError } from "../../api/errors.js";

beforeEach(() => vi.clearAllMocks());

describe("persons service", () => {
  it("updatePerson throws NotFoundError when person not found", async () => {
    (personsDb.getPersonById as any).mockResolvedValue(null);
    await expect(
      personsService.updatePerson("u1", "p1", "Name"),
    ).rejects.toThrow(NotFoundError);
  });

  it("updatePerson throws UserForbiddenError when not owner", async () => {
    (personsDb.getPersonById as any).mockResolvedValue({
      id: "p1",
      userId: "other",
    });
    await expect(
      personsService.updatePerson("u1", "p1", "Name"),
    ).rejects.toThrow(UserForbiddenError);
  });

  it("updatePerson calls db when owner", async () => {
    (personsDb.getPersonById as any).mockResolvedValue({
      id: "p1",
      userId: "u1",
    });
    (personsDb.updatePerson as any).mockResolvedValue({
      id: "p1",
      name: "New",
    });
    const res = await personsService.updatePerson("u1", "p1", "New");
    expect(personsDb.updatePerson).toHaveBeenCalledWith("p1", "New", undefined);
    expect(res).toBeDefined();
  });
});
