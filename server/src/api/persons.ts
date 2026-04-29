import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as personService from "../services/persons.js";
import { Person } from "../db/schema.js";

export async function handleCreatePerson(req: Request, res: Response) {
  const { name, meta } = req.body;
  if (!name) {
    throw new BadRequestError("Missing required field: name");
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new BadRequestError("Authentication required to create a person");
  }

  const person: Person = await personService.addPerson(userId, name, meta);
  respondWithJSON(res, 201, person);
}

export async function handleGetPerson(req: Request, res: Response) {
  const personId = req.params.id as string;
  const person = await personService.getPersonById(personId);
  if (!person) {
    throw new NotFoundError("Person not found");
  }
  respondWithJSON(res, 200, person);
}

export async function handleGetPeopleCreatedByUser(
  req: Request,
  res: Response,
) {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new BadRequestError("Authentication required to view your people");
  }

  const people = await personService.getAllPeopleCreatedByUser(userId);
  respondWithJSON(res, 200, people);
}

export async function handleSearchPeopleByName(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new BadRequestError("Authentication required to search your people");
  }

  const nameQuery = req.query.name as string;
  if (!nameQuery) {
    throw new BadRequestError("Missing required query parameter: name");
  }

  const people = await personService.searchPeopleByName(userId, nameQuery);
  respondWithJSON(res, 200, people);
}

export async function handleUpdatePerson(req: Request, res: Response) {
  const personId = req.params.id as string;
  const { name, meta } = req.body;

  if (!name && !meta) {
    throw new BadRequestError(
      "At least one field (name, meta) must be provided for update",
    );
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new BadRequestError("Authentication required to update a person");
  }

  const updatedPerson = await personService.updatePerson(
    userId,
    personId,
    name,
    meta,
  );
  respondWithJSON(res, 200, updatedPerson);
}

export async function handleDeletePerson(req: Request, res: Response) {
  const personId = req.params.id as string;

  const userId = req.auth?.userId;
  if (!userId) {
    throw new BadRequestError("Authentication required to delete a person");
  }

  await personService.deletePerson(userId, personId);
  res.status(204).send();
}

export async function handleDeletePeopleCreatedByUser(
  req: Request,
  res: Response,
) {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new BadRequestError("Authentication required to delete your people");
  }

  await personService.deletePeopleCreatedByUser(userId);
  res.status(204).send();
}
