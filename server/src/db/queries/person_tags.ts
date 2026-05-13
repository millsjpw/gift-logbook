import { db } from "../db.js";
import { personTags, NewPersonTag } from "../schema";
import { eq, and } from "drizzle-orm";

export async function addTagToPerson(personId: string, tagId: string) {
  const personTag: NewPersonTag = {
    personId,
    tagId,
  };
  const [createdPersonTag] = await db
    .insert(personTags)
    .values(personTag)
    .returning();
  return createdPersonTag;
}

export async function getTagsByPersonId(personId: string) {
  const personTagsList = await db
    .select()
    .from(personTags)
    .where(eq(personTags.personId, personId));
  return personTagsList;
}

export async function removeTagFromPerson(personId: string, tagId: string) {
  await db
    .delete(personTags)
    .where(and(eq(personTags.personId, personId), eq(personTags.tagId, tagId)));
}

export async function removeAllTagsFromPerson(personId: string) {
  await db.delete(personTags).where(eq(personTags.personId, personId));
}
