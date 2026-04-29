import { db } from "../db.js";
import { exchanges, NewExchange } from "../schema.js";
import { eq, and, like } from "drizzle-orm";

export async function createExchange(userId: string, name: string) {
  const exchange: NewExchange = {
    userId,
    name,
  };
  const [createdExchange] = await db
    .insert(exchanges)
    .values(exchange)
    .returning();
  return createdExchange;
}

export async function getExchangesByUserId(userId: string) {
  const userExchanges = await db
    .select()
    .from(exchanges)
    .where(eq(exchanges.userId, userId));
  return userExchanges;
}

export async function getExchangeById(id: string) {
  const [exchange] = await db
    .select()
    .from(exchanges)
    .where(eq(exchanges.id, id))
    .limit(1);
  return exchange;
}

export async function getExchangesByName(userId: string, name: string) {
  const exchangesByName = await db
    .select()
    .from(exchanges)
    .where(
      and(eq(exchanges.userId, userId), like(exchanges.name, `%${name}%`)),
    );
  return exchangesByName;
}

export async function updateExchange(id: string, name?: string) {
  const updateData: Partial<NewExchange> = {};
  if (name) updateData.name = name;

  const [updatedExchange] = await db
    .update(exchanges)
    .set(updateData)
    .where(eq(exchanges.id, id))
    .returning();
  return updatedExchange;
}

export async function deleteExchange(id: string) {
  await db.delete(exchanges).where(eq(exchanges.id, id));
}

export async function deleteExchangesByUserId(userId: string) {
  await db.delete(exchanges).where(eq(exchanges.userId, userId));
}
