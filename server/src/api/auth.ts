import type { Request, Response } from "express";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { SESSION_COOKIE, sessionCookieOptions, clearCookieOptions } from "./cookies.js";
import * as authService from "../services/auth.js";

export async function handleLogin(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Missing required fields: email, password");
  }

  const { user, sessionToken } = await authService.login(email, password);

  res.cookie(SESSION_COOKIE, sessionToken, sessionCookieOptions());
  respondWithJSON(res, 200, user);
}

export async function handleMe(req: Request, res: Response) {
  const sessionToken: string | undefined = req.cookies?.[SESSION_COOKIE];
  if (!sessionToken) {
    throw new UserNotAuthenticatedError("Not authenticated");
  }

  const user = await authService.getSessionUser(sessionToken);
  if (!user) {
    res.clearCookie(SESSION_COOKIE, clearCookieOptions());
    throw new UserNotAuthenticatedError("Invalid or expired session");
  }

  respondWithJSON(res, 200, user);
}

export async function handleLogout(req: Request, res: Response) {
  const sessionToken: string | undefined = req.cookies?.[SESSION_COOKIE];
  if (sessionToken) {
    await authService.logout(sessionToken);
  }
  res.clearCookie(SESSION_COOKIE, clearCookieOptions());
  res.status(204).send();
}
