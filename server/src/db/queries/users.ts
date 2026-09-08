import { db } from "../db.js";
import {
  NewUser,
  UserResponse,
  users,
  logbooks,
  logbookMembers,
  omitPassword,
} from "../schema.js";
import { eq } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "../../api/errors.js";

/**
 * Creates the user and their personal default logbook (+ membership) as one
 * transaction, so every user always has at least one logbook to work in.
 */
export async function createUser(
  name: string,
  email: string,
  hashedPassword: string,
) {
  const user: NewUser = {
    name,
    email,
    hashedPassword,
  };

  return db.transaction(async (tx) => {
    const [createdUser] = await tx
      .insert(users)
      .values(user)
      .onConflictDoNothing()
      .returning();
    if (!createdUser) {
      throw new BadRequestError("A user with this email already exists");
    }

    const [logbook] = await tx
      .insert(logbooks)
      .values({
        name: `${createdUser.name}'s Logbook`,
        ownerUserId: createdUser.id,
      })
      .returning();
    await tx
      .insert(logbookMembers)
      .values({ logbookId: logbook.id, userId: createdUser.id });

    return omitPassword(createdUser) as UserResponse;
  });
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return omitPassword(user) as UserResponse;
}

export async function updateUser(
  id: string,
  name?: string,
  email?: string,
  hashedPassword?: string,
) {
  const updateData: Partial<NewUser> = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (hashedPassword) updateData.hashedPassword = hashedPassword;

  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();
  if (!updatedUser) {
    throw new NotFoundError("User not found");
  }
  return omitPassword(updatedUser) as UserResponse;
}

/**
 * Deletes the user. Logbooks they solely occupy are deleted along with them
 * (via cascade on logbooks.ownerUserId), taking their persons/records with
 * them. Logbooks they share with other members survive: ownership is
 * reassigned to another member first, so the cascade doesn't fire on those.
 */
export async function deleteUser(id: string) {
  await db.transaction(async (tx) => {
    const ownedLogbooks = await tx
      .select()
      .from(logbooks)
      .where(eq(logbooks.ownerUserId, id));

    for (const logbook of ownedLogbooks) {
      const members = await tx
        .select()
        .from(logbookMembers)
        .where(eq(logbookMembers.logbookId, logbook.id));
      const otherMember = members.find((m) => m.userId !== id);
      if (otherMember) {
        await tx
          .update(logbooks)
          .set({ ownerUserId: otherMember.userId })
          .where(eq(logbooks.id, logbook.id));
      }
    }

    await tx.delete(users).where(eq(users.id, id));
  });
}
