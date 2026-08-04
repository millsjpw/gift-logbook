import { db } from "../db.js";
import {
  personExclusions,
  PersonExclusionResponse,
  persons,
} from "../schema.js";
import { eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const person2 = alias(persons, "person2");

export async function getExclusionsForPerson(
  personId: string,
): Promise<PersonExclusionResponse[]> {
  return db
    .select({
      personId1: personExclusions.personId1,
      personId2: personExclusions.personId2,
      personName2: person2.name,
    })
    .from(personExclusions)
    .where(eq(personExclusions.personId1, personId))
    .innerJoin(person2, eq(personExclusions.personId2, person2.id));
}

export async function getExclusionsByPersonIds(
  personIds: string[],
): Promise<{ personId1: string; personId2: string }[]> {
  if (personIds.length === 0) return [];
  const rows = await db
    .select({
      personId1: personExclusions.personId1,
      personId2: personExclusions.personId2,
    })
    .from(personExclusions);
  // Filter in JS to avoid dynamic OR chains; table is small per user
  const set = new Set(personIds);
  return rows.filter((r) => set.has(r.personId1));
}

export async function setExclusionsForPerson(
  personId: string,
  excludedPersonIds: string[],
): Promise<void> {
  await db
    .delete(personExclusions)
    .where(eq(personExclusions.personId1, personId));

  if (excludedPersonIds.length === 0) return;

  await db
    .insert(personExclusions)
    .values(
      excludedPersonIds.map((id) => ({ personId1: personId, personId2: id })),
    );
}

export async function deleteAllExclusionsForPerson(
  personId: string,
): Promise<void> {
  await db
    .delete(personExclusions)
    .where(and(eq(personExclusions.personId1, personId)));
  await db
    .delete(personExclusions)
    .where(eq(personExclusions.personId2, personId));
}
