import { describe, it, expect } from "vitest";
import { eq, and } from "drizzle-orm";
import { db } from "../db.js";
import { logbookMembers, logbooks, persons, records } from "../schema.js";
import * as personsDb from "../queries/persons.js";
import * as recordsDb from "../queries/records.js";
import { createTestUser, cleanupTestUser } from "./testUtils.js";
import {
  dryRunBackfill,
  runBackfill,
} from "../../scripts/backfill-logbooks.js";

describe("backfill-logbooks script", () => {
  it("dry run reports pending rows without writing anything", async () => {
    let user;
    try {
      user = (await createTestUser("backfill-dry")).user;
      const person = await personsDb.createPerson(user.id, "DryRunPerson");
      await recordsDb.addRecord(user.id, person.id, "Some gift");

      const result = await dryRunBackfill(db);
      expect(result.usersBackfilled).toBeGreaterThanOrEqual(1);
      expect(result.personsBackfilled).toBeGreaterThanOrEqual(1);
      expect(result.recordsBackfilled).toBeGreaterThanOrEqual(1);

      const [freshPerson] = await db
        .select()
        .from(persons)
        .where(eq(persons.id, person.id));
      expect(freshPerson.logbookId).toBeNull();

      const [membership] = await db
        .select()
        .from(logbookMembers)
        .where(eq(logbookMembers.userId, user.id));
      expect(membership).toBeUndefined();
    } finally {
      if (user?.id) await cleanupTestUser(user.id);
    }
  });

  it("backfills a pending user's default logbook, persons, and records", async () => {
    let user;
    try {
      user = (await createTestUser("backfill-real")).user;
      const person = await personsDb.createPerson(user.id, "RealPerson");
      const record = await recordsDb.addRecord(user.id, person.id, "A gift");

      await runBackfill(db);

      const [membership] = await db
        .select()
        .from(logbookMembers)
        .where(eq(logbookMembers.userId, user.id));
      expect(membership).toBeDefined();

      const [logbook] = await db
        .select()
        .from(logbooks)
        .where(eq(logbooks.id, membership.logbookId));
      expect(logbook.ownerUserId).toBe(user.id);
      expect(logbook.name).toBe(`${user.name}'s Logbook`);

      const [freshPerson] = await db
        .select()
        .from(persons)
        .where(eq(persons.id, person.id));
      expect(freshPerson.logbookId).toBe(logbook.id);

      const [freshRecord] = await db
        .select()
        .from(records)
        .where(eq(records.id, record.id));
      expect(freshRecord.logbookId).toBe(logbook.id);

      // Re-running is a no-op for this user: no duplicate logbook/membership,
      // and the already-backfilled rows are left alone.
      await runBackfill(db);

      const memberships = await db
        .select()
        .from(logbookMembers)
        .where(eq(logbookMembers.userId, user.id));
      expect(memberships).toHaveLength(1);

      const [personAfterSecondRun] = await db
        .select()
        .from(persons)
        .where(
          and(eq(persons.id, person.id), eq(persons.logbookId, logbook.id)),
        );
      expect(personAfterSecondRun).toBeDefined();
    } finally {
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
