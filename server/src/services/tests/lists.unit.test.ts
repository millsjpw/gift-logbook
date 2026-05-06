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

import * as listsService from "../lists.js";
import * as listsDb from "../../db/queries/lists.js";
import * as itemsDb from "../../db/queries/list_items.js";
import * as listItemTagsDb from "../../db/queries/list_item_tags.js";
import { UserForbiddenError } from "../../api/errors.js";

beforeEach(() => vi.clearAllMocks());

describe("lists service", () => {
  it("getListById returns combined list and items", async () => {
    (listsDb.getListById as any).mockResolvedValue({
      id: "l1",
      userId: "u1",
      name: "L",
    });
    (itemsDb.getListItemsByListId as any).mockResolvedValue([
      { id: "i1", listId: "l1" },
    ]);
    (listItemTagsDb.getTagsByListItemId as any).mockResolvedValue([]);
    const res = await listsService.getListById("l1");
    expect(res).toBeDefined();
    expect((res as any).items.length).toBe(1);
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
});
