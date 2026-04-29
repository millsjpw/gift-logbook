import { describe, it, expect } from "vitest";
import * as exchanges from "../queries/exchanges.js";
import * as persons from "../queries/persons.js";
import * as participants from "../queries/exchange_participants.js";
import {
  createTestUser,
  createTestPerson,
  cleanupTestUser,
} from "./testUtils.js";

describe("exchange_participants queries", () => {
  it("add and remove participants", async () => {
    let user;
    let ex;
    let person;
    let part;
    try {
      user = (await createTestUser("ep")).user;
      ex = await exchanges.createExchange(user.id, "Party");
      person = await createTestPerson(user.id, "P1");
      part = await participants.addParticipantToExchange(ex.id, person.id);
      expect(part).toBeDefined();

      const list = await participants.getParticipantsByExchangeId(ex.id);
      expect(list.length).toBeGreaterThan(0);

      await participants.removeParticipantFromExchange(ex.id, person.id);
      const after = await participants.getParticipantsByExchangeId(ex.id);
      expect(after.length).toBe(0);
    } finally {
      if (person?.id) await persons.deletePerson(person.id);
      if (ex?.id) await exchanges.deleteExchange(ex.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
