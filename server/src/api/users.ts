import type { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { SESSION_COOKIE, sessionCookieOptions } from "./cookies.js";
import * as userService from "../services/users.js";

export async function handleCreateUser(req: Request, res: Response) {
  type parameters = {
    name: string;
    email: string;
    password: string;
  };

  const params: parameters = req.body;

  if (!params.name || !params.email || !params.password) {
    throw new BadRequestError("Missing required fields: name, email, password");
  }

  const { user, sessionToken } = await userService.addUser(
    params.name,
    params.email,
    params.password,
  );

  res.cookie(SESSION_COOKIE, sessionToken, sessionCookieOptions());
  respondWithJSON(res, 201, user);
}

export async function handleGetUser(req: Request, res: Response) {
  const userId = req.params.id as string;
  const user = await userService.getUserById(userId);
  respondWithJSON(res, 200, user);
}

export async function handleUpdateUser(req: Request, res: Response) {
  const userId = req.params.id as string;
  const { name, email, password } = req.body;

  if (!name && !email && !password) {
    throw new BadRequestError(
      "At least one field (name, email, password) must be provided for update",
    );
  }

  const updatedUser = await userService.updateUser(
    userId,
    name,
    email,
    password,
  );
  respondWithJSON(res, 200, updatedUser);
}

export async function handleDeleteUser(req: Request, res: Response) {
  const userId = req.params.id as string;
  await userService.deleteUser(userId);
  res.status(204).send();
}

export async function handleGetSettings(req: Request, res: Response) {
  const userId = req.params.id as string;
  const settings = await userService.getUserSettings(userId);
  respondWithJSON(res, 200, settings);
}

export async function handleUpdateSettings(req: Request, res: Response) {
  const userId = req.params.id as string;
  const { darkMode } = req.body;

  if (darkMode === undefined) {
    throw new BadRequestError("At least one setting must be provided for update");
  }

  const updated = await userService.updateUserSettings(userId, { darkMode });
  respondWithJSON(res, 200, updated);
}
