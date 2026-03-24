import * as users from '../queries/users.js';
import * as persons from '../queries/persons.js';

export async function createTestUser(prefix = 'test') {
  const unique = Date.now() + Math.floor(Math.random() * 1000);
  const email = `${prefix}-${unique}@example.com`;
  const user = await users.createUser(`${prefix}User`, email, 'pw');
  return { user, email };
}

export async function createTestPerson(userId: string, name = 'Person') {
  return await persons.createPerson(userId, name, {});
}

export async function cleanupTestUser(userId: string) {
  // reusing existing deletion which cascades related rows
  await users.deleteUser(userId);
}
