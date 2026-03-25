import * as tagsDb from '../db/queries/tags.js';
import { Tag } from '../db/schema.js';

export async function createTag(userId: string, name: string): Promise<Tag> {
    return await tagsDb.createTag(userId, name);
}

export async function getTagById(id: string): Promise<Tag | null> {
    return await tagsDb.getTagById(id);
}

export async function getTagsByUserId(userId: string): Promise<Tag[]> {
    return await tagsDb.getTagsByUserId(userId);
}

export async function updateTag(userId: string, id: string, name: string): Promise<Tag> {
    const tag = await tagsDb.getTagById(id);
    if (!tag) {
        throw new Error("Tag not found");
    }
    if (tag.userId !== userId) {
        throw new Error("User does not own this tag");
    }
    return await tagsDb.updateTag(id, name);
}

export async function deleteTag(userId: string, id: string): Promise<void> {
    const tag = await tagsDb.getTagById(id);
    if (!tag) {
        throw new Error("Tag not found");
    }
    if (tag.userId !== userId) {
        throw new Error("User does not own this tag");
    }
    await tagsDb.deleteTag(id);
}