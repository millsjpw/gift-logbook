import { db } from '../db.js';
import { exchangeParticipants } from '../schema.js';
import { eq, and } from 'drizzle-orm';

export async function addParticipantToExchange(exchangeId: string, personId: string) {
    const participant = {
        exchangeId,
        personId,
    };
    const [createdParticipant] = await db.insert(exchangeParticipants).values(participant).returning();
    return createdParticipant;
}

export async function getParticipantsByExchangeId(exchangeId: string) {
    const participantsList = await db.select().from(exchangeParticipants).where(eq(exchangeParticipants.exchangeId, exchangeId));
    return participantsList;
}

export async function removeParticipantFromExchange(exchangeId: string, personId: string) {
    await db.delete(exchangeParticipants).where(
        and(
            eq(exchangeParticipants.exchangeId, exchangeId),
            eq(exchangeParticipants.personId, personId)
        )
    );
}

export async function removeAllParticipantsFromExchange(exchangeId: string) {
    await db.delete(exchangeParticipants).where(eq(exchangeParticipants.exchangeId, exchangeId));
}

export async function removeAllExchangesForPerson(personId: string) {
    await db.delete(exchangeParticipants).where(eq(exchangeParticipants.personId, personId));
}