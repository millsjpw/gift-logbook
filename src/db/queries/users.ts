import { db } from '../db.js';
import { NewUser, users } from '../schema.js';
import { eq } from 'drizzle-orm';

export async function createUser(name: string, email: string, hashedPassword: string) {
    const user: NewUser = {
        name,
        email,
        hashedPassword,
    };
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
}

export async function getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
}

export async function getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
}

export async function updateUser(id: string, name?: string, email?: string, hashedPassword?: string) {
    const updateData: Partial<NewUser> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (hashedPassword) updateData.hashedPassword = hashedPassword;

    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return updatedUser;
}

export async function deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id));
}