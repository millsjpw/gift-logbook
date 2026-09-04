import { BadRequestError } from "../../api/errors.js";
import { db } from "../db.js";
import { persons } from "../schema.js";
import { eq, and, inArray, like } from "drizzle-orm";

export async function createPerson(
  logbookId: string,
  createdByUserId: string,
  name: string,
  birthMonth?: number | null,
  birthDay?: number | null,
  birthYear?: number | null,
) {
  const person = {
    logbookId,
    userId: createdByUserId,
    name,
    birthMonth: birthMonth ?? null,
    birthDay: birthDay ?? null,
    birthYear: birthYear ?? null,
  };
  try {
    const [createdPerson] = await db.insert(persons).values(person).returning();
    if (!createdPerson) {
      throw new BadRequestError("You already have a person with that name");
    }
    return createdPerson;
  } catch (err: any) {
    if (err.cause?.code === "23505") {
      // Unique constraint violation
      throw new BadRequestError("You already have a person with that name");
    }
    throw err;
  }
}

export async function getPersonsByLogbookId(logbookId: string) {
  const personsList = await db
    .select()
    .from(persons)
    .where(eq(persons.logbookId, logbookId));
  return personsList;
}

export async function getPersonsByLogbookIds(logbookIds: string[]) {
  if (logbookIds.length === 0) return [];
  const personsList = await db
    .select()
    .from(persons)
    .where(inArray(persons.logbookId, logbookIds));
  return personsList;
}

export async function getPersonById(id: string) {
  const [person] = await db
    .select()
    .from(persons)
    .where(eq(persons.id, id))
    .limit(1);
  return person;
}

export async function getPersonsByName(logbookId: string, name: string) {
  const personsList = await db
    .select()
    .from(persons)
    .where(
      and(eq(persons.logbookId, logbookId), like(persons.name, `%${name}%`)),
    );
  return personsList;
}

export async function updatePerson(
  id: string,
  name?: string,
  birthMonth?: number | null,
  birthDay?: number | null,
  birthYear?: number | null,
) {
  const updateData: Partial<typeof persons.$inferInsert> = {};
  if (name) updateData.name = name;
  if (birthMonth !== undefined) updateData.birthMonth = birthMonth;
  if (birthDay !== undefined) updateData.birthDay = birthDay;
  if (birthYear !== undefined) updateData.birthYear = birthYear;

  try {
    const [updatedPerson] = await db
      .update(persons)
      .set(updateData)
      .where(eq(persons.id, id))
      .returning();
    if (!updatedPerson) {
      throw new BadRequestError("You already have a person with that name");
    }
    return updatedPerson;
  } catch (err: any) {
    if (err.cause?.code === "23505") {
      // Unique constraint violation
      throw new BadRequestError("You already have a person with that name");
    }
    throw err;
  }
}

export async function deletePerson(id: string) {
  await db.delete(persons).where(eq(persons.id, id));
}

export async function deletePersonsByLogbookId(logbookId: string) {
  await db.delete(persons).where(eq(persons.logbookId, logbookId));
}
