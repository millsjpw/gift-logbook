import { describe, it, expect } from "vitest";
import * as lists from "../queries/lists.js";
import * as persons from "../queries/persons.js";
import {
  createTestUser,
  createTestPerson,
  cleanupTestUser,
} from "./testUtils.js";
import { List } from "../schema.js";

describe("lists queries", () => {
  it("create, read, update, delete list", async () => {
    let user;
    let person;
    let created: List | undefined;
    try {
      user = (await createTestUser("list")).user;
      person = await createTestPerson(user.id, "ListPerson");
      created = await lists.createList(user.id, "Wishlist", person.id);
      expect(created).toHaveProperty("id");

      const byUser = await lists.getListsByUserId(user.id);
      expect(byUser.length).toBeGreaterThan(0);

      const byPerson = await lists.getListsByPersonId(user.id, person.id);
      expect(created).toBeDefined();
      expect(byPerson.some((l) => l.id === created!.id)).toBeTruthy();

      const fetched = await lists.getListById(created!.id);
      expect(fetched).toBeDefined();

      const byName = await lists.getListsByName(user.id, "Wish");
      expect(byName.length).toBeGreaterThan(0);

      const updated = await lists.updateList(created!.id, "NewName", undefined);
      expect(updated.name).toBe("NewName");
    } finally {
      if (created?.id) await lists.deleteList(created.id);
      if (person?.id) await persons.deletePerson(person.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
