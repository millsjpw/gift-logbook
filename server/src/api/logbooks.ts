import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as logbookService from "../services/logbooks.js";

export async function handleCreateLogbook(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("Missing required field: name");
  }
  const logbook = await logbookService.createLogbook(userId, name);
  respondWithJSON(res, 201, logbook);
}

export async function handleGetLogbooksForUser(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbooks = await logbookService.getLogbooksForUser(userId);
  respondWithJSON(res, 200, logbooks);
}

export async function handleGetLogbookById(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.id as string;
  const logbook = await logbookService.getLogbookById(userId, logbookId);
  if (!logbook) {
    throw new NotFoundError("Logbook not found");
  }
  respondWithJSON(res, 200, logbook);
}

export async function handleUpdateLogbook(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.id as string;
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("Missing required field: name");
  }
  const logbook = await logbookService.updateLogbook(userId, logbookId, name);
  respondWithJSON(res, 200, logbook);
}

export async function handleAddLogbookMember(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.id as string;
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Missing required field: email");
  }
  await logbookService.addMemberByEmail(userId, logbookId, email);
  res.status(204).send();
}

export async function handleGetLogbookMembers(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.id as string;
  const members = await logbookService.getMembers(userId, logbookId);
  respondWithJSON(res, 200, members);
}

export async function handleRemoveLogbookMember(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.id as string;
  const targetUserId = req.params.userId as string;
  await logbookService.removeMember(userId, logbookId, targetUserId);
  res.status(204).send();
}
