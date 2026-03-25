import * as listsDb from '../db/queries/lists.js';
import * as listItemsDb from '../db/queries/list_items.js';
import { List, ListItem } from '../db/schema.js';

type FullList = List & { items: ListItem[] };

export async function createList(userId: string, name: string, personId?: string, items?: { title: string; url: string }[]): Promise<List> {
    const list = await listsDb.createList(userId, name, personId);
    if (items && items.length > 0) {
        await listItemsDb.bulkInsertListItems(userId, list.id, items);
    }
    return list;
}

export async function getListById(id: string): Promise<FullList | null> {
    const list = await listsDb.getListById(id);
    if (!list) {
        return null;
    }
    const items = await listItemsDb.getListItemsByListId(id);
    return { ...list, items } satisfies FullList;
}

export async function getListsByUserId(userId: string): Promise<FullList[]> {
    const lists = await listsDb.getListsByUserId(userId);
    const fullLists: FullList[] = [];
    for (const list of lists) {
        const items = await listItemsDb.getListItemsByListId(list.id);
        fullLists.push({ ...list, items } satisfies FullList);
    }
    return fullLists;
}

export async function getListsByPersonId(userId: string, personId: string): Promise<FullList[]> {
    const lists = await listsDb.getListsByPersonId(userId, personId);
    const fullLists: FullList[] = [];
    for (const list of lists) {
        const items = await listItemsDb.getListItemsByListId(list.id);
        fullLists.push({ ...list, items } satisfies FullList);
    }
    return fullLists;
}

export async function getListsByName(userId: string, name: string): Promise<FullList[]> {
    const lists = await listsDb.getListsByName(userId, name);
    const fullLists: FullList[] = [];
    for (const list of lists) {
        const items = await listItemsDb.getListItemsByListId(list.id);
        fullLists.push({ ...list, items } satisfies FullList);
    }
    return fullLists;
}

export async function updateList(userId: string, list: FullList): Promise<List> {
    if (list.userId !== userId) {
        throw new Error("User does not own this list");
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
    return updatedList;
}

export async function deleteList(userId: string, id: string): Promise<void> {
    const list = await listsDb.getListById(id);
    if (!list) {
        return; // already deleted, treat as success
    }
    if (list.userId !== userId) {
        throw new Error("User does not own this list");
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
        throw new Error("User does not own this list item");
    }
    await listItemsDb.deleteListItem(itemId);
}