import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../db/queries/records.js", () => ({
  addRecord: vi.fn(),
  getRecordById: vi.fn(),
  getRecordsByLogbookId: vi.fn(),
  getRecordsByPersonId: vi.fn(),
  getRecordsByItemText: vi.fn(),
  updateRecord: vi.fn(),
  deleteRecord: vi.fn(),
  deleteRecordsByLogbookId: vi.fn(),
  deleteRecordsByPersonId: vi.fn(),
}));

vi.mock("../../db/queries/record_tags.js", () => ({
  addTagToRecord: vi.fn(),
  removeTagFromRecord: vi.fn(),
  getTagsByRecordId: vi.fn(),
}));

vi.mock("../../db/queries/tags.js", () => ({
  findOrCreateTag: vi.fn(),
  getTagsByUserId: vi.fn(),
  getTagById: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
  deleteTagsByUserId: vi.fn(),
  createTag: vi.fn(),
}));

vi.mock("../../db/queries/logbook_members.js", () => ({
  isMember: vi.fn(),
}));

import * as recordsService from "../records.js";
import * as recordsDb from "../../db/queries/records.js";
import * as logbookMembersDb from "../../db/queries/logbook_members.js";
import { NotFoundError, UserForbiddenError } from "../../api/errors.js";

beforeEach(() => vi.clearAllMocks());

describe("records service", () => {
  it("updateRecord throws NotFoundError when record not found", async () => {
    (recordsDb.getRecordById as any).mockResolvedValue(null);
    await expect(recordsService.updateRecord("u1", "r1", "x")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("updateRecord throws UserForbiddenError when not a logbook member", async () => {
    (recordsDb.getRecordById as any).mockResolvedValue({
      id: "r1",
      logbookId: "lb1",
    });
    (logbookMembersDb.isMember as any).mockResolvedValue(false);
    await expect(recordsService.updateRecord("u1", "r1", "x")).rejects.toThrow(
      UserForbiddenError,
    );
  });

  it("addTagToRecord validates logbook membership", async () => {
    (recordsDb.getRecordById as any).mockResolvedValue({
      id: "r1",
      logbookId: "lb1",
    });
    (logbookMembersDb.isMember as any).mockResolvedValue(true);
    const spy = recordsDb.getRecordById as any;
    await recordsService.addTagToRecord("u1", "r1", "t1");
    expect(spy).toHaveBeenCalled();
    expect(logbookMembersDb.isMember).toHaveBeenCalledWith("lb1", "u1");
  });
});
