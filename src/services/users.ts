import * as userDb from "../db/queries/users.js";
import { UserResponse } from "../db/schema.js";
import { hashPassword } from "./auth.js";

export async function addUser(name: string, email: string, password: string): Promise<UserResponse> {
    const hashedPassword = await hashPassword(password);
    const user: UserResponse = await userDb.createUser(name, email, hashedPassword);

    if (!user) {
        throw new Error("Failed to create user");
    }

    return user;
}

export async function getUserByEmail(email: string): Promise<UserResponse | null> {
    return await userDb.getUserByEmail(email);
}

export async function getUserById(id: string): Promise<UserResponse | null> {
    return await userDb.getUserById(id);
}

export async function updateUser(id: string, name?: string, email?: string, password?: string): Promise<UserResponse> {
    let hashedPassword: string | undefined;
    if (password) {
        hashedPassword = await hashPassword(password);
    }
    const updatedUser = await userDb.updateUser(id, name, email, hashedPassword);

    if (!updatedUser) {
        throw new Error("Failed to update user");
    }

    return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
    await userDb.deleteUser(id);
}