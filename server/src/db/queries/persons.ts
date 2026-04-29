import { BadRequestError } from "../../api/errors.js";
import { db } from "../db.js";
import { persons } from "../schema.js";
import { eq, and, like } from "drizzle-orm";

export async function createPerson(userId: string, name: string, meta: any) {
  const person = {
    userId,
    name,
    meta,
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

export async function getPersonsByUserId(userId: string) {
  const personsList = await db
    .select()
    .from(persons)
    .where(eq(persons.userId, userId));
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

export async function getPersonsByName(userId: string, name: string) {
  const personsList = await db
    .select()
    .from(persons)
    .where(and(eq(persons.userId, userId), like(persons.name, `%${name}%`)));
  return personsList;
}

export async function updatePerson(id: string, name?: string, meta?: any) {
  const updateData: Partial<typeof persons.$inferInsert> = {};
  if (name) updateData.name = name;
  if (meta) updateData.meta = meta;

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

export async function deletePersonsByUserId(userId: string) {
  await db.delete(persons).where(eq(persons.userId, userId));
}
