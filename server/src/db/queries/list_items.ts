import { db } from "../db.js";
import { listItems, lists, NewListItem } from "../schema.js";
import { eq, and, like } from "drizzle-orm";
import { BadRequestError } from "../../api/errors.js";

async function touchList(listId: string) {
  await db
    .update(lists)
    .set({ updatedAt: new Date() })
    .where(eq(lists.id, listId));
}

export async function createListItem(
  userId: string,
  listId: string,
  title: string,
  url: string,
) {
  const listItem: NewListItem = {
    listId,
    title,
    url,
  };
  try {
    const [createdListItem] = await db
      .insert(listItems)
      .values(listItem)
      .returning();
    await touchList(listId);
    return createdListItem;
  } catch (err: any) {
    if (err.cause?.code === "23505") {
      throw new BadRequestError(
        "This list already has an item with that title",
      );
    }
    throw err;
  }
}

export async function bulkInsertListItems(
  userId: string,
  listId: string,
  items: { title: string; url?: string }[],
) {
  const newItems: NewListItem[] = items.map((item) => ({
    listId,
    title: item.title,
    url: item.url,
  }));

  try {
    const createdItems = await db
      .insert(listItems)
      .values(newItems)
      .returning();
    await touchList(listId);
    return createdItems;
  } catch (err: any) {
    if (err.cause?.code === "23505") {
      throw new BadRequestError(
        "One or more items have duplicate titles in this list",
      );
    }
    throw err;
  }
}

export async function getListItemsByListId(listId: string) {
  const items = await db
    .select()
    .from(listItems)
    .where(eq(listItems.listId, listId));
  return items;
}

export async function getListItemById(id: string) {
  const [item] = await db
    .select()
    .from(listItems)
    .where(eq(listItems.id, id))
    .limit(1);
  return item;
}

export async function getListItemsByTitle(listId: string, title: string) {
  const items = await db
    .select()
    .from(listItems)
    .where(
      and(eq(listItems.listId, listId), like(listItems.title, `%${title}%`)),
    );
  return items;
}

export async function updateListItem(id: string, title?: string, url?: string) {
  const updateData: Partial<NewListItem> = {};
  if (title) updateData.title = title;
  if (url) updateData.url = url;

  const [updatedListItem] = await db
    .update(listItems)
    .set(updateData)
    .where(eq(listItems.id, id))
    .returning();
  if (updatedListItem) {
    await touchList(updatedListItem.listId);
  }
  return updatedListItem;
}

export async function deleteListItem(id: string) {
  const [deleted] = await db
    .delete(listItems)
    .where(eq(listItems.id, id))
    .returning();
  if (deleted) {
    await touchList(deleted.listId);
  }
}

export async function deleteListItemsByListId(listId: string) {
  await db.delete(listItems).where(eq(listItems.listId, listId));
  await touchList(listId);
}
