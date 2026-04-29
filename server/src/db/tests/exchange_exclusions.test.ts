import { describe, it, expect } from "vitest";
import * as exchanges from "../queries/exchanges.js";
import * as persons from "../queries/persons.js";
import * as exclusions from "../queries/exchange_exclusions.js";
import {
  createTestUser,
  createTestPerson,
  cleanupTestUser,
} from "./testUtils.js";

describe("exchange_exclusions queries", () => {
  it("add and remove exclusions", async () => {
    let user;
    let ex;
    let p1;
    let p2;
    let exc;
    try {
      user = (await createTestUser("ee")).user;
      ex = await exchanges.createExchange(user.id, "Exclusion Test");
      p1 = await createTestPerson(user.id, "A");
      p2 = await createTestPerson(user.id, "B");
      exc = await exclusions.addExclusionToExchange(ex.id, p1.id, p2.id);
      expect(exc).toBeDefined();

      const list = await exclusions.getExclusionsByExchangeId(ex.id);
      expect(list.length).toBeGreaterThan(0);

      const forP = await exclusions.getExclusionsForPersonInExchange(
        ex.id,
        p1.id,
      );
      expect(forP.length).toBeGreaterThan(0);

      await exclusions.removeExclusionFromExchange(ex.id, p1.id, p2.id);
      const after = await exclusions.getExclusionsByExchangeId(ex.id);
      expect(after.length).toBe(0);
    } finally {
      if (p1?.id) await persons.deletePerson(p1.id);
      if (p2?.id) await persons.deletePerson(p2.id);
      if (ex?.id) await exchanges.deleteExchange(ex.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
