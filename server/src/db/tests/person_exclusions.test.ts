import { describe, it, expect } from "vitest";
import * as persons from "../queries/persons.js";
import * as personExclusions from "../queries/person_exclusions.js";
import {
  createTestUser,
  createTestPerson,
  cleanupTestUser,
} from "./testUtils.js";

describe("person_exclusions queries", () => {
  it("set and get exclusions for a person", async () => {
    let user;
    let logbookId: string;
    let p1;
    let p2;
    let p3;
    try {
      ({ user, logbookId } = await createTestUser("pe"));
      p1 = await createTestPerson(logbookId, user.id, "A");
      p2 = await createTestPerson(logbookId, user.id, "B");
      p3 = await createTestPerson(logbookId, user.id, "C");

      await personExclusions.setExclusionsForPerson(p1.id, [p2.id, p3.id]);

      const list = await personExclusions.getExclusionsForPerson(p1.id);
      expect(list.length).toBe(2);

      // Full replace — remove one exclusion
      await personExclusions.setExclusionsForPerson(p1.id, [p2.id]);
      const after = await personExclusions.getExclusionsForPerson(p1.id);
      expect(after.length).toBe(1);
      expect(after[0].personId2).toBe(p2.id);

      // Batch lookup by participant ids
      const batch = await personExclusions.getExclusionsByPersonIds([
        p1.id,
        p2.id,
      ]);
      expect(batch.length).toBe(1);
      expect(batch[0].personId1).toBe(p1.id);

      // Clear all
      await personExclusions.setExclusionsForPerson(p1.id, []);
      const empty = await personExclusions.getExclusionsForPerson(p1.id);
      expect(empty.length).toBe(0);
    } finally {
      if (p1?.id) await persons.deletePerson(p1.id);
      if (p2?.id) await persons.deletePerson(p2.id);
      if (p3?.id) await persons.deletePerson(p3.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
