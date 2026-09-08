import * as logbooksDb from "../db/queries/logbooks.js";
import * as logbookMembersDb from "../db/queries/logbook_members.js";
import * as userDb from "../db/queries/users.js";
import { Logbook } from "../db/schema.js";
import { NotFoundError, BadRequestError } from "../api/errors.js";
import { assertLogbookAccess } from "./authz.js";

export async function createLogbook(
  userId: string,
  name: string,
): Promise<Logbook> {
  const logbook = await logbooksDb.createLogbook(userId, name);
  await logbookMembersDb.addMember(logbook.id, userId);
  return logbook;
}

export async function getLogbooksForUser(userId: string): Promise<Logbook[]> {
  return logbooksDb.getLogbooksForUser(userId);
}

export async function getLogbookById(
  userId: string,
  id: string,
): Promise<Logbook | null> {
  const logbook = await logbooksDb.getLogbookById(id);
  if (!logbook) return null;
  assertLogbookAccess(await logbookMembersDb.isMember(id, userId));
  return logbook;
}

export async function updateLogbook(
  userId: string,
  id: string,
  name: string,
): Promise<Logbook> {
  const logbook = await logbooksDb.getLogbookById(id);
  if (!logbook) throw new NotFoundError("Logbook not found");
  assertLogbookAccess(await logbookMembersDb.isMember(id, userId));
  return logbooksDb.updateLogbook(id, name);
}

export async function addMemberByEmail(
  userId: string,
  logbookId: string,
  targetEmail: string,
): Promise<void> {
  const logbook = await logbooksDb.getLogbookById(logbookId);
  if (!logbook) throw new NotFoundError("Logbook not found");
  assertLogbookAccess(await logbookMembersDb.isMember(logbookId, userId));

  const targetUser = await userDb.getUserByEmail(targetEmail);
  if (!targetUser) {
    throw new NotFoundError("No account found with that email");
  }
  if (await logbookMembersDb.isMember(logbookId, targetUser.id)) {
    throw new BadRequestError("That person is already a member");
  }

  await logbookMembersDb.addMember(logbookId, targetUser.id);
}

export async function getMembers(userId: string, logbookId: string) {
  const logbook = await logbooksDb.getLogbookById(logbookId);
  if (!logbook) throw new NotFoundError("Logbook not found");
  assertLogbookAccess(await logbookMembersDb.isMember(logbookId, userId));
  return logbookMembersDb.getMembers(logbookId);
}

/**
 * The owner can remove any member; any member can remove themselves
 * ("leave"). A non-owner member can't unilaterally remove someone else —
 * simple to relax later, but not needed for a 2-3 person household app.
 */
export async function removeMember(
  userId: string,
  logbookId: string,
  targetUserId: string,
): Promise<void> {
  const logbook = await logbooksDb.getLogbookById(logbookId);
  if (!logbook) throw new NotFoundError("Logbook not found");
  assertLogbookAccess(await logbookMembersDb.isMember(logbookId, userId));

  const isSelfRemoval = targetUserId === userId;
  const isOwner = logbook.ownerUserId === userId;
  if (!isSelfRemoval && !isOwner) {
    throw new BadRequestError(
      "Only the logbook owner can remove other members",
    );
  }
  if (isSelfRemoval && isOwner) {
    throw new BadRequestError(
      "The owner can't leave their own logbook — remove other members or delete your account instead",
    );
  }

  await logbookMembersDb.removeMember(logbookId, targetUserId);
}
