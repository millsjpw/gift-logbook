import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as personService from "../services/persons.js";

export async function handleCreatePerson(req: Request, res: Response) {
  const { name, tags, birthMonth, birthDay, birthYear } = req.body;
  const logbookId = req.params.logbookId as string;
  if (!name) {
    throw new BadRequestError("Missing required field: name");
  }

  const userId = req.auth!.userId;
  const person = await personService.addPerson(
    userId,
    logbookId,
    name,
    birthMonth ?? null,
    birthDay ?? null,
    birthYear ?? null,
    tags,
  );
  respondWithJSON(res, 201, person);
}

export async function handleGetPerson(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const personId = req.params.id as string;
  const person = await personService.getPersonById(userId, personId);
  if (!person) {
    throw new NotFoundError("Person not found");
  }
  respondWithJSON(res, 200, person);
}

export async function handleGetPeopleInLogbook(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.logbookId as string;
  const people = await personService.getPeopleInLogbook(userId, logbookId);
  respondWithJSON(res, 200, people);
}

export async function handleGetPersonsAccessible(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const people = await personService.getPersonsAccessibleToUser(userId);
  respondWithJSON(res, 200, people);
}

export async function handleSearchPeopleByName(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.logbookId as string;

  const nameQuery = req.query.name as string;
  if (!nameQuery) {
    throw new BadRequestError("Missing required query parameter: name");
  }

  const people = await personService.searchPeopleByName(
    userId,
    logbookId,
    nameQuery,
  );
  respondWithJSON(res, 200, people);
}

export async function handleUpdatePerson(req: Request, res: Response) {
  const personId = req.params.id as string;
  const { name, tags, birthMonth, birthDay, birthYear } = req.body;

  if (
    !name &&
    birthMonth === undefined &&
    birthDay === undefined &&
    birthYear === undefined &&
    tags === undefined
  ) {
    throw new BadRequestError(
      "At least one field (name, tags, birthMonth, birthDay, birthYear) must be provided for update",
    );
  }

  const userId = req.auth!.userId;
  const updatedPerson = await personService.updatePerson(
    userId,
    personId,
    name,
    birthMonth,
    birthDay,
    birthYear,
    tags,
  );
  respondWithJSON(res, 200, updatedPerson);
}

export async function handleDeletePerson(req: Request, res: Response) {
  const personId = req.params.id as string;
  const userId = req.auth!.userId;
  await personService.deletePerson(userId, personId);
  res.status(204).send();
}

export async function handleDeletePeopleInLogbook(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const logbookId = req.params.logbookId as string;
  await personService.deletePeopleInLogbook(userId, logbookId);
  res.status(204).send();
}

export async function handleGetUpcomingBirthdays(req: Request, res: Response) {
  const userId = req.auth!.userId;

  const rawLimit = req.query.limit;
  const limit = rawLimit !== undefined ? parseInt(rawLimit as string, 10) : 5;
  if (isNaN(limit) || limit < 1) {
    throw new BadRequestError("limit must be a positive integer");
  }

  const rawDaysAhead = req.query.daysAhead;
  const daysAhead =
    rawDaysAhead !== undefined ? parseInt(rawDaysAhead as string, 10) : 180;
  if (isNaN(daysAhead) || daysAhead < 0) {
    throw new BadRequestError("daysAhead must be a non-negative integer");
  }

  const birthdays = await personService.getUpcomingBirthdays(
    userId,
    limit,
    daysAhead,
  );
  respondWithJSON(res, 200, birthdays);
}

export async function handleGetExclusions(req: Request, res: Response) {
  const personId = req.params.id as string;
  const exclusions = await personService.getExclusions(personId);
  respondWithJSON(res, 200, exclusions);
}

export async function handleSetExclusions(req: Request, res: Response) {
  const personId = req.params.id as string;
  const { excludedPersonIds } = req.body;

  if (!Array.isArray(excludedPersonIds)) {
    throw new BadRequestError(
      "Missing required field: excludedPersonIds (array)",
    );
  }

  await personService.setExclusions(personId, excludedPersonIds);
  res.status(204).send();
}
