import { db } from '../db.js';
import { listItems, NewListItem } from '../schema.js';
import { eq, and, like } from 'drizzle-orm';

export async function createListItem(userId: string, listId: string, title: string, url: string) {
    const listItem: NewListItem = {
        userId,
        listId,
        title,
        url,
    };
    const [createdListItem] = await db.insert(listItems).values(listItem).returning();
    return createdListItem;
}

export async function getListItemsByListId(listId: string) {
    const items = await db.select().from(listItems).where(eq(listItems.listId, listId));
    return items;
}

export async function getListItemById(id: string) {
    const [item] = await db.select().from(listItems).where(eq(listItems.id, id)).limit(1);
    return item;
}

export async function getListItemsByUserId(userId: string) {
    const items = await db.select().from(listItems).where(eq(listItems.userId, userId));
    return items;
}

export async function getListItemsByTitle(userId: string, title: string) {
    const items = await db.select().from(listItems).where(
        and(
            eq(listItems.userId, userId),
            like(listItems.title, `%${title}%`)
        )
    );
    return items;
}

export async function updateListItem(id: string, title?: string, url?: string) {
    const updateData: Partial<NewListItem> = {};
    if (title) updateData.title = title;
    if (url) updateData.url = url;

    const [updatedListItem] = await db.update(listItems).set(updateData).where(eq(listItems.id, id)).returning();
    return updatedListItem;
}

export async function deleteListItem(id: string) {
    await db.delete(listItems).where(eq(listItems.id, id));
}

export async function deleteListItemsByListId(listId: string) {
    await db.delete(listItems).where(eq(listItems.listId, listId));
}

export async function deleteListItemsByUserId(userId: string) {
    await db.delete(listItems).where(eq(listItems.userId, userId));
}