import * as recordsDb from '../db/queries/records.js';
import * as recordTagsDb from '../db/queries/record_tags.js';
import { GiftRecord, RecordTag } from '../db/schema.js';

export async function addRecord(userId: string, personId: string, itemText: string, amount?: number, date?: Date, meta?: any): Promise<GiftRecord> {
    return await recordsDb.addRecord(userId, personId, itemText, amount, date, meta);
}

export async function getRecordById(id: string): Promise<GiftRecord | null> {
    return await recordsDb.getRecordById(id);
}

export async function getRecordsByUserId(userId: string): Promise<GiftRecord[]> {
    return await recordsDb.getRecordsByUserId(userId);
}

export async function getRecordsByPersonId(userId: string, personId: string): Promise<GiftRecord[]> {
    return await recordsDb.getRecordsByPersonId(userId, personId);
}

export async function getRecordsByItemText(userId: string, itemText: string): Promise<GiftRecord[]> {
    return await recordsDb.getRecordsByItemText(userId, itemText);
}

export async function updateRecord(userId: string, id: string, itemText?: string, amount?: number, date?: Date, meta?: any): Promise<GiftRecord> {
    const record = await recordsDb.getRecordById(id);
    if (!record) {
        throw new Error("Record not found");
    }
    if (record.userId !== userId) {
        throw new Error("User does not own this record");
    }
    return await recordsDb.updateRecord(id, itemText, amount, date, meta);
}

export async function deleteRecord(userId: string, id: string): Promise<void> {
    const record = await recordsDb.getRecordById(id);
    if (!record) {
        throw new Error("Record not found");
    }
    if (record.userId !== userId) {
        throw new Error("User does not own this record");
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
            throw new Error("User does not own this record");
        }
    }
    await recordsDb.deleteRecordsByPersonId(userId, personId);
}

export async function addTagToRecord(userId: string, recordId: string, tag: string): Promise<RecordTag> {
    const record = await recordsDb.getRecordById(recordId);
    if (!record) {
        throw new Error("Record not found");
    }
    if (record.userId !== userId) {
        throw new Error("User does not own this record");
    }
    return await recordTagsDb.addTagToRecord(recordId, tag);
}

export async function removeTagFromRecord(userId: string, recordId: string, tagId: string): Promise<void> {
    const record = await recordsDb.getRecordById(recordId);
    if (!record) {
        throw new Error("Record not found");
    }
    if (record.userId !== userId) {
        throw new Error("User does not own this record");
    }
    await recordTagsDb.removeTagFromRecord(recordId, tagId);
}

export async function getTagsForRecord(userId: string, recordId: string): Promise<RecordTag[]> {
    const record = await recordsDb.getRecordById(recordId);
    if (!record) {
        throw new Error("Record not found");
    }
    if (record.userId !== userId) {
        throw new Error("User does not own this record");
    }
    return await recordTagsDb.getTagsByRecordId(recordId);
}