import { describe, it, expect } from "vitest";
import * as tags from "../queries/tags.js";
import { createTestUser, cleanupTestUser } from "./testUtils.js";

describe("tags queries", () => {
  it("create, read, update, delete tags", async () => {
    let user;
    let tag;
    try {
      user = (await createTestUser("tag")).user;
      tag = await tags.createTag(user.id, "Holiday");
      expect(tag).toHaveProperty("id");

      const byUser = await tags.getTagsByUserId(user.id);
      expect(byUser.length).toBeGreaterThan(0);

      const byId = await tags.getTagById(tag.id);
      expect(byId).toBeDefined();

      const updated = await tags.updateTag(tag.id, "Birthday");
      expect(updated.name).toBe("Birthday");
    } finally {
      if (tag?.id) await tags.deleteTag(tag.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
