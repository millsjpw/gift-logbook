import * as recordsDb from "../db/queries/records.js";
import * as recordTagsDb from "../db/queries/record_tags.js";
import * as tagsDb from "../db/queries/tags.js";
import { GiftRecord, Tag } from "../db/schema.js";
import { NotFoundError, UserForbiddenError } from "../api/errors.js";

export type RecordWithTags = GiftRecord & { tags: Tag[] };

async function hydrateRecord(record: GiftRecord): Promise<RecordWithTags> {
  const tags = await recordTagsDb.getTagsByRecordId(record.id);
  return { ...record, tags };
}

async function resolveAndSyncRecordTags(
  recordId: string,
  userId: string,
  tagNames: string[],
): Promise<Tag[]> {
  const resolvedTags = await Promise.all(
    tagNames.map((name) => tagsDb.findOrCreateTag(userId, name)),
  );
  await recordTagsDb.syncTagsForRecord(
    recordId,
    resolvedTags.map((t) => t.id),
  );
  return resolvedTags;
}

export async function addRecord(
  userId: string,
  personId: string,
  itemText: string,
  amount?: number,
  date?: Date,
  tags?: string[],
): Promise<RecordWithTags> {
  const record = await recordsDb.addRecord(
    userId,
    personId,
    itemText,
    amount,
    date,
  );
  const resolvedTags = tags?.length
    ? await resolveAndSyncRecordTags(record.id, userId, tags)
    : [];
  return { ...record, tags: resolvedTags };
}

export async function getRecordById(
  id: string,
): Promise<RecordWithTags | null> {
  const record = await recordsDb.getRecordById(id);
  if (!record) return null;
  return hydrateRecord(record);
}

export async function getRecordsByUserId(
  userId: string,
): Promise<RecordWithTags[]> {
  const records = await recordsDb.getRecordsByUserId(userId);
  return Promise.all(records.map(hydrateRecord));
}

export async function getRecordsByPersonId(
  userId: string,
  personId: string,
): Promise<RecordWithTags[]> {
  const records = await recordsDb.getRecordsByPersonId(userId, personId);
  return Promise.all(records.map(hydrateRecord));
}

export async function getRecordsByItemText(
  userId: string,
  itemText: string,
): Promise<RecordWithTags[]> {
  const records = await recordsDb.getRecordsByItemText(userId, itemText);
  return Promise.all(records.map(hydrateRecord));
}

export async function updateRecord(
  userId: string,
  id: string,
  itemText?: string,
  amount?: number | null,
  date?: Date,
  tags?: string[],
): Promise<RecordWithTags> {
  const record = await recordsDb.getRecordById(id);
  if (!record) {
    throw new NotFoundError("Record not found");
  }
  if (record.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to update this record",
    );
  }
  const updated = await recordsDb.updateRecord(id, itemText, amount, date);
  const resolvedTags =
    tags !== undefined
      ? await resolveAndSyncRecordTags(updated.id, userId, tags)
      : await recordTagsDb.getTagsByRecordId(updated.id);
  return { ...updated, tags: resolvedTags };
}

export async function deleteRecord(userId: string, id: string): Promise<void> {
  const record = await recordsDb.getRecordById(id);
  if (!record) {
    return; // record already doesn't exist, so consider it deleted
  }
  if (record.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to delete this record",
    );
  }
  await recordsDb.deleteRecord(id);
}

export async function deleteRecordsByUserId(userId: string): Promise<void> {
  await recordsDb.deleteRecordsByUserId(userId);
}

export async function deleteRecordsByPersonId(
  userId: string,
  personId: string,
): Promise<void> {
  const records = await recordsDb.getRecordsByPersonId(userId, personId);
  for (const record of records) {
    if (record.userId !== userId) {
      throw new UserForbiddenError(
        "You do not have permission to delete one or more of these records",
      );
    }
  }
  await recordsDb.deleteRecordsByPersonId(userId, personId);
}

export async function addTagToRecord(
  userId: string,
  recordId: string,
  tag: string,
) {
  const record = await recordsDb.getRecordById(recordId);
  if (!record) {
    throw new NotFoundError("Record not found");
  }
  if (record.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to modify this record",
    );
  }
  return await recordTagsDb.addTagToRecord(recordId, tag);
}

export async function removeTagFromRecord(
  userId: string,
  recordId: string,
  tagId: string,
): Promise<void> {
  const record = await recordsDb.getRecordById(recordId);
  if (!record) {
    throw new NotFoundError("Record not found");
  }
  if (record.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to modify this record",
    );
  }
  await recordTagsDb.removeTagFromRecord(recordId, tagId);
}

export async function getTagsForRecord(
  userId: string,
  recordId: string,
): Promise<Tag[]> {
  const record = await recordsDb.getRecordById(recordId);
  if (!record) {
    throw new NotFoundError("Record not found");
  }
  if (record.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to view this record",
    );
  }
  return await recordTagsDb.getTagsByRecordId(recordId);
}
