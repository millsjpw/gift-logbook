import { NextFunction, Request, Response } from "express";
import { respondWithError } from "./json.js";
import {
  BadRequestError,
  UserNotAuthenticatedError,
  UserForbiddenError,
  NotFoundError,
} from "./errors.js";
import { getBearerToken, verifyToken } from "../services/auth.js";

export function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.on("finish", () => {
    const code = res.statusCode;
    const label = code >= 400 ? "[NON-OK]" : "[OK]";
    console.log(`${label} ${req.method} ${req.url} -> ${code}`);
  });
  next();
}

export function middlewareErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
) {
  let statusCode = 500;
  let message = "Something went wrong on our end";

  if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof UserNotAuthenticatedError) {
    statusCode = 401;
    message = err.message;
  } else if (err instanceof UserForbiddenError) {
    statusCode = 403;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  }

  if (statusCode >= 500) {
    console.error(
      `\n[ERROR] ${req.method} ${req.url} -> ${statusCode}`,
      err.message,
      "\n",
    );
  }

  respondWithError(res, statusCode, message);
}

export function middlewareRequireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getBearerToken(req);
    req.auth = { userId: verifyToken(token) };
    return next();
  } catch (err: any) {
    console.error(`\n[AUTH ERROR] ${req.method} ${req.url}`, err.message, "\n");
    return next(new UserNotAuthenticatedError("Authentication required"));
  }
}

export function middlewareOptionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) return next();

    const token = getBearerToken(req);
    req.auth = { userId: verifyToken(token) };
  } catch (err: any) {
    console.error(`\n[AUTH ERROR] ${req.method} ${req.url}`, err.message, "\n");
  }
  return next();
}
