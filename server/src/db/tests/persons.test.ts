import { describe, it, expect } from "vitest";
import * as persons from "../queries/persons.js";
import { createTestUser, cleanupTestUser } from "./testUtils.js";
import { Person } from "../schema.js";

describe("persons queries", () => {
  it("create, read, update, delete person", async () => {
    let user;
    let created: Person | undefined;
    try {
      user = (await createTestUser("person")).user;
      created = await persons.createPerson(user.id, "Friend");
      expect(created).toHaveProperty("id");
      expect(created.birthMonth).toBeNull();
      expect(created.birthDay).toBeNull();
      expect(created.birthYear).toBeNull();

      const list = await persons.getPersonsByUserId(user.id);
      expect(created).toBeDefined();
      expect(list.some((p) => p.id === created!.id)).toBeTruthy();

      const byId = await persons.getPersonById(created.id);
      expect(byId).toBeDefined();

      const found = await persons.getPersonsByName(user.id, "Friend");
      expect(found.length).toBeGreaterThan(0);

      const updated = await persons.updatePerson(created.id, "Buddy");
      expect(updated.name).toBe("Buddy");
    } finally {
      if (created?.id) await persons.deletePerson(created.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });

  it("create person with birth date fields", async () => {
    let user;
    let created: Person | undefined;
    try {
      user = (await createTestUser("person-birth")).user;
      created = await persons.createPerson(
        user.id,
        "Birthday Person",
        6,
        15,
        1990,
      );
      expect(created.birthMonth).toBe(6);
      expect(created.birthDay).toBe(15);
      expect(created.birthYear).toBe(1990);
    } finally {
      if (created?.id) await persons.deletePerson(created.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });

  it("update person birth date fields", async () => {
    let user;
    let created: Person | undefined;
    try {
      user = (await createTestUser("person-birth-update")).user;
      created = await persons.createPerson(user.id, "No Birthday");
      expect(created.birthMonth).toBeNull();

      const updated = await persons.updatePerson(
        created.id,
        undefined,
        3,
        22,
        1985,
      );
      expect(updated.birthMonth).toBe(3);
      expect(updated.birthDay).toBe(22);
      expect(updated.birthYear).toBe(1985);

      const cleared = await persons.updatePerson(
        updated.id,
        undefined,
        null,
        null,
        null,
      );
      expect(cleared.birthMonth).toBeNull();
      expect(cleared.birthDay).toBeNull();
      expect(cleared.birthYear).toBeNull();
    } finally {
      if (created?.id) await persons.deletePerson(created.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
