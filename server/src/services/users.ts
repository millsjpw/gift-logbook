import * as userDb from "../db/queries/users.js";
import { UserResponse } from "../db/schema.js";
import { hashPassword, makeSessionToken, LoginResult } from "./auth.js";
import * as sessionsDb from "../db/queries/sessions.js";
import { NotFoundError } from "../api/errors.js";

export async function addUser(
  name: string,
  email: string,
  password: string,
): Promise<LoginResult> {
  const hashedPassword = await hashPassword(password);
  const user = await userDb.createUser(name, email, hashedPassword);

  const sessionToken = makeSessionToken();
  await sessionsDb.createSession(user.id, sessionToken);

  return { user, sessionToken };
}

export async function getUserByEmail(email: string): Promise<UserResponse> {
  const user = await userDb.getUserByEmail(email);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function getUserById(id: string): Promise<UserResponse> {
  return await userDb.getUserById(id);
}

export async function updateUser(
  id: string,
  name?: string,
  email?: string,
  password?: string,
): Promise<UserResponse> {
  let hashedPassword: string | undefined;

  if (password) {
    hashedPassword = await hashPassword(password);
  }

  return await userDb.updateUser(id, name, email, hashedPassword);
}

export async function deleteUser(id: string): Promise<void> {
  await userDb.deleteUser(id);
}
