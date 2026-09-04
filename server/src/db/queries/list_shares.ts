import { db } from "../db.js";
import { listShares, lists, users, NewListShare } from "../schema.js";
import { and, eq } from "drizzle-orm";

export async function shareList(listId: string, sharedWithUserId: string) {
  const share: NewListShare = { listId, sharedWithUserId };
  const [created] = await db
    .insert(listShares)
    .values(share)
    .onConflictDoNothing()
    .returning();
  return created;
}

export async function unshareList(listId: string, sharedWithUserId: string) {
  await db
    .delete(listShares)
    .where(
      and(
        eq(listShares.listId, listId),
        eq(listShares.sharedWithUserId, sharedWithUserId),
      ),
    );
}

export async function isSharedWith(listId: string, userId: string) {
  const [share] = await db
    .select()
    .from(listShares)
    .where(
      and(
        eq(listShares.listId, listId),
        eq(listShares.sharedWithUserId, userId),
      ),
    )
    .limit(1);
  return !!share;
}

export async function getSharesForList(listId: string) {
  return db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      createdAt: listShares.createdAt,
    })
    .from(listShares)
    .innerJoin(users, eq(listShares.sharedWithUserId, users.id))
    .where(eq(listShares.listId, listId));
}

export async function getListsSharedWithUser(userId: string) {
  return db
    .select({
      id: lists.id,
      name: lists.name,
      createdAt: lists.createdAt,
      updatedAt: lists.updatedAt,
      userId: lists.userId,
      personId: lists.personId,
    })
    .from(listShares)
    .innerJoin(lists, eq(listShares.listId, lists.id))
    .where(eq(listShares.sharedWithUserId, userId));
}
