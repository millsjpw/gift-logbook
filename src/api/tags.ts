import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as tagsService from "../services/tags.js";
import { Tag } from "../db/schema.js";

export async function handleCreateTag(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { name } = req.body;

    if (!name) {
        throw new BadRequestError("Missing required field: name");
    }

    const tag: Tag = await tagsService.createTag(userId, name);
    respondWithJSON(res, 201, tag);
}

export async function handleGetTagById(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const tagId = req.params.id as string;

    const tag = await tagsService.getTagById(tagId);
    if (!tag || tag.userId !== userId) {
        throw new NotFoundError("Tag not found");
    }

    respondWithJSON(res, 200, tag);
}

export async function handleGetTagsByUserId(req: Request, res: Response) {
    const userId = req.auth!.userId;

    const tags = await tagsService.getTagsByUserId(userId);
    respondWithJSON(res, 200, tags);
}

export async function handleDeleteTag(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const tagId = req.params.id as string;

    await tagsService.deleteTag(userId, tagId);
    res.status(204).send();
}

export async function handleUpdateTag(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const tagId = req.params.id as string;
    const { name } = req.body;

    if (!name) {
        throw new BadRequestError("Missing required field: name");
    }

    const updatedTag = await tagsService.updateTag(userId, tagId, name);
    respondWithJSON(res, 200, updatedTag);
}