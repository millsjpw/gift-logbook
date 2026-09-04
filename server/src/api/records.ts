import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as recordsService from "../services/records.js";

export async function handleAddRecord(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.logbookId as string;
  const { personId, itemText, amount, date, tags } = req.body;

  if (!personId || !itemText) {
    throw new BadRequestError("Missing required fields: personId, itemText");
  }

  const record = await recordsService.addRecord(
    userId,
    logbookId,
    personId,
    itemText,
    amount,
    date ? new Date(date) : undefined,
    tags,
  );
  respondWithJSON(res, 201, record);
}

export async function handleGetRecordById(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const recordId = req.params.id as string;

  const record = await recordsService.getRecordById(userId, recordId);
  if (!record) {
    throw new NotFoundError("Record not found");
  }

  respondWithJSON(res, 200, record);
}

export async function handleGetRecordsByLogbook(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.logbookId as string;

  const records = await recordsService.getRecordsByLogbook(userId, logbookId);
  respondWithJSON(res, 200, records);
}

export async function handleGetRecordsByPersonId(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.logbookId as string;
  const personId = req.params.personId as string;

  const records = await recordsService.getRecordsByPersonId(
    userId,
    logbookId,
    personId,
  );
  respondWithJSON(res, 200, records);
}

export async function handleGetRecordsByItemText(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.logbookId as string;
  const itemText = req.query.itemText as string;

  if (!itemText) {
    throw new BadRequestError("Missing required query parameter: itemText");
  }

  const records = await recordsService.getRecordsByItemText(
    userId,
    logbookId,
    itemText,
  );
  respondWithJSON(res, 200, records);
}

export async function handleUpdateRecord(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const recordId = req.params.id as string;
  const { itemText, amount, date, tags } = req.body;

  if (!itemText && amount === undefined && !date && tags === undefined) {
    throw new BadRequestError(
      "At least one field (itemText, amount, date, tags) must be provided for update",
    );
  }

  const updatedRecord = await recordsService.updateRecord(
    userId,
    recordId,
    itemText,
    amount,
    date ? new Date(date) : undefined,
    tags,
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
  const logbookId = req.params.logbookId as string;
  const personId = req.params.personId as string;

  await recordsService.deleteRecordsByPersonId(userId, logbookId, personId);
  res.status(204).send();
}

export async function handleDeleteRecordsByLogbook(
  req: Request,
  res: Response,
) {
  const userId = req.auth!.userId;
  const logbookId = req.params.logbookId as string;

  await recordsService.deleteRecordsByLogbook(userId, logbookId);
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
