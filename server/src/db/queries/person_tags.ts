import { db } from "../db.js";
import { personTags, tags, NewPersonTag, Tag } from "../schema";
import { eq, and } from "drizzle-orm";

export async function getTagsByPersonId(personId: string): Promise<Tag[]> {
  const rows = await db
    .select({ tag: tags })
    .from(personTags)
    .innerJoin(tags, eq(personTags.tagId, tags.id))
    .where(eq(personTags.personId, personId));
  return rows.map((r) => r.tag);
}

export async function syncTagsForPerson(
  personId: string,
  tagIds: string[],
): Promise<void> {
  await db.delete(personTags).where(eq(personTags.personId, personId));
  if (tagIds.length > 0) {
    await db
      .insert(personTags)
      .values(tagIds.map((tagId) => ({ personId, tagId })))
      .onConflictDoNothing();
  }
}

export async function addTagToPerson(
  personId: string,
  tagId: string,
): Promise<NewPersonTag> {
  const [row] = await db
    .insert(personTags)
    .values({ personId, tagId })
    .returning();
  return row;
}

export async function removeTagFromPerson(
  personId: string,
  tagId: string,
): Promise<void> {
  await db
    .delete(personTags)
    .where(
      and(eq(personTags.personId, personId), eq(personTags.tagId, tagId)),
    );
}

export async function removeAllTagsFromPerson(personId: string) {
  await db.delete(personTags).where(eq(personTags.personId, personId));
}
