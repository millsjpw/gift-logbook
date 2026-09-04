// One-off historical migration tool: fixes up users who predate the
// logbook_id column existing at all. Once every user has a default logbook
// (guaranteed once services/users.ts:createUser's transactional logbook
// creation is live, and persons.logbook_id/records.logbook_id are NOT NULL),
// findPendingUsers should always return an empty list — there's no code path
// left that can produce a "pending" user going forward.
//
// This is also why there's no integration test for this file: exercising it
// requires a database with a nullable logbook_id (the window between
// migration A and migration B), and once migration B's NOT NULL constraint
// exists in the migrations folder, drizzle-kit migrate always applies it
// too, so that legacy row shape can no longer be constructed in any fresh
// test database. Correctness was verified with a real integration test
// while only migration A existed (see git history), and again against real
// (dev) data via --dry-run and a real run before migration B was added.
import { and, eq, isNull, sql } from "drizzle-orm";
import { createDb } from "../db/db.js";
import { dbConfig } from "../config/db.js";
import {
  users,
  logbooks,
  logbookMembers,
  persons,
  records,
} from "../db/schema.js";

type Db = ReturnType<typeof createDb>;

export type BackfillResult = {
  usersBackfilled: number;
  personsBackfilled: number;
  recordsBackfilled: number;
};

async function findPendingUsers(db: Db) {
  const allUsers = await db.select().from(users);
  const existingMembers = await db
    .select({ userId: logbookMembers.userId })
    .from(logbookMembers);
  const alreadyMember = new Set(existingMembers.map((m) => m.userId));
  return allUsers.filter((u) => !alreadyMember.has(u.id));
}

/** Read-only: reports what a real run would do, without writing anything. */
export async function dryRunBackfill(db: Db): Promise<BackfillResult> {
  const pending = await findPendingUsers(db);
  let personsBackfilled = 0;
  let recordsBackfilled = 0;

  for (const user of pending) {
    const [personCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(persons)
      .where(and(eq(persons.userId, user.id), isNull(persons.logbookId)));
    const [recordCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(records)
      .where(and(eq(records.userId, user.id), isNull(records.logbookId)));
    personsBackfilled += personCount.count;
    recordsBackfilled += recordCount.count;
  }

  return {
    usersBackfilled: pending.length,
    personsBackfilled,
    recordsBackfilled,
  };
}

/**
 * Idempotent: a user with an existing logbook_members row is skipped entirely, so
 * re-running after a successful run (or a partial run rolled back by the enclosing
 * transaction) is safe. Runs as a single transaction across every pending user —
 * for a household-scale user count this is cheap, and it means a failure midway
 * leaves the database exactly as it was, with nothing to reconcile by hand.
 */
export async function runBackfill(db: Db): Promise<BackfillResult> {
  const pending = await findPendingUsers(db);
  let personsBackfilled = 0;
  let recordsBackfilled = 0;

  await db.transaction(async (tx) => {
    for (const user of pending) {
      const [logbook] = await tx
        .insert(logbooks)
        .values({ name: `${user.name}'s Logbook`, ownerUserId: user.id })
        .returning();
      await tx
        .insert(logbookMembers)
        .values({ logbookId: logbook.id, userId: user.id });

      const updatedPersons = await tx
        .update(persons)
        .set({ logbookId: logbook.id })
        .where(and(eq(persons.userId, user.id), isNull(persons.logbookId)))
        .returning({ id: persons.id });
      const updatedRecords = await tx
        .update(records)
        .set({ logbookId: logbook.id })
        .where(and(eq(records.userId, user.id), isNull(records.logbookId)))
        .returning({ id: records.id });

      personsBackfilled += updatedPersons.length;
      recordsBackfilled += updatedRecords.length;
    }
  });

  return {
    usersBackfilled: pending.length,
    personsBackfilled,
    recordsBackfilled,
  };
}

async function countRemaining(db: Db) {
  const [remainingPersons] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(persons)
    .where(isNull(persons.logbookId));
  const [remainingRecords] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(records)
    .where(isNull(records.logbookId));
  return {
    persons: remainingPersons.count,
    records: remainingRecords.count,
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const db = createDb(dbConfig.url);

  if (dryRun) {
    const result = await dryRunBackfill(db);
    console.log(
      `[dry-run] ${result.usersBackfilled} user(s) would get a new default logbook`,
    );
    console.log(
      `[dry-run] ${result.personsBackfilled} person row(s) would be backfilled`,
    );
    console.log(
      `[dry-run] ${result.recordsBackfilled} record row(s) would be backfilled`,
    );
    return;
  }

  const result = await runBackfill(db);
  console.log(
    `Backfilled ${result.usersBackfilled} user(s): ${result.personsBackfilled} person row(s), ${result.recordsBackfilled} record row(s)`,
  );

  const remaining = await countRemaining(db);
  console.log(
    `Remaining without a logbook — persons: ${remaining.persons}, records: ${remaining.records}`,
  );
  if (remaining.persons > 0 || remaining.records > 0) {
    console.error(
      "Some rows still have no logbook_id. Do not proceed to migration B until this is 0 for both.",
    );
    process.exitCode = 1;
  }
}

// Only run when invoked directly (node dist/scripts/backfill-logbooks.js), not
// when the exported functions are imported by tests.
const isCliInvocation = process.argv[1]?.includes("backfill-logbooks");
if (isCliInvocation) {
  main()
    .then(() => process.exit(process.exitCode ?? 0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
