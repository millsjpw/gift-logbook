import * as userDb from "../db/queries/users.js";
import * as sessionsDb from "../db/queries/sessions.js";
import { UserResponse } from "../db/schema.js";
import { hashPassword, generateToken, makeRefreshToken } from "./auth.js";
import { NotFoundError } from "../api/errors.js";

type UserWithTokens = UserResponse & {
  accessToken: string;
  refreshToken: string;
};

export async function addUser(
  name: string,
  email: string,
  password: string,
): Promise<UserWithTokens> {
  const hashedPassword = await hashPassword(password);
  const user = await userDb.createUser(name, email, hashedPassword);

  const accessToken = generateToken(user.id);
  const refreshToken = makeRefreshToken();
  await sessionsDb.createSession(user.id, refreshToken);

  return { ...user, accessToken, refreshToken };
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
