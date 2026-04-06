import { describe, it, expect } from 'vitest';
import * as exchanges from '../queries/exchanges.js';
import * as persons from '../queries/persons.js';
import * as assignments from '../queries/exchange_assignments.js';
import { createTestUser, createTestPerson, cleanupTestUser } from './testUtils.js';

describe('exchange_assignments queries', () => {
  it('add and remove assignments', async () => {
    let user;
    let ex;
    let p1;
    let p2;
    let assign;
    try {
      user = (await createTestUser('ea')).user;
      ex = await exchanges.createExchange(user.id, 'Assignment Test');
      p1 = await createTestPerson(user.id, 'Giver');
      p2 = await createTestPerson(user.id, 'Receiver');
      assign = await assignments.addAssignmentToExchange(ex.id, p1.id, p2.id);
      expect(assign).toBeDefined();

      const list = await assignments.getAssignmentsByExchangeId(ex.id);
      expect(list.length).toBeGreaterThan(0);

      const forGiver = await assignments.getAssignmentForGiverInExchange(ex.id, p1.id);
      expect(forGiver).toBeDefined();

      await assignments.removeAssignmentFromExchange(ex.id, p1.id);
      const after = await assignments.getAssignmentsByExchangeId(ex.id);
      expect(after.length).toBe(0);
    } finally {
      if (p1?.id) await persons.deletePerson(p1.id);
      if (p2?.id) await persons.deletePerson(p2.id);
      if (ex?.id) await exchanges.deleteExchange(ex.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
