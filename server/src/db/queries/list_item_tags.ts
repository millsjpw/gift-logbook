import { db } from '../db.js';
import { listItemTags, tags, NewListItemTag, Tag } from '../schema.js';
import { eq, and } from 'drizzle-orm';

export async function addTagToListItem(listItemId: string, tagId: string): Promise<void> {
    const listItemTag: NewListItemTag = { listItemId, tagId };
    await db.insert(listItemTags).values(listItemTag).onConflictDoNothing();
}

export async function getTagsByListItemId(listItemId: string): Promise<Tag[]> {
    const rows = await db
        .select({ tag: tags })
        .from(listItemTags)
        .innerJoin(tags, eq(listItemTags.tagId, tags.id))
        .where(eq(listItemTags.listItemId, listItemId));
    return rows.map(r => r.tag);
}

export async function removeTagFromListItem(listItemId: string, tagId: string): Promise<void> {
    await db.delete(listItemTags).where(
        and(eq(listItemTags.listItemId, listItemId), eq(listItemTags.tagId, tagId))
    );
}

export async function removeAllTagsFromListItem(listItemId: string): Promise<void> {
    await db.delete(listItemTags).where(eq(listItemTags.listItemId, listItemId));
}
