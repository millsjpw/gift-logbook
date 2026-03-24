import { db } from '../db.js';
import { NewGiftRecord, records } from '../schema.js';
import { eq, and, like } from 'drizzle-orm';

export async function addRecord(userId: string, personId: string, itemText: string, amount?: number, date?: Date, meta?: any) {
    const record: NewGiftRecord = {
        userId,
        personId,
        itemText,
        amount: amount !== undefined ? String(amount) : null,
        date: date ?? new Date(),
        meta: meta ?? null,
    };
    const [createdRecord] = await db.insert(records).values(record).returning();
    return createdRecord;
}

export async function getRecordsByUserId(userId: string) {
    const recordsList = await db.select().from(records).where(eq(records.userId, userId));
    return recordsList;
}

export async function getRecordById(id: string) {
    const [record] = await db.select().from(records).where(eq(records.id, id)).limit(1);
    return record;
}

export async function getRecordsByPersonId(userId: string, personId: string) {
    const recordsList = await db.select().from(records).where(
        and(
            eq(records.userId, userId),
            eq(records.personId, personId)
        )
    );
    return recordsList;
}

export async function getRecordsByItemText(userId: string, itemText: string) {
    const recordsList = await db.select().from(records).where(
        and(
            eq(records.userId, userId),
            like(records.itemText, `%${itemText}%`)
        )
    );
    return recordsList;
}

export async function updateRecord(id: string, itemText?: string, amount?: number, date?: Date, meta?: any) {
    const updateData: Partial<NewGiftRecord> = {};
    if (itemText) updateData.itemText = itemText;
    if (amount !== undefined) updateData.amount = String(amount);
    if (date) updateData.date = date;
    if (meta) updateData.meta = meta;

    const [updatedRecord] = await db.update(records).set(updateData).where(eq(records.id, id)).returning();
    return updatedRecord;
}

export async function deleteRecord(id: string) {
    await db.delete(records).where(eq(records.id, id));
}

export async function deleteRecordsByUserId(userId: string) {
    await db.delete(records).where(eq(records.userId, userId));
}

export async function deleteRecordsByPersonId(userId: string, personId: string) {
    await db.delete(records).where(
        and(
            eq(records.userId, userId),
            eq(records.personId, personId)
        )
    );
}