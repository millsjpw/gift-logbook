import { db } from '../db.js';
import { exchangeAssignments, NewExchangeAssignment } from '../schema.js';
import { eq, and, or } from 'drizzle-orm';

export async function addAssignmentToExchange(exchangeId: string, giverId: string, receiverId: string) {
    const assignment: NewExchangeAssignment = {
        exchangeId,
        giverId,
        receiverId,
    };
    const [createdAssignment] = await db.insert(exchangeAssignments).values(assignment).returning();
    return createdAssignment;
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