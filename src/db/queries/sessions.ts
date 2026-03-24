import { db } from '../db.js';
import { sessions, users } from '../schema.js';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { config } from '../../config.js';

export async function createSession(userId: string, token: string) {
    const session = {
        userId,
        token,
        expiresAt: new Date(Date.now() + config.session.refreshDuration * 1000),
        revokedAt: null,
    };
    const [createdSession] = await db.insert(sessions).values(session).returning();
    return createdSession;
}

export async function getSessionByToken(token: string) {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    return session;
}

export async function getUserBySessionToken(token: string) {
    const [user] = await db.select()
        .from(users)
        .innerJoin(sessions, eq(users.id, sessions.userId))
        .where(
            and(
                eq(sessions.token, token),
                isNull(sessions.revokedAt),
                gt(sessions.expiresAt, new Date())
        ))
        .limit(1);
    return user;
}

export async function revokeSession(token: string) {
    const [revokedSession] = await db.update(sessions)
        .set({ revokedAt: new Date() })
        .where(eq(sessions.token, token))
        .returning();
    return revokedSession;
}

export async function revokeAllSessionsForUser(userId: string) {
    const [result] = await db.update(sessions)
        .set({ revokedAt: new Date() })
        .where(eq(sessions.userId, userId))
        .returning();
    return result;
}