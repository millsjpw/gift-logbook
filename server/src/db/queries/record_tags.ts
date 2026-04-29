import { db } from "../db.js";
import { recordTags, NewRecordTag } from "../schema.js";
import { eq, and } from "drizzle-orm";

export async function addTagToRecord(recordId: string, tagId: string) {
  const recordTag: NewRecordTag = {
    recordId,
    tagId,
  };
  const [createdRecordTag] = await db
    .insert(recordTags)
    .values(recordTag)
    .returning();
  return createdRecordTag;
}

export async function getTagsByRecordId(recordId: string) {
  const recordTagsList = await db
    .select()
    .from(recordTags)
    .where(eq(recordTags.recordId, recordId));
  return recordTagsList;
}

export async function removeTagFromRecord(recordId: string, tagId: string) {
  await db
    .delete(recordTags)
    .where(and(eq(recordTags.recordId, recordId), eq(recordTags.tagId, tagId)));
}

export async function removeAllTagsFromRecord(recordId: string) {
  await db.delete(recordTags).where(eq(recordTags.recordId, recordId));
}
