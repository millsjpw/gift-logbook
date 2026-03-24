import { describe, it, expect } from 'vitest';
import * as users from '../queries/users.js';
import * as exchanges from '../queries/exchanges.js';
import { createTestUser, cleanupTestUser } from './testUtils.js';

describe('exchanges queries', () => {
  it('create, read, update, delete exchange', async () => {
    let user;
    let ex;
    try {
      user = (await createTestUser('ex')).user;
      ex = await exchanges.createExchange(user.id, 'Secret Santa');
      expect(ex).toHaveProperty('id');

      const byUser = await exchanges.getExchangesByUserId(user.id);
      expect(byUser.length).toBeGreaterThan(0);

      const byId = await exchanges.getExchangeById(ex.id);
      expect(byId).toBeDefined();

      const byName = await exchanges.getExchangesByName(user.id, 'Santa');
      expect(byName.length).toBeGreaterThan(0);

      const updated = await exchanges.updateExchange(ex.id, 'SS 2026');
      expect(updated.name).toBe('SS 2026');
    } finally {
      if (ex?.id) await exchanges.deleteExchange(ex.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
