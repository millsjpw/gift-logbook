import { describe, it, expect } from 'vitest';
import * as lists from '../queries/lists.js';
import * as listItems from '../queries/list_items.js';
import { createTestUser, cleanupTestUser } from './testUtils.js';
import { ListItem } from '../schema.js';

describe('list_items queries', () => {
  it('create, read, update, delete list items', async () => {
    let user;
    let list;
    let item: ListItem | undefined;
    try {
      user = (await createTestUser('li')).user;
      list = await lists.createList(user.id, 'List For Items');
      item = await listItems.createListItem(user.id, list.id, 'Cool Gift', 'http://example.com');
      expect(item).toHaveProperty('id');

      const byList = await listItems.getListItemsByListId(list.id);
      expect(item).toBeDefined();
      expect(byList.some(i => i.id === item!.id)).toBeTruthy();

      const byId = await listItems.getListItemById(item!.id);
      expect(byId).toBeDefined();

      const byUser = await listItems.getListItemsByUserId(user.id);
      expect(byUser.length).toBeGreaterThan(0);

      const byTitle = await listItems.getListItemsByTitle(user.id, 'Cool');
      expect(byTitle.length).toBeGreaterThan(0);

      const updated = await listItems.updateListItem(item!.id, 'Cooler Gift', undefined);
      expect(updated.title).toBe('Cooler Gift');
    } finally {
      if (item?.id) await listItems.deleteListItem(item.id);
      if (list?.id) await lists.deleteList(list.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
