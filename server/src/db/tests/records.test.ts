import { describe, it, expect } from "vitest";
import * as persons from "../queries/persons.js";
import * as records from "../queries/records.js";
import {
  createTestUser,
  createTestPerson,
  cleanupTestUser,
} from "./testUtils.js";

describe("records queries", () => {
  it("add, read, update, delete records", async () => {
    let user;
    let logbookId: string;
    let person;
    let record;
    try {
      ({ user, logbookId } = await createTestUser("rec"));
      person = await createTestPerson(logbookId, user.id, "RecPerson");
      record = await records.addRecord(
        logbookId,
        user.id,
        person.id,
        "Item Name",
        12.34,
        new Date(),
      );
      expect(record).toHaveProperty("id");

      const byLogbook = await records.getRecordsByLogbookId(logbookId);
      expect(byLogbook.length).toBeGreaterThan(0);

      const byId = await records.getRecordById(record.id);
      expect(byId).toBeDefined();

      const byPerson = await records.getRecordsByPersonId(logbookId, person.id);
      expect(byPerson.length).toBeGreaterThan(0);

      const byText = await records.getRecordsByItemText(logbookId, "Item");
      expect(byText.length).toBeGreaterThan(0);

      const updated = await records.updateRecord(
        record.id,
        "New Item",
        20,
        new Date(),
      );
      expect(updated.itemText).toBe("New Item");
    } finally {
      if (record?.id) await records.deleteRecord(record.id);
      if (person?.id) await persons.deletePerson(person.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
