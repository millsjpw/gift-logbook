import { db } from '../db.js';
import { NewUser, UserResponse, users, omitPassword } from '../schema.js';
import { eq } from 'drizzle-orm';

export async function createUser(name: string, email: string, hashedPassword: string) {
    const user: NewUser = {
        name,
        email,
        hashedPassword,
    };
    const [createdUser] = await db.
        insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    if (!createdUser) {
        throw new Error('User with this email already exists');
    }
    return omitPassword(createdUser) as UserResponse;
}

export async function getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
}

export async function getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) {
        throw new Error('User not found');
    }
    return omitPassword(user) as UserResponse;
}

export async function updateUser(id: string, name?: string, email?: string, hashedPassword?: string) {
    const updateData: Partial<NewUser> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (hashedPassword) updateData.hashedPassword = hashedPassword;

    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    if (!updatedUser) {
        throw new Error('User not found');
    }
    return omitPassword(updatedUser) as UserResponse;
}

export async function deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id));
}