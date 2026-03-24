import { db } from '../db.js';
import { exchangeAssignments, NewExchangeAssignment } from '../schema.js';
import { eq, and, or, desc } from 'drizzle-orm';

export async function addAssignmentToExchange(exchangeId: string, giverId: string, receiverId: string) {
    const assignment: NewExchangeAssignment = {
        exchangeId,
        giverId,
        receiverId,
    };
    const [createdAssignment] = await db.insert(exchangeAssignments).values(assignment).returning();
    return createdAssignment;
}

export async function bulkInsertAssignments(exchangeId: string, assignments: { giverId: string, receiverId: string }[]) {
    const assignmentRecords = assignments.map(({ giverId, receiverId }) => ({
        exchangeId,
        giverId,
        receiverId,
    }));
    const createdAssignments = await db.insert(exchangeAssignments).values(assignmentRecords).returning();
    return createdAssignments;
}

export async function getNextRound(exchangeId: string) {
    const lastRound = await db.select()
            .from(exchangeAssignments)
            .where(
                eq(exchangeAssignments.exchangeId, exchangeId))
            .orderBy(desc(exchangeAssignments.createdAt)).limit(1);
    if (lastRound.length === 0) {
        return 1;
    }
    return lastRound[0].round + 1;
}

export async function getAssignmentsByExchangeId(exchangeId: string) {
    const assignmentsList = await db.select().from(exchangeAssignments).where(eq(exchangeAssignments.exchangeId, exchangeId));
    return assignmentsList;
}

export async function getAssignmentForGiverInExchange(exchangeId: string, giverId: string) {
    const [assignment] = await db.select().from(exchangeAssignments).where(
        and(
            eq(exchangeAssignments.exchangeId, exchangeId),
            eq(exchangeAssignments.giverId, giverId)
        )
    ).limit(1);
    return assignment;
}

export async function removeAssignmentFromExchange(exchangeId: string, giverId: string) {
    await db.delete(exchangeAssignments).where(
        and(
            eq(exchangeAssignments.exchangeId, exchangeId),
            eq(exchangeAssignments.giverId, giverId)
        )
    );
}

export async function removeAllAssignmentsFromExchange(exchangeId: string) {
    await db.delete(exchangeAssignments).where(eq(exchangeAssignments.exchangeId, exchangeId));
}

export async function removeAllExchangesForPerson(personId: string) {
    await db.delete(exchangeAssignments).where(
        or(
            eq(exchangeAssignments.giverId, personId),
            eq(exchangeAssignments.receiverId, personId)
        )
    );
}