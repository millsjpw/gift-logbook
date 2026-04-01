import * as recordsDb from '../db/queries/records.js';
import * as recordTagsDb from '../db/queries/record_tags.js';
import { GiftRecord, RecordTag } from '../db/schema.js';
import { NotFoundError, UserForbiddenError } from '../api/errors.js';

export async function addRecord(userId: string, personId: string, itemText: string, amount?: number, date?: Date, meta?: any): Promise<GiftRecord> {
    return await recordsDb.addRecord(userId, personId, itemText, amount, date, meta);
}

export async function getRecordById(id: string) {
    const record = await recordsDb.getRecordById(id);
    if (!record) {
        return null;
    }
    const tags = await recordTagsDb.getTagsByRecordId(id);
    return { ...record, tags: tags.map(t => t.tagId) };
}

export async function getRecordsByUserId(userId: string): Promise<GiftRecord[]> {
    const records = await recordsDb.getRecordsByUserId(userId);
    if (!records) {
        return [];
    }
    const recordsWithTags = [];
    for (const record of records) {
        const tags = await recordTagsDb.getTagsByRecordId(record.id);
        recordsWithTags.push({ ...record, tags: tags.map(t => t.tagId) });
    }
    return recordsWithTags;
}

export async function getRecordsByPersonId(userId: string, personId: string): Promise<GiftRecord[]> {
    const records = await recordsDb.getRecordsByPersonId(userId, personId);
    if (!records) {
        return [];
    }
    const recordsWithTags = [];
    for (const record of records) {
        const tags = await recordTagsDb.getTagsByRecordId(record.id);
        recordsWithTags.push({ ...record, tags: tags.map(t => t.tagId) });
    }
    return recordsWithTags;
}

export async function getRecordsByItemText(userId: string, itemText: string): Promise<GiftRecord[]> {
    const records = await recordsDb.getRecordsByItemText(userId, itemText);
    if (!records) {
        return [];
    }
    const recordsWithTags = [];
    for (const record of records) {
        const tags = await recordTagsDb.getTagsByRecordId(record.id);
        recordsWithTags.push({ ...record, tags: tags.map(t => t.tagId) });
    }
    return recordsWithTags;
}

export async function updateRecord(userId: string, id: string, itemText?: string, amount?: number, date?: Date, meta?: any): Promise<GiftRecord> {
    const record = await recordsDb.getRecordById(id);
    if (!record) {
        throw new NotFoundError("Record not found");
    }
    if (record.userId !== userId) {
        throw new UserForbiddenError("You do not have permission to update this record");
    }
    return await recordsDb.updateRecord(id, itemText, amount, date, meta);
}

export async function deleteRecord(userId: string, id: string): Promise<void> {
    const record = await recordsDb.getRecordById(id);
    if (!record) {
        return; // record already doesn't exist, so consider it deleted
    }
    if (record.userId !== userId) {
        throw new UserForbiddenError("You do not have permission to delete this record");
    }
    await recordsDb.deleteRecord(id);
}

export async function deleteRecordsByUserId(userId: string): Promise<void> {
    await recordsDb.deleteRecordsByUserId(userId);
}

export async function deleteRecordsByPersonId(userId: string, personId: string): Promise<void> {
    const records = await recordsDb.getRecordsByPersonId(userId, personId);
    for (const record of records) {
        if (record.userId !== userId) {
            throw new UserForbiddenError("You do not have permission to delete one or more of these records");
        }
    }
    await recordsDb.deleteRecordsByPersonId(userId, personId);
}

export async function addTagToRecord(userId: string, recordId: string, tag: string): Promise<RecordTag> {
    const record = await recordsDb.getRecordById(recordId);
    if (!record) {
        throw new NotFoundError("Record not found");
    }
    if (record.userId !== userId) {
        throw new UserForbiddenError("You do not have permission to modify this record");
    }
    return await recordTagsDb.addTagToRecord(recordId, tag);
}

export async function removeTagFromRecord(userId: string, recordId: string, tagId: string): Promise<void> {
    const record = await recordsDb.getRecordById(recordId);
    if (!record) {
        throw new NotFoundError("Record not found");
    }
    if (record.userId !== userId) {
        throw new UserForbiddenError("You do not have permission to modify this record");
    }
    await recordTagsDb.removeTagFromRecord(recordId, tagId);
}

export async function getTagsForRecord(userId: string, recordId: string): Promise<RecordTag[]> {
    const record = await recordsDb.getRecordById(recordId);
    if (!record) {
        throw new NotFoundError("Record not found");
    }
    if (record.userId !== userId) {
        throw new UserForbiddenError("You do not have permission to view this record");
    }
    return await recordTagsDb.getTagsByRecordId(recordId);
}