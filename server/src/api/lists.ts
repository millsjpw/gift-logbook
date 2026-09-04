import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as listService from "../services/lists.js";
import { assertListAccess } from "../services/authz.js";

export async function handleCreateList(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const { name, personId, items } = req.body;

  if (!name) {
    throw new BadRequestError("Missing required field: name");
  }

  const list = await listService.createList(userId, name, personId, items);
  respondWithJSON(res, 201, list);
}

export async function handleGetListById(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const listId = req.params.id as string;
  const list = await listService.getListById(userId, listId);
  if (!list) {
    throw new NotFoundError("List not found");
  }
  respondWithJSON(res, 200, list);
}

export async function handleGetRecentLists(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const rawLimit = req.query.limit;
  let limit = 5;
  if (rawLimit !== undefined) {
    const parsed = parseInt(rawLimit as string, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new BadRequestError("limit must be a positive integer");
    }
    limit = parsed;
  }
  const lists = await listService.getRecentLists(userId, limit);
  respondWithJSON(res, 200, lists);
}

export async function handleGetListsByUserId(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const lists = await listService.getListsByUserId(userId);
  respondWithJSON(res, 200, lists);
}

export async function handleGetListsByPersonId(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const personId = req.params.personId as string;
  const lists = await listService.getListsByPersonId(userId, personId);
  respondWithJSON(res, 200, lists);
}

export async function handleGetListsByName(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const name = req.query.name as string;
  if (!name) {
    throw new BadRequestError("Missing required query parameter: name");
  }
  const lists = await listService.getListsByName(userId, name);
  respondWithJSON(res, 200, lists);
}

export async function handleUpdateList(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const listId = req.params.id as string;
  const { name, personId, items } = req.body;

  if (!name && !personId && !items) {
    throw new BadRequestError(
      "At least one field (name, personId, items) must be provided for update",
    );
  }

  const existingList = await listService.getListById(userId, listId);
  if (!existingList) {
    throw new NotFoundError("List not found");
  }
  assertListAccess(userId, existingList, "write");

  const updatedList = await listService.updateList(userId, {
    ...existingList,
    name,
    personId,
    items,
  });
  respondWithJSON(res, 200, updatedList);
}

export async function handleDeleteList(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const listId = req.params.id as string;

  await listService.deleteList(userId, listId);
  res.status(204).send();
}

export async function handleDeleteItemFromList(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const listId = req.params.listId as string;
  const itemId = req.params.itemId as string;

  await listService.deleteItemFromList(userId, listId, itemId);
  res.status(204).send();
}

export async function handleAddTagToListItem(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const listId = req.params.listId as string;
  const itemId = req.params.itemId as string;
  const { tagId } = req.body;

  if (!tagId) {
    throw new BadRequestError("Missing required field: tagId");
  }

  await listService.addTagToListItem(userId, listId, itemId, tagId);
  res.status(204).send();
}

export async function handleRemoveTagFromListItem(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const listId = req.params.listId as string;
  const itemId = req.params.itemId as string;
  const tagId = req.params.tagId as string;

  await listService.removeTagFromListItem(userId, listId, itemId, tagId);
  res.status(204).send();
}

export async function handleGetListsSharedWithMe(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const lists = await listService.getListsSharedWithMe(userId);
  respondWithJSON(res, 200, lists);
}

export async function handleShareList(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const listId = req.params.id as string;
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError("Missing required field: email");
  }

  await listService.shareList(userId, listId, email);
  res.status(204).send();
}

export async function handleGetSharesForList(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const listId = req.params.id as string;
  const shares = await listService.getSharesForList(userId, listId);
  respondWithJSON(res, 200, shares);
}

export async function handleUnshareList(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const listId = req.params.id as string;
  const sharedWithUserId = req.params.userId as string;
  await listService.unshareList(userId, listId, sharedWithUserId);
  res.status(204).send();
}
