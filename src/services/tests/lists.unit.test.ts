import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../db/queries/lists.js', () => ({
  createList: vi.fn(),
  getListById: vi.fn(),
  getListsByUserId: vi.fn(),
  getListsByPersonId: vi.fn(),
  getListsByName: vi.fn(),
  updateList: vi.fn(),
  deleteList: vi.fn(),
}));

vi.mock('../../db/queries/list_items.js', () => ({
  getListItemsByListId: vi.fn(),
  updateListItem: vi.fn(),
  createListItem: vi.fn(),
}));

import * as listsService from '../lists.js';
import * as listsDb from '../../db/queries/lists.js';
import * as itemsDb from '../../db/queries/list_items.js';

beforeEach(() => vi.clearAllMocks());

describe('lists service', () => {
  it('getListById returns combined list and items', async () => {
    (listsDb.getListById as any).mockResolvedValue({ id: 'l1', userId: 'u1', name: 'L' });
    (itemsDb.getListItemsByListId as any).mockResolvedValue([{ id: 'i1', listId: 'l1' }]);
    const res = await listsService.getListById('l1');
    expect(res).toBeDefined();
    expect((res as any).items.length).toBe(1);
  });

  it('updateList enforces ownership', async () => {
    const list = { id: 'l1', userId: 'u1', name: 'L', items: [] } as any;
    await expect(listsService.updateList('other', list)).rejects.toThrow();
  });
});
