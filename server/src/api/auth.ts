import type { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as authService from "../services/auth.js";

export async function handleLogin(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };

  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields: email, password");
  }

  const user = await authService.login(params.email, params.password);
  respondWithJSON(res, 200, user);
}

export async function handleRefreshToken(req: Request, res: Response) {
  const refreshToken = authService.getBearerToken(req);

  const result = await authService.refreshAccessToken(refreshToken);

  respondWithJSON(res, 200, result);
}

export async function handleLogout(req: Request, res: Response) {
  let refreshToken = authService.getBearerToken(req);
  await authService.logout(refreshToken);
  res.status(204).send();
}
