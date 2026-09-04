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

vi.mock("../../db/queries/persons.js", () => ({
  getPersonById: vi.fn(),
}));

import * as recordsService from "../records.js";
import * as recordsDb from "../../db/queries/records.js";
import * as logbookMembersDb from "../../db/queries/logbook_members.js";
import * as personsDb from "../../db/queries/persons.js";
import {
  NotFoundError,
  UserForbiddenError,
  BadRequestError,
} from "../../api/errors.js";

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

  describe("addRecord", () => {
    it("throws UserForbiddenError when not a logbook member", async () => {
      (logbookMembersDb.isMember as any).mockResolvedValue(false);
      await expect(
        recordsService.addRecord("u1", "lb1", "p1", "Gift"),
      ).rejects.toThrow(UserForbiddenError);
    });

    it("throws BadRequestError when the person is in a different logbook", async () => {
      (logbookMembersDb.isMember as any).mockResolvedValue(true);
      (personsDb.getPersonById as any).mockResolvedValue({
        id: "p1",
        logbookId: "other-logbook",
      });
      await expect(
        recordsService.addRecord("u1", "lb1", "p1", "Gift"),
      ).rejects.toThrow(BadRequestError);
    });

    it("throws BadRequestError when the person does not exist", async () => {
      (logbookMembersDb.isMember as any).mockResolvedValue(true);
      (personsDb.getPersonById as any).mockResolvedValue(undefined);
      await expect(
        recordsService.addRecord("u1", "lb1", "p1", "Gift"),
      ).rejects.toThrow(BadRequestError);
    });

    it("creates the record when the person is in the same logbook", async () => {
      (logbookMembersDb.isMember as any).mockResolvedValue(true);
      (personsDb.getPersonById as any).mockResolvedValue({
        id: "p1",
        logbookId: "lb1",
      });
      (recordsDb.addRecord as any).mockResolvedValue({
        id: "r1",
        logbookId: "lb1",
        personId: "p1",
        itemText: "Gift",
      });
      const res = await recordsService.addRecord("u1", "lb1", "p1", "Gift");
      expect(recordsDb.addRecord).toHaveBeenCalledWith(
        "lb1",
        "u1",
        "p1",
        "Gift",
        undefined,
        undefined,
      );
      expect(res).toBeDefined();
    });
  });
});
