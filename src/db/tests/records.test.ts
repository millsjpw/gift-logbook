import { describe, it, expect } from 'vitest';
import * as persons from '../queries/persons.js';
import * as records from '../queries/records.js';
import { createTestUser, createTestPerson, cleanupTestUser } from './testUtils.js';

describe('records queries', () => {
  it('add, read, update, delete records', async () => {
    let user;
    let person;
    let record;
    try {
      user = (await createTestUser('rec')).user;
      person = await createTestPerson(user.id, 'RecPerson');
      record = await records.addRecord(user.id, person.id, 'Item Name', 12.34, new Date(), {});
      expect(record).toHaveProperty('id');

      const byUser = await records.getRecordsByUserId(user.id);
      expect(byUser.length).toBeGreaterThan(0);

      const byId = await records.getRecordById(record.id);
      expect(byId).toBeDefined();

      const byPerson = await records.getRecordsByPersonId(user.id, person.id);
      expect(byPerson.length).toBeGreaterThan(0);

      const byText = await records.getRecordsByItemText(user.id, 'Item');
      expect(byText.length).toBeGreaterThan(0);

      const updated = await records.updateRecord(record.id, 'New Item', 20, new Date(), {});
      expect(updated.itemText).toBe('New Item');
    } finally {
      if (record?.id) await records.deleteRecord(record.id);
      if (person?.id) await persons.deletePerson(person.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
