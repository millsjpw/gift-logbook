import { db } from '../db.js';
import { exchangeExclusions, NewExchangeExclusion } from '../schema.js';
import { eq, and, or } from 'drizzle-orm';

export async function addExclusionToExchange(exchangeId: string, personId1: string, personId2: string) {
    const exclusion: NewExchangeExclusion = {
        exchangeId,
        personId1,
        personId2,
    };
    const [createdExclusion] = await db.insert(exchangeExclusions).values(exclusion).returning();
    return createdExclusion;
}

export async function bulkInsertExclusions(exchangeId: string, exclusions: { personId1: string, personId2: string }[]) {
    const exclusionRecords = exclusions.map(({ personId1, personId2 }) => ({
        exchangeId,
        personId1,
        personId2,
    }));
    const createdExclusions = await db.insert(exchangeExclusions).values(exclusionRecords).returning();
    return createdExclusions;
}

export async function getExclusionsByExchangeId(exchangeId: string) {
    const exclusionsList = await db.select().from(exchangeExclusions).where(eq(exchangeExclusions.exchangeId, exchangeId));
    return exclusionsList;
}

export async function getExclusionsForPersonInExchange(exchangeId: string, personId: string) {
    const exclusionsList = await db.select().from(exchangeExclusions).where(
        and(
            eq(exchangeExclusions.exchangeId, exchangeId),
            eq(exchangeExclusions.personId1, personId)
        )
    );
    return exclusionsList;
}

export async function removeExclusionFromExchange(exchangeId: string, personId1: string, personId2: string) {
    await db.delete(exchangeExclusions).where(
        and(
            eq(exchangeExclusions.exchangeId, exchangeId),
            eq(exchangeExclusions.personId1, personId1),
            eq(exchangeExclusions.personId2, personId2)
        )
    );
}

export async function removeExclusionsForPersonInExchange(exchangeId: string, personId: string) {
    await db.delete(exchangeExclusions).where(
        and(
            eq(exchangeExclusions.exchangeId, exchangeId),
            eq(exchangeExclusions.personId1, personId),
        )
    );
}