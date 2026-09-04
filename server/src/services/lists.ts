import * as listsDb from "../db/queries/lists.js";
import * as listItemsDb from "../db/queries/list_items.js";
import * as listItemTagsDb from "../db/queries/list_item_tags.js";
import * as tagsDb from "../db/queries/tags.js";
import * as listSharesDb from "../db/queries/list_shares.js";
import * as userDb from "../db/queries/users.js";
import { List, ListItem, Tag } from "../db/schema.js";
import { NotFoundError, BadRequestError } from "../api/errors.js";
import { assertListAccess } from "./authz.js";

type ListItemInput = {
  id?: string;
  title: string;
  url?: string;
  tags?: string[];
};
type FullListItem = ListItem & { tags: Tag[] };
type FullList = List & { items: FullListItem[] };
type ListShareUser = {
  userId: string;
  name: string;
  email: string;
  createdAt: Date;
};

async function hydrateItems(listId: string): Promise<FullListItem[]> {
  const items = await listItemsDb.getListItemsByListId(listId);
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      tags: await listItemTagsDb.getTagsByListItemId(item.id),
    })),
  );
}

export async function createList(
  userId: string,
  name: string,
  personId?: string,
  items?: ListItemInput[],
): Promise<FullList> {
  const list = await listsDb.createList(userId, name, personId);
  if (items && items.length > 0) {
    const created = await listItemsDb.bulkInsertListItems(
      userId,
      list.id,
      items,
    );
    for (let i = 0; i < created.length; i++) {
      const tagNames = items[i]?.tags;
      if (tagNames?.length) {
        const resolved = await Promise.all(
          tagNames.map((n) => tagsDb.findOrCreateTag(userId, n)),
        );
        await listItemTagsDb.syncTagsForListItem(
          created[i].id,
          resolved.map((t) => t.id),
        );
      }
    }
  }
  return { ...list, items: await hydrateItems(list.id) };
}

export async function getListById(
  userId: string,
  id: string,
): Promise<FullList | null> {
  const list = await listsDb.getListById(id);
  if (!list) {
    return null;
  }
  const shared =
    list.userId !== userId
      ? await listSharesDb.isSharedWith(id, userId)
      : false;
  assertListAccess(userId, list, "read", shared);
  const items = await hydrateItems(id);
  return { ...list, items };
}

export async function getRecentLists(
  userId: string,
  limit = 5,
): Promise<List[]> {
  return listsDb.getRecentListsByUserId(userId, limit);
}

export async function getListsByUserId(userId: string): Promise<FullList[]> {
  const lists = await listsDb.getListsByUserId(userId);
  return Promise.all(
    lists.map(async (list) => ({
      ...list,
      items: await hydrateItems(list.id),
    })),
  );
}

export async function getListsByPersonId(
  userId: string,
  personId: string,
): Promise<FullList[]> {
  const lists = await listsDb.getListsByPersonId(userId, personId);
  return Promise.all(
    lists.map(async (list) => ({
      ...list,
      items: await hydrateItems(list.id),
    })),
  );
}

export async function getListsByName(
  userId: string,
  name: string,
): Promise<FullList[]> {
  const lists = await listsDb.getListsByName(userId, name);
  return Promise.all(
    lists.map(async (list) => ({
      ...list,
      items: await hydrateItems(list.id),
    })),
  );
}

export async function updateList(
  userId: string,
  list: Omit<FullList, "items"> & { items: ListItemInput[] },
): Promise<FullList> {
  assertListAccess(userId, list, "write");
  const { id, name, personId } = list;
  const updatedList = await listsDb.updateList(id, name, personId ?? undefined);
  for (const item of list.items) {
    let savedItem: ListItem | undefined;
    if (item.id) {
      savedItem = await listItemsDb.updateListItem(
        item.id,
        item.title,
        item.url ?? "",
      );
    } else {
      savedItem = await listItemsDb.createListItem(
        userId,
        list.id,
        item.title,
        item.url ?? "",
      );
    }
    if (savedItem && item.tags !== undefined) {
      const resolved = await Promise.all(
        item.tags.map((n) => tagsDb.findOrCreateTag(userId, n)),
      );
      await listItemTagsDb.syncTagsForListItem(
        savedItem.id,
        resolved.map((t) => t.id),
      );
    }
  }
  return { ...updatedList, items: await hydrateItems(updatedList.id) };
}

export async function deleteList(userId: string, id: string): Promise<void> {
  const list = await listsDb.getListById(id);
  if (!list) {
    return; // already deleted, treat as success
  }
  assertListAccess(userId, list, "write");
  await listsDb.deleteList(id);
}

export async function deleteItemFromList(
  userId: string,
  listId: string,
  itemId: string,
): Promise<void> {
  const item = await listItemsDb.getListItemById(itemId);
  if (!item) {
    return; // already deleted, treat as success
  }
  const list = await listsDb.getListById(listId);
  if (!list) {
    return; // list doesn't exist, treat as success
  }
  assertListAccess(userId, list, "write");
  await listItemsDb.deleteListItem(itemId);
}

export async function addTagToListItem(
  userId: string,
  listId: string,
  itemId: string,
  tagId: string,
): Promise<void> {
  const list = await listsDb.getListById(listId);
  if (!list) throw new NotFoundError("List not found");
  assertListAccess(userId, list, "write");
  await listItemTagsDb.addTagToListItem(itemId, tagId);
}

export async function removeTagFromListItem(
  userId: string,
  listId: string,
  itemId: string,
  tagId: string,
): Promise<void> {
  const list = await listsDb.getListById(listId);
  if (!list) throw new NotFoundError("List not found");
  assertListAccess(userId, list, "write");
  await listItemTagsDb.removeTagFromListItem(itemId, tagId);
}

export async function shareList(
  userId: string,
  listId: string,
  targetEmail: string,
): Promise<void> {
  const list = await listsDb.getListById(listId);
  if (!list) throw new NotFoundError("List not found");
  assertListAccess(userId, list, "write");

  const targetUser = await userDb.getUserByEmail(targetEmail);
  if (!targetUser) {
    throw new NotFoundError("No account found with that email");
  }
  if (targetUser.id === userId) {
    throw new BadRequestError("You cannot share a list with yourself");
  }

  await listSharesDb.shareList(listId, targetUser.id);
}

export async function unshareList(
  userId: string,
  listId: string,
  sharedWithUserId: string,
): Promise<void> {
  const list = await listsDb.getListById(listId);
  if (!list) throw new NotFoundError("List not found");
  assertListAccess(userId, list, "write");
  await listSharesDb.unshareList(listId, sharedWithUserId);
}

export async function getSharesForList(
  userId: string,
  listId: string,
): Promise<ListShareUser[]> {
  const list = await listsDb.getListById(listId);
  if (!list) throw new NotFoundError("List not found");
  assertListAccess(userId, list, "write");
  return listSharesDb.getSharesForList(listId);
}

export async function getListsSharedWithMe(
  userId: string,
): Promise<FullList[]> {
  const shared = await listSharesDb.getListsSharedWithUser(userId);
  return Promise.all(
    shared.map(async (list) => ({
      ...list,
      items: await hydrateItems(list.id),
    })),
  );
}
