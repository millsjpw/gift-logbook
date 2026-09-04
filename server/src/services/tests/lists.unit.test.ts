import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../db/queries/lists.js", () => ({
  createList: vi.fn(),
  getListById: vi.fn(),
  getListsByUserId: vi.fn(),
  getListsByPersonId: vi.fn(),
  getListsByName: vi.fn(),
  getRecentListsByUserId: vi.fn(),
  updateList: vi.fn(),
  deleteList: vi.fn(),
}));

vi.mock("../../db/queries/list_items.js", () => ({
  getListItemsByListId: vi.fn(),
  updateListItem: vi.fn(),
  createListItem: vi.fn(),
}));

vi.mock("../../db/queries/list_item_tags.js", () => ({
  getTagsByListItemId: vi.fn(),
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

vi.mock("../../db/queries/list_shares.js", () => ({
  shareList: vi.fn(),
  unshareList: vi.fn(),
  isSharedWith: vi.fn(),
  getSharesForList: vi.fn(),
  getListsSharedWithUser: vi.fn(),
}));

vi.mock("../../db/queries/users.js", () => ({
  getUserByEmail: vi.fn(),
}));

import * as listsService from "../lists.js";
import * as listsDb from "../../db/queries/lists.js";
import * as itemsDb from "../../db/queries/list_items.js";
import * as listItemTagsDb from "../../db/queries/list_item_tags.js";
import * as listSharesDb from "../../db/queries/list_shares.js";
import * as userDb from "../../db/queries/users.js";
import {
  UserForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../../api/errors.js";

beforeEach(() => vi.clearAllMocks());

describe("lists service", () => {
  it("getListById returns combined list and items for the owner", async () => {
    (listsDb.getListById as any).mockResolvedValue({
      id: "l1",
      userId: "u1",
      name: "L",
    });
    (itemsDb.getListItemsByListId as any).mockResolvedValue([
      { id: "i1", listId: "l1" },
    ]);
    (listItemTagsDb.getTagsByListItemId as any).mockResolvedValue([]);
    const res = await listsService.getListById("u1", "l1");
    expect(res).toBeDefined();
    expect((res as any).items.length).toBe(1);
  });

  it("getListById throws UserForbiddenError for an unrelated user", async () => {
    (listsDb.getListById as any).mockResolvedValue({
      id: "l1",
      userId: "u1",
      name: "L",
    });
    (listSharesDb.isSharedWith as any).mockResolvedValue(false);
    await expect(listsService.getListById("other", "l1")).rejects.toThrow(
      UserForbiddenError,
    );
  });

  it("getListById returns the list for a user it was shared with", async () => {
    (listsDb.getListById as any).mockResolvedValue({
      id: "l1",
      userId: "u1",
      name: "L",
    });
    (listSharesDb.isSharedWith as any).mockResolvedValue(true);
    (itemsDb.getListItemsByListId as any).mockResolvedValue([]);
    const res = await listsService.getListById("other", "l1");
    expect(res).toBeDefined();
    expect(listSharesDb.isSharedWith).toHaveBeenCalledWith("l1", "other");
  });

  it("updateList throws UserForbiddenError when not owner", async () => {
    const list = { id: "l1", userId: "u1", name: "L", items: [] } as any;
    await expect(listsService.updateList("other", list)).rejects.toThrow(
      UserForbiddenError,
    );
  });

  it("getRecentLists delegates to db with userId and limit", async () => {
    const mockLists = [
      { id: "l1", userId: "u1", name: "Wishlist", updatedAt: new Date() },
      { id: "l2", userId: "u1", name: "Holiday", updatedAt: new Date() },
    ];
    (listsDb.getRecentListsByUserId as any).mockResolvedValue(mockLists);
    const res = await listsService.getRecentLists("u1", 2);
    expect(listsDb.getRecentListsByUserId).toHaveBeenCalledWith("u1", 2);
    expect(res).toHaveLength(2);
    expect(res[0]).not.toHaveProperty("items");
  });

  it("getRecentLists uses default limit of 5", async () => {
    (listsDb.getRecentListsByUserId as any).mockResolvedValue([]);
    await listsService.getRecentLists("u1");
    expect(listsDb.getRecentListsByUserId).toHaveBeenCalledWith("u1", 5);
  });

  describe("shareList", () => {
    it("throws UserForbiddenError when the caller is not the owner", async () => {
      (listsDb.getListById as any).mockResolvedValue({
        id: "l1",
        userId: "owner",
      });
      await expect(
        listsService.shareList("other", "l1", "wife@example.com"),
      ).rejects.toThrow(UserForbiddenError);
    });

    it("throws NotFoundError when no account matches the email", async () => {
      (listsDb.getListById as any).mockResolvedValue({
        id: "l1",
        userId: "owner",
      });
      (userDb.getUserByEmail as any).mockResolvedValue(undefined);
      await expect(
        listsService.shareList("owner", "l1", "nobody@example.com"),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws BadRequestError when sharing with yourself", async () => {
      (listsDb.getListById as any).mockResolvedValue({
        id: "l1",
        userId: "owner",
      });
      (userDb.getUserByEmail as any).mockResolvedValue({
        id: "owner",
        email: "me@example.com",
      });
      await expect(
        listsService.shareList("owner", "l1", "me@example.com"),
      ).rejects.toThrow(BadRequestError);
    });

    it("shares the list with the resolved user", async () => {
      (listsDb.getListById as any).mockResolvedValue({
        id: "l1",
        userId: "owner",
      });
      (userDb.getUserByEmail as any).mockResolvedValue({
        id: "wife",
        email: "wife@example.com",
      });
      await listsService.shareList("owner", "l1", "wife@example.com");
      expect(listSharesDb.shareList).toHaveBeenCalledWith("l1", "wife");
    });
  });

  describe("unshareList", () => {
    it("throws UserForbiddenError when the caller is not the owner", async () => {
      (listsDb.getListById as any).mockResolvedValue({
        id: "l1",
        userId: "owner",
      });
      await expect(
        listsService.unshareList("other", "l1", "wife"),
      ).rejects.toThrow(UserForbiddenError);
    });

    it("removes the share when the caller is the owner", async () => {
      (listsDb.getListById as any).mockResolvedValue({
        id: "l1",
        userId: "owner",
      });
      await listsService.unshareList("owner", "l1", "wife");
      expect(listSharesDb.unshareList).toHaveBeenCalledWith("l1", "wife");
    });
  });

  describe("getSharesForList", () => {
    it("throws UserForbiddenError when the caller is not the owner", async () => {
      (listsDb.getListById as any).mockResolvedValue({
        id: "l1",
        userId: "owner",
      });
      await expect(
        listsService.getSharesForList("other", "l1"),
      ).rejects.toThrow(UserForbiddenError);
    });

    it("returns the shares when the caller is the owner", async () => {
      (listsDb.getListById as any).mockResolvedValue({
        id: "l1",
        userId: "owner",
      });
      const shares = [
        { userId: "wife", name: "Wife", email: "wife@example.com" },
      ];
      (listSharesDb.getSharesForList as any).mockResolvedValue(shares);
      const res = await listsService.getSharesForList("owner", "l1");
      expect(res).toBe(shares);
    });
  });

  describe("getListsSharedWithMe", () => {
    it("hydrates items for each shared list", async () => {
      (listSharesDb.getListsSharedWithUser as any).mockResolvedValue([
        { id: "l1", userId: "owner", name: "L" },
      ]);
      (itemsDb.getListItemsByListId as any).mockResolvedValue([]);
      const res = await listsService.getListsSharedWithMe("wife");
      expect(res).toHaveLength(1);
      expect(res[0]).toHaveProperty("items");
    });
  });
});
