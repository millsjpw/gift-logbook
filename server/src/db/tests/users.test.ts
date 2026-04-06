import { describe, it, expect } from 'vitest';
import * as users from '../queries/users.js';
import { createTestUser, cleanupTestUser } from './testUtils.js';
import { NotFoundError } from '../../api/errors.js';

describe('users queries', () => {
  it('create, read, update, delete user', async () => {
    let created;
    let userObj;
    try {
      userObj = await createTestUser('user');
      created = userObj.user;
      expect(created).toHaveProperty('id');

      const byEmail = await users.getUserByEmail(userObj.email);
      expect(byEmail).toBeDefined();
      expect(byEmail?.email).toBe(userObj.email);

      const byId = await users.getUserById(created.id);
      expect(byId).toBeDefined();

      const updated = await users.updateUser(created.id, 'Renamed');
      expect(updated.name).toBe('Renamed');
    } finally {
      if (created?.id) await cleanupTestUser(created.id);
      await expect(users.getUserById(created!.id)).rejects.toThrow(NotFoundError);
    }
  });
});
