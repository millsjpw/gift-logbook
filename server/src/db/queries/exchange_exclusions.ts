import { db } from '../db.js';
import { ExchangeExclusionResponse, exchangeExclusions, NewExchangeExclusion, persons } from '../schema.js';
import { eq, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core'

const person1 = alias(persons, 'person1');
const person2 = alias(persons, 'person2');

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
    const exclusionsList = await db.select({
        exchangeId: exchangeExclusions.exchangeId,
        personId1: exchangeExclusions.personId1,
        personId2: exchangeExclusions.personId2,
        personName1: person1.name,
        personName2: person2.name,
    }
    ).from(exchangeExclusions)
    .where(eq(exchangeExclusions.exchangeId, exchangeId))
    .innerJoin(person1, eq(exchangeExclusions.personId1, person1.id))
    .innerJoin(person2, eq(exchangeExclusions.personId2, person2.id));
    return exclusionsList as ExchangeExclusionResponse[];
}

export async function getExclusionsForPersonInExchange(exchangeId: string, personId: string) {
    const exclusionsList = await db.select({
        exchangeId: exchangeExclusions.exchangeId,
        personId1: exchangeExclusions.personId1,
        personId2: exchangeExclusions.personId2,
        personName1: person1.name,
        personName2: person2.name,
    })
    .from(exchangeExclusions)
    .innerJoin(person1, eq(exchangeExclusions.personId1, person1.id))
    .innerJoin(person2, eq(exchangeExclusions.personId2, person2.id))
    .where(
        and(
            eq(exchangeExclusions.exchangeId, exchangeId),
            eq(exchangeExclusions.personId1, personId)
        )
    );

    return exclusionsList as ExchangeExclusionResponse[];
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