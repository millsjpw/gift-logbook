import type { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as exchangeService from "../services/exchanges.js";
import { FullExchange } from "../services/exchanges.js";

export async function handleGetFullExchange(req: Request, res: Response) {
  const exchangeId = req.params.id as string;

  const fullExchange: FullExchange =
    await exchangeService.getFullExchange(exchangeId);

  respondWithJSON(res, 200, fullExchange);
}

export async function handleGetAllUserExchanges(req: Request, res: Response) {
  const userId = req.auth!.userId;

  const exchanges = await exchangeService.getAllFullExchangesForUser(userId);
  respondWithJSON(res, 200, exchanges);
}

export async function handleCreateExchange(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const { name } = req.body;

  if (!name) {
    throw new BadRequestError("Missing required field: name");
  }

  const exchange = await exchangeService.createExchange(userId, name);
  respondWithJSON(res, 201, exchange);
}

export async function handleAddParticipant(req: Request, res: Response) {
  const exchangeId = req.params.id as string;
  const { personId } = req.body;

  if (!personId) {
    throw new BadRequestError("Missing required field: personId");
  }

  const participant = await exchangeService.addParticipant(
    exchangeId,
    personId,
  );
  respondWithJSON(res, 201, participant);
}

export async function handleSetExclusions(req: Request, res: Response) {
  const exchangeId = req.params.id as string;
  const { personId, excludedPersonIds } = req.body;

  if (!personId || !Array.isArray(excludedPersonIds)) {
    throw new BadRequestError(
      "Missing required fields: personId, excludedPersonIds (array)",
    );
  }

  await exchangeService.setExclusions(exchangeId, personId, excludedPersonIds);
  res.status(204).send();
}

export async function handleGenerateAssignments(req: Request, res: Response) {
  const exchangeId = req.params.id as string;

  const assignments = await exchangeService.generateAssignments(exchangeId);
  respondWithJSON(res, 200, assignments);
}

export async function handleCloneExchange(req: Request, res: Response) {
  const exchangeId = req.params.id as string;
  const userId = req.auth!.userId;

  const newExchange = await exchangeService.cloneExchange(exchangeId, userId);
  respondWithJSON(res, 201, newExchange);
}

export async function handleSaveAssignments(req: Request, res: Response) {
  const exchangeId = req.params.id as string;
  const { assignments } = req.body;
  console.log("Received assignments:", assignments);

  if (!Array.isArray(assignments)) {
    throw new BadRequestError("Missing required field: assignments (array)");
  }

  await exchangeService.saveAssignments(exchangeId, assignments);
  res.status(204).send();
}

export async function handleUpdateExchange(req: Request, res: Response) {
  const exchangeId = req.params.id as string;
  const { name } = req.body;

  if (!name) {
    throw new BadRequestError("Missing required field: name");
  }

  const updatedExchange = await exchangeService.updateExchange(
    exchangeId,
    name,
  );
  respondWithJSON(res, 200, updatedExchange);
}

export async function handleDeleteExchange(req: Request, res: Response) {
  const exchangeId = req.params.id as string;

  await exchangeService.deleteExchange(exchangeId);
  res.status(204).send();
}
