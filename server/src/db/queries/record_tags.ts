import { db } from "../db.js";
import { recordTags, tags, NewRecordTag, Tag } from "../schema.js";
import { eq, and } from "drizzle-orm";

export async function addTagToRecord(
  recordId: string,
  tagId: string,
): Promise<NewRecordTag> {
  const [row] = await db
    .insert(recordTags)
    .values({ recordId, tagId })
    .returning();
  return row;
}

export async function getTagsByRecordId(recordId: string): Promise<Tag[]> {
  const rows = await db
    .select({ tag: tags })
    .from(recordTags)
    .innerJoin(tags, eq(recordTags.tagId, tags.id))
    .where(eq(recordTags.recordId, recordId));
  return rows.map((r) => r.tag);
}

export async function syncTagsForRecord(
  recordId: string,
  tagIds: string[],
): Promise<void> {
  await db.delete(recordTags).where(eq(recordTags.recordId, recordId));
  if (tagIds.length > 0) {
    await db
      .insert(recordTags)
      .values(tagIds.map((tagId) => ({ recordId, tagId })))
      .onConflictDoNothing();
  }
}

export async function removeTagFromRecord(
  recordId: string,
  tagId: string,
): Promise<void> {
  await db
    .delete(recordTags)
    .where(and(eq(recordTags.recordId, recordId), eq(recordTags.tagId, tagId)));
}

export async function removeAllTagsFromRecord(recordId: string): Promise<void> {
  await db.delete(recordTags).where(eq(recordTags.recordId, recordId));
}
