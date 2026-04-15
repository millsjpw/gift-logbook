import * as listsDb from '../db/queries/lists.js';
import * as listItemsDb from '../db/queries/list_items.js';
import * as listItemTagsDb from '../db/queries/list_item_tags.js';
import { List, ListItem, Tag } from '../db/schema.js';
import { UserForbiddenError, NotFoundError } from '../api/errors.js';

type FullListItem = ListItem & { tags: Tag[] };
type FullList = List & { items: FullListItem[] };

async function hydrateItems(listId: string): Promise<FullListItem[]> {
    const items = await listItemsDb.getListItemsByListId(listId);
    return Promise.all(items.map(async item => ({
        ...item,
        tags: await listItemTagsDb.getTagsByListItemId(item.id),
    })));
}

export async function createList(userId: string, name: string, personId?: string, items?: { title: string; url: string }[]): Promise<FullList> {
    const list = await listsDb.createList(userId, name, personId);
    if (items && items.length > 0) {
        await listItemsDb.bulkInsertListItems(userId, list.id, items);
    }
    return { ...list, items: await hydrateItems(list.id) };
}

export async function getListById(id: string): Promise<FullList | null> {
    const list = await listsDb.getListById(id);
    if (!list) {
        return null;
    }
    const items = await hydrateItems(id);
    return { ...list, items };
}

export async function getListsByUserId(userId: string): Promise<FullList[]> {
    const lists = await listsDb.getListsByUserId(userId);
    return Promise.all(lists.map(async list => ({
        ...list,
        items: await hydrateItems(list.id),
    })));
}

export async function getListsByPersonId(userId: string, personId: string): Promise<FullList[]> {
    const lists = await listsDb.getListsByPersonId(userId, personId);
    return Promise.all(lists.map(async list => ({
        ...list,
        items: await hydrateItems(list.id),
    })));
}

export async function getListsByName(userId: string, name: string): Promise<FullList[]> {
    const lists = await listsDb.getListsByName(userId, name);
    return Promise.all(lists.map(async list => ({
        ...list,
        items: await hydrateItems(list.id),
    })));
}

export async function updateList(userId: string, list: FullList): Promise<FullList> {
    if (list.userId !== userId) {
        throw new UserForbiddenError("You do not have permission to update this list");
    }
    const { id, name, personId } = list;
    const updatedList = await listsDb.updateList(id, name, personId ?? undefined);
    for (const item of list.items) {
        if (item.id) {
            await listItemsDb.updateListItem(item.id, item.title, item.url ?? '');
        } else {
            await listItemsDb.createListItem(userId, list.id, item.title, item.url ?? '');
        }
    }
    return { ...updatedList, items: await hydrateItems(updatedList.id) };
}

export async function deleteList(userId: string, id: string): Promise<void> {
    const list = await listsDb.getListById(id);
    if (!list) {
        return; // already deleted, treat as success
    }
    if (list.userId !== userId) {
        throw new UserForbiddenError("You do not have permission to delete this list");
    }
    await listsDb.deleteList(id);
}

export async function deleteItemFromList(userId: string, listId: string, itemId: string): Promise<void> {
    const item = await listItemsDb.getListItemById(itemId);
    if (!item) {
        return; // already deleted, treat as success
    }
    const list = await listsDb.getListById(listId);
    if (!list) {
        return; // list doesn't exist, treat as success
    }
    if (list.userId !== userId) {
        throw new UserForbiddenError("You do not have permission to delete items from this list");
    }
    await listItemsDb.deleteListItem(itemId);
}

export async function addTagToListItem(userId: string, listId: string, itemId: string, tagId: string): Promise<void> {
    const list = await listsDb.getListById(listId);
    if (!list) throw new NotFoundError("List not found");
    if (list.userId !== userId) throw new UserForbiddenError("You do not have permission to modify this list");
    await listItemTagsDb.addTagToListItem(itemId, tagId);
}

export async function removeTagFromListItem(userId: string, listId: string, itemId: string, tagId: string): Promise<void> {
    const list = await listsDb.getListById(listId);
    if (!list) throw new NotFoundError("List not found");
    if (list.userId !== userId) throw new UserForbiddenError("You do not have permission to modify this list");
    await listItemTagsDb.removeTagFromListItem(itemId, tagId);
}