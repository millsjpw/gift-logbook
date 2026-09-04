import * as recordsDb from "../db/queries/records.js";
import * as recordTagsDb from "../db/queries/record_tags.js";
import * as tagsDb from "../db/queries/tags.js";
import * as logbookMembersDb from "../db/queries/logbook_members.js";
import { GiftRecord, Tag } from "../db/schema.js";
import { NotFoundError } from "../api/errors.js";
import { assertLogbookAccess } from "./authz.js";

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
  logbookId: string,
  personId: string,
  itemText: string,
  amount?: number,
  date?: Date,
  tags?: string[],
): Promise<RecordWithTags> {
  assertLogbookAccess(await logbookMembersDb.isMember(logbookId, userId));
  const record = await recordsDb.addRecord(
    logbookId,
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
  userId: string,
  id: string,
): Promise<RecordWithTags | null> {
  const record = await recordsDb.getRecordById(id);
  if (!record) return null;
  assertLogbookAccess(
    await logbookMembersDb.isMember(record.logbookId!, userId),
  );
  return hydrateRecord(record);
}

export async function getRecordsByLogbook(
  userId: string,
  logbookId: string,
): Promise<RecordWithTags[]> {
  assertLogbookAccess(await logbookMembersDb.isMember(logbookId, userId));
  const records = await recordsDb.getRecordsByLogbookId(logbookId);
  return Promise.all(records.map(hydrateRecord));
}

export async function getRecordsByPersonId(
  userId: string,
  logbookId: string,
  personId: string,
): Promise<RecordWithTags[]> {
  assertLogbookAccess(await logbookMembersDb.isMember(logbookId, userId));
  const records = await recordsDb.getRecordsByPersonId(logbookId, personId);
  return Promise.all(records.map(hydrateRecord));
}

export async function getRecordsByItemText(
  userId: string,
  logbookId: string,
  itemText: string,
): Promise<RecordWithTags[]> {
  assertLogbookAccess(await logbookMembersDb.isMember(logbookId, userId));
  const records = await recordsDb.getRecordsByItemText(logbookId, itemText);
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
  assertLogbookAccess(
    await logbookMembersDb.isMember(record.logbookId!, userId),
  );
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
  assertLogbookAccess(
    await logbookMembersDb.isMember(record.logbookId!, userId),
  );
  await recordsDb.deleteRecord(id);
}

export async function deleteRecordsByLogbook(
  userId: string,
  logbookId: string,
): Promise<void> {
  assertLogbookAccess(await logbookMembersDb.isMember(logbookId, userId));
  await recordsDb.deleteRecordsByLogbookId(logbookId);
}

export async function deleteRecordsByPersonId(
  userId: string,
  logbookId: string,
  personId: string,
): Promise<void> {
  assertLogbookAccess(await logbookMembersDb.isMember(logbookId, userId));
  await recordsDb.deleteRecordsByPersonId(logbookId, personId);
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
  assertLogbookAccess(
    await logbookMembersDb.isMember(record.logbookId!, userId),
  );
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
  assertLogbookAccess(
    await logbookMembersDb.isMember(record.logbookId!, userId),
  );
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
  assertLogbookAccess(
    await logbookMembersDb.isMember(record.logbookId!, userId),
  );
  return await recordTagsDb.getTagsByRecordId(recordId);
}
