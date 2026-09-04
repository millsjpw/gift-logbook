import { db } from "../db.js";
import { logbookMembers, users, NewLogbookMember } from "../schema.js";
import { and, eq } from "drizzle-orm";

export async function addMember(logbookId: string, userId: string) {
  const member: NewLogbookMember = { logbookId, userId };
  const [created] = await db
    .insert(logbookMembers)
    .values(member)
    .onConflictDoNothing()
    .returning();
  return created;
}

export async function removeMember(logbookId: string, userId: string) {
  await db
    .delete(logbookMembers)
    .where(
      and(
        eq(logbookMembers.logbookId, logbookId),
        eq(logbookMembers.userId, userId),
      ),
    );
}

export async function isMember(logbookId: string, userId: string) {
  const [member] = await db
    .select()
    .from(logbookMembers)
    .where(
      and(
        eq(logbookMembers.logbookId, logbookId),
        eq(logbookMembers.userId, userId),
      ),
    )
    .limit(1);
  return !!member;
}

export async function getMembers(logbookId: string) {
  return db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      createdAt: logbookMembers.createdAt,
    })
    .from(logbookMembers)
    .innerJoin(users, eq(logbookMembers.userId, users.id))
    .where(eq(logbookMembers.logbookId, logbookId));
}

export async function getLogbookIdsForUser(userId: string) {
  const rows = await db
    .select({ logbookId: logbookMembers.logbookId })
    .from(logbookMembers)
    .where(eq(logbookMembers.userId, userId));
  return rows.map((r) => r.logbookId);
}
