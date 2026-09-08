import { db } from "../db.js";
import { NewGiftRecord, records } from "../schema.js";
import { eq, and, like } from "drizzle-orm";

export async function addRecord(
  logbookId: string,
  createdByUserId: string,
  personId: string,
  itemText: string,
  amount?: number,
  date?: Date,
) {
  const record: NewGiftRecord = {
    logbookId,
    userId: createdByUserId,
    personId,
    itemText,
    amount: amount !== undefined ? String(amount) : null,
    date: date ?? new Date(),
  };
  const [createdRecord] = await db.insert(records).values(record).returning();
  return createdRecord;
}

export async function getRecordsByLogbookId(logbookId: string) {
  const recordsList = await db
    .select()
    .from(records)
    .where(eq(records.logbookId, logbookId));
  return recordsList;
}

export async function getRecordById(id: string) {
  const [record] = await db
    .select()
    .from(records)
    .where(eq(records.id, id))
    .limit(1);
  return record;
}

export async function getRecordsByPersonId(
  logbookId: string,
  personId: string,
) {
  const recordsList = await db
    .select()
    .from(records)
    .where(
      and(eq(records.logbookId, logbookId), eq(records.personId, personId)),
    );
  return recordsList;
}

export async function getRecordsByItemText(
  logbookId: string,
  itemText: string,
) {
  const recordsList = await db
    .select()
    .from(records)
    .where(
      and(
        eq(records.logbookId, logbookId),
        like(records.itemText, `%${itemText}%`),
      ),
    );
  return recordsList;
}

export async function updateRecord(
  id: string,
  itemText?: string,
  amount?: number | null,
  date?: Date,
) {
  const updateData: Partial<NewGiftRecord> = {};
  if (itemText) updateData.itemText = itemText;
  if (amount !== undefined)
    updateData.amount = amount !== null ? String(amount) : null;
  if (date) updateData.date = date;

  const [updatedRecord] = await db
    .update(records)
    .set(updateData)
    .where(eq(records.id, id))
    .returning();
  return updatedRecord;
}

export async function deleteRecord(id: string) {
  await db.delete(records).where(eq(records.id, id));
}

export async function deleteRecordsByLogbookId(logbookId: string) {
  await db.delete(records).where(eq(records.logbookId, logbookId));
}

export async function deleteRecordsByPersonId(
  logbookId: string,
  personId: string,
) {
  await db
    .delete(records)
    .where(
      and(eq(records.logbookId, logbookId), eq(records.personId, personId)),
    );
}
