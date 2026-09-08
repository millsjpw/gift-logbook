import * as users from "../queries/users.js";
import * as persons from "../queries/persons.js";
import * as logbookMembers from "../queries/logbook_members.js";

export async function createTestUser(prefix = "test") {
  const unique = Date.now() + Math.floor(Math.random() * 1000);
  const email = `${prefix}-${unique}@example.com`;
  const user = await users.createUser(`${prefix}User`, email, "pw");
  // createUser transactionally creates a default logbook + membership.
  const [logbookId] = await logbookMembers.getLogbookIdsForUser(user.id);
  return { user, email, logbookId };
}

export async function createTestPerson(
  logbookId: string,
  userId: string,
  name = "Person",
) {
  return await persons.createPerson(logbookId, userId, name);
}

export async function cleanupTestUser(userId: string) {
  // reusing existing deletion which cascades related rows
  await users.deleteUser(userId);
}
