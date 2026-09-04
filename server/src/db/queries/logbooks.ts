import { db } from "../db.js";
import { logbooks, logbookMembers, NewLogbook } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createLogbook(ownerUserId: string, name: string) {
  const logbook: NewLogbook = { ownerUserId, name };
  const [created] = await db.insert(logbooks).values(logbook).returning();
  return created;
}

export async function getLogbookById(id: string) {
  const [logbook] = await db
    .select()
    .from(logbooks)
    .where(eq(logbooks.id, id))
    .limit(1);
  return logbook;
}

export async function getLogbooksForUser(userId: string) {
  return db
    .select({
      id: logbooks.id,
      name: logbooks.name,
      ownerUserId: logbooks.ownerUserId,
      createdAt: logbooks.createdAt,
      updatedAt: logbooks.updatedAt,
    })
    .from(logbookMembers)
    .innerJoin(logbooks, eq(logbookMembers.logbookId, logbooks.id))
    .where(eq(logbookMembers.userId, userId));
}

export async function updateLogbook(id: string, name: string) {
  const [updated] = await db
    .update(logbooks)
    .set({ name })
    .where(eq(logbooks.id, id))
    .returning();
  return updated;
}
