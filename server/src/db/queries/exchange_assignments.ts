import { db } from '../db.js';
import { exchangeAssignments, NewExchangeAssignment, persons } from '../schema.js';
import { eq, and, or, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core'

const person1 = alias(persons, 'person1');
const person2 = alias(persons, 'person2');

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
    const assignmentsList = await db
    .select({
        exchangeId: exchangeAssignments.exchangeId,
        giverId: exchangeAssignments.giverId,
        receiverId: exchangeAssignments.receiverId,
        giverName: person1.name,
        receiverName: person2.name,
    })
    .from(exchangeAssignments)
    .where(eq(exchangeAssignments.exchangeId, exchangeId))
    .innerJoin(
        person1, eq(exchangeAssignments.giverId, person1.id)
    )
    .innerJoin(
        person2, eq(exchangeAssignments.receiverId, person2.id)
    );
    return assignmentsList;
}

export async function getAssignmentForGiverInExchange(exchangeId: string, giverId: string) {
    const [assignment] = await db.select(
        {
            exchangeId: exchangeAssignments.exchangeId,
            giverId: exchangeAssignments.giverId,
            receiverId: exchangeAssignments.receiverId,
            giverName: person1.name,
            receiverName: person2.name,
        }
    ).from(exchangeAssignments).where(
        and(
            eq(exchangeAssignments.exchangeId, exchangeId),
            eq(exchangeAssignments.giverId, giverId)
        )
    )
    .innerJoin(
        person1, eq(exchangeAssignments.giverId, person1.id)
    )
    .innerJoin(
        person2, eq(exchangeAssignments.receiverId, person2.id)
    )
    .limit(1);
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