import type { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
} from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as recordsService from "../services/records.js";
import { GiftRecord } from "../db/schema.js";

export async function handleAddRecord(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const { personId, itemText, amount, date, meta } = req.body;

  if (!personId || !itemText) {
    throw new BadRequestError("Missing required fields: personId, itemText");
  }

  const record: GiftRecord = await recordsService.addRecord(
    userId,
    personId,
    itemText,
    amount,
    date ? new Date(date) : undefined,
    meta,
  );
  respondWithJSON(res, 201, record);
}

export async function handleGetRecordById(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const recordId = req.params.id as string;

  const record = await recordsService.getRecordById(recordId);
  if (!record) {
    throw new NotFoundError("Record not found");
  }
  if (record.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to view this record",
    );
  }

  respondWithJSON(res, 200, record);
}

export async function handleGetRecordsByUserId(req: Request, res: Response) {
  const userId = req.auth!.userId;

  const records = await recordsService.getRecordsByUserId(userId);
  respondWithJSON(res, 200, records);
}

export async function handleGetRecordsByPersonId(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const personId = req.params.personId as string;

  const records = await recordsService.getRecordsByPersonId(userId, personId);
  respondWithJSON(res, 200, records);
}

export async function handleGetRecordsByItemText(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const itemText = req.query.itemText as string;

  if (!itemText) {
    throw new BadRequestError("Missing required query parameter: itemText");
  }

  const records = await recordsService.getRecordsByItemText(userId, itemText);
  respondWithJSON(res, 200, records);
}

export async function handleUpdateRecord(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const recordId = req.params.id as string;
  const { itemText, amount, date, meta } = req.body;

  if (!itemText && !amount && !date && !meta) {
    throw new BadRequestError(
      "At least one field (itemText, amount, date, meta) must be provided for update",
    );
  }

  const updatedRecord = await recordsService.updateRecord(
    userId,
    recordId,
    itemText,
    amount,
    date ? new Date(date) : undefined,
    meta,
  );
  respondWithJSON(res, 200, updatedRecord);
}

export async function handleDeleteRecord(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const recordId = req.params.id as string;

  await recordsService.deleteRecord(userId, recordId);
  res.status(204).send();
}

export async function handleDeleteRecordsByPersonId(
  req: Request,
  res: Response,
) {
  const userId = req.auth!.userId;
  const personId = req.params.personId as string;

  await recordsService.deleteRecordsByPersonId(userId, personId);
  res.status(204).send();
}

export async function handleDeleteRecordsByUserId(req: Request, res: Response) {
  const userId = req.auth!.userId;

  await recordsService.deleteRecordsByUserId(userId);
  res.status(204).send();
}

export async function handleAddTagToRecord(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const recordId = req.params.id as string;
  const { tag } = req.body;

  if (!tag) {
    throw new BadRequestError("Missing required field: tag");
  }

  const updatedRecord = await recordsService.addTagToRecord(
    userId,
    recordId,
    tag,
  );
  respondWithJSON(res, 200, updatedRecord);
}

export async function handleRemoveTagFromRecord(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const recordId = req.params.id as string;
  const tag = req.params.tag as string;

  if (!tag) {
    throw new BadRequestError("Missing required parameter: tag");
  }

  const updatedRecord = await recordsService.removeTagFromRecord(
    userId,
    recordId,
    tag,
  );
  respondWithJSON(res, 200, updatedRecord);
}

export async function handleGetTagsForRecord(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const recordId = req.params.id as string;

  const tags = await recordsService.getTagsForRecord(userId, recordId);
  respondWithJSON(res, 200, tags);
}
