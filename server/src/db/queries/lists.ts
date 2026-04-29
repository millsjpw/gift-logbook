import { db } from "../db.js";
import { lists, NewList } from "../schema.js";
import { and, eq, like } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "../../api/errors.js";

export async function createList(
  userId: string,
  name: string,
  personId?: string,
) {
  const list: NewList = {
    userId,
    name,
    personId: personId || null,
  };
  try {
    const [createdList] = await db.insert(lists).values(list).returning();
    return createdList;
  } catch (err: any) {
    if (err.cause?.code === "23505") {
      throw new BadRequestError("You already have a list with that name");
    }
    if (err.cause?.code === "23503") {
      throw new BadRequestError("The specified person does not exist");
    }
    throw err;
  }
}

export async function getListsByUserId(userId: string) {
  const userLists = await db
    .select()
    .from(lists)
    .where(eq(lists.userId, userId));
  return userLists;
}

export async function getListsByPersonId(userId: string, personId: string) {
  const personLists = await db
    .select()
    .from(lists)
    .where(and(eq(lists.userId, userId), eq(lists.personId, personId)));
  return personLists;
}

export async function getListById(id: string) {
  const [list] = await db.select().from(lists).where(eq(lists.id, id)).limit(1);
  return list;
}

export async function getListsByName(userId: string, name: string) {
  const listsByName = await db
    .select()
    .from(lists)
    .where(and(eq(lists.userId, userId), like(lists.name, `%${name}%`)));
  return listsByName;
}

export async function updateList(id: string, name?: string, personId?: string) {
  const updateData: Partial<NewList> = {};
  if (name) updateData.name = name;
  if (personId !== undefined) updateData.personId = personId;

  try {
    const [updatedList] = await db
      .update(lists)
      .set(updateData)
      .where(eq(lists.id, id))
      .returning();
    if (!updatedList) {
      throw new NotFoundError("List not found");
    }
    return updatedList;
  } catch (err: any) {
    if (err.cause?.code === "23505") {
      throw new BadRequestError("You already have a list with that name");
    }
    if (err.cause?.code === "23503") {
      throw new BadRequestError("The specified person does not exist");
    }
    throw err;
  }
}

export async function deleteList(id: string) {
  await db.delete(lists).where(eq(lists.id, id));
}

export async function deleteListsByUserId(userId: string) {
  await db.delete(lists).where(eq(lists.userId, userId));
}

export async function deleteListsByPersonId(userId: string, personId: string) {
  await db
    .delete(lists)
    .where(and(eq(lists.userId, userId), eq(lists.personId, personId)));
}
