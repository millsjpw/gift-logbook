import { db } from '../db.js';
import { tags, NewTag } from '../schema.js';
import { eq } from 'drizzle-orm';

export async function createTag(userId: string, name: string) {
    const tag: NewTag = {
        userId,
        name,
    };
    const [createdTag] = await db.insert(tags).values(tag).returning();
    return createdTag;
}

export async function getTagsByUserId(userId: string) {
    const userTags = await db.select().from(tags).where(eq(tags.userId, userId));
    return userTags;
}

export async function getTagById(id: string) {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return tag;
}

export async function updateTag(id: string, name?: string) {
    const updateData: Partial<NewTag> = {};
    if (name) updateData.name = name;

    const [updatedTag] = await db.update(tags).set(updateData).where(eq(tags.id, id)).returning();
    return updatedTag;
}

export async function deleteTag(id: string) {
    await db.delete(tags).where(eq(tags.id, id));
}

export async function deleteTagsByUserId(userId: string) {
    await db.delete(tags).where(eq(tags.userId, userId));
}