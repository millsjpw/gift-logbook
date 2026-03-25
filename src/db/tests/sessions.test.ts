import { describe, it, expect } from 'vitest';
import * as sessions from '../queries/sessions.js';
import { createTestUser, cleanupTestUser } from './testUtils.js';

describe('sessions queries', () => {
  it('create, read, revoke sessions', async () => {
    let user;
    let session;
    const token = `token-${Date.now()}`;
    try {
      user = (await createTestUser('sess')).user;
      session = await sessions.createSession(user.id, token);
      expect(session).toBeDefined();

      const byToken = await sessions.getSessionByToken(token);
      expect(byToken).toBeDefined();

      const userByToken = await sessions.getUserBySessionToken(token);
      expect(userByToken).toBeDefined();

      const revoked = await sessions.revokeSession(token);
      expect(revoked).toBeDefined();

      const revokedAll = await sessions.revokeAllSessionsForUser(user.id);
      expect(revokedAll).toBeDefined();
    } finally {
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
