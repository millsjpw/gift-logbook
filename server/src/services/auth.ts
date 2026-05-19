import * as argon2 from "argon2";
import crypto from "crypto";
import { UserNotAuthenticatedError } from "../api/errors.js";
import * as userDb from "../db/queries/users.js";
import * as sessionsDb from "../db/queries/sessions.js";
import { UserResponse } from "../db/schema.js";

export type LoginResult = {
  user: UserResponse;
  sessionToken: string;
};

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function verifyPassword(
  hashedPassword: string,
  password: string,
): Promise<boolean> {
  return await argon2.verify(hashedPassword, password);
}

export function makeSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const user = await userDb.getUserByEmail(email);
  if (!user) {
    throw new UserNotAuthenticatedError("Invalid email or password");
  }

  const passwordValid = await verifyPassword(user.hashedPassword, password);
  if (!passwordValid) {
    throw new UserNotAuthenticatedError("Invalid email or password");
  }

  const { hashedPassword: _pw, ...userResponse } = user;
  const sessionToken = makeSessionToken();
  await sessionsDb.createSession(user.id, sessionToken);

  return { user: userResponse, sessionToken };
}

export async function getSessionUser(
  sessionToken: string,
): Promise<UserResponse | undefined> {
  return await sessionsDb.getUserBySessionToken(sessionToken);
}

export async function logout(sessionToken: string): Promise<void> {
  try {
    await sessionsDb.revokeSession(sessionToken);
  } catch {
    // ignore — logout should never fail
  }
}
