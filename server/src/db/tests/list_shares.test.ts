import { describe, it, expect } from "vitest";
import * as lists from "../queries/lists.js";
import * as listShares from "../queries/list_shares.js";
import { createTestUser, cleanupTestUser } from "./testUtils.js";
import { List } from "../schema.js";

describe("list_shares queries", () => {
  it("share, dedupe, read, and unshare a list", async () => {
    let owner;
    let viewer;
    let list: List | undefined;
    try {
      owner = (await createTestUser("share-owner")).user;
      viewer = (await createTestUser("share-viewer")).user;
      list = await lists.createList(owner.id, "Shared Wishlist");

      const created = await listShares.shareList(list.id, viewer.id);
      expect(created).toBeDefined();

      // sharing again is a no-op, not a duplicate row / error
      const duplicate = await listShares.shareList(list.id, viewer.id);
      expect(duplicate).toBeUndefined();

      const shared = await listShares.isSharedWith(list.id, viewer.id);
      expect(shared).toBe(true);

      const sharesForList = await listShares.getSharesForList(list.id);
      expect(sharesForList).toHaveLength(1);
      expect(sharesForList[0].userId).toBe(viewer.id);

      const sharedWithViewer = await listShares.getListsSharedWithUser(
        viewer.id,
      );
      expect(sharedWithViewer.some((l) => l.id === list!.id)).toBe(true);

      await listShares.unshareList(list.id, viewer.id);
      const sharedAfterRemoval = await listShares.isSharedWith(
        list.id,
        viewer.id,
      );
      expect(sharedAfterRemoval).toBe(false);
    } finally {
      if (list?.id) await lists.deleteList(list.id);
      if (owner?.id) await cleanupTestUser(owner.id);
      if (viewer?.id) await cleanupTestUser(viewer.id);
    }
  });
});
