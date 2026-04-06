import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../db/queries/records.js', () => ({
  addRecord: vi.fn(),
  getRecordById: vi.fn(),
  getRecordsByUserId: vi.fn(),
  getRecordsByPersonId: vi.fn(),
  getRecordsByItemText: vi.fn(),
  updateRecord: vi.fn(),
  deleteRecord: vi.fn(),
  deleteRecordsByUserId: vi.fn(),
  deleteRecordsByPersonId: vi.fn(),
}));

vi.mock('../../db/queries/record_tags.js', () => ({
  addTagToRecord: vi.fn(),
  removeTagFromRecord: vi.fn(),
  getTagsByRecordId: vi.fn(),
}));

import * as recordsService from '../records.js';
import * as recordsDb from '../../db/queries/records.js';
import { NotFoundError, UserForbiddenError } from '../../api/errors.js';

beforeEach(() => vi.clearAllMocks());

describe('records service', () => {
  it('updateRecord throws NotFoundError when record not found', async () => {
    (recordsDb.getRecordById as any).mockResolvedValue(null);
    await expect(recordsService.updateRecord('u1', 'r1', 'x')).rejects.toThrow(NotFoundError);
  });

  it('updateRecord throws UserForbiddenError when not owner', async () => {
    (recordsDb.getRecordById as any).mockResolvedValue({ id: 'r1', userId: 'other' });
    await expect(recordsService.updateRecord('u1', 'r1', 'x')).rejects.toThrow(UserForbiddenError);
  });

  it('addTagToRecord validates ownership', async () => {
    (recordsDb.getRecordById as any).mockResolvedValue({ id: 'r1', userId: 'u1' });
    const spy = recordsDb.getRecordById as any;
    await recordsService.addTagToRecord('u1', 'r1', 't1');
    expect(spy).toHaveBeenCalled();
  });
});
