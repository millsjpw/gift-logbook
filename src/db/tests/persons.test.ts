import { describe, it, expect } from 'vitest';
import * as users from '../queries/users.js';
import * as persons from '../queries/persons.js';
import { createTestUser, cleanupTestUser } from './testUtils.js';

describe('persons queries', () => {
  it('create, read, update, delete person', async () => {
    let user;
    let created;
    try {
      user = (await createTestUser('person')).user;
      created = await persons.createPerson(user.id, 'Friend', { notes: 'none' });
      expect(created).toHaveProperty('id');

      const list = await persons.getPersonsByUserId(user.id);
      expect(list.some(p => p.id === created.id)).toBeTruthy();

      const byId = await persons.getPersonById(created.id);
      expect(byId).toBeDefined();

      const found = await persons.getPersonsByName(user.id, 'Friend');
      expect(found.length).toBeGreaterThan(0);

      const updated = await persons.updatePerson(created.id, 'Buddy', { notes: 'updated' });
      expect(updated.name).toBe('Buddy');
    } finally {
      if (created?.id) await persons.deletePerson(created.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
