import { db } from "../db.js";
import {
  exchangeParticipants,
  persons,
  ExchangeParticipantResponse,
} from "../schema.js";
import { eq, and } from "drizzle-orm";
import { BadRequestError } from "../../api/errors.js";

export async function addParticipantToExchange(
  exchangeId: string,
  personId: string,
) {
  const participant = {
    exchangeId,
    personId,
  };
  try {
    const [createdParticipant] = await db
      .insert(exchangeParticipants)
      .values(participant)
      .returning();
    return createdParticipant;
  } catch (error: any) {
    if (error.cause?.code === "23505") {
      throw new BadRequestError("Participant already exists in this exchange");
    }
    throw error;
  }
}

export async function bulkInsertParticipants(
  exchangeId: string,
  personIds: string[],
) {
  const participants = personIds.map((personId) => ({
    exchangeId,
    personId,
  }));
  const createdParticipants = await db
    .insert(exchangeParticipants)
    .values(participants)
    .returning();
  return createdParticipants;
}

export async function getParticipantsByExchangeId(exchangeId: string) {
  const participantsList = await db
    .select({
      exchangeId: exchangeParticipants.exchangeId,
      personId: exchangeParticipants.personId,
      personName: persons.name,
    })
    .from(exchangeParticipants)
    .where(eq(exchangeParticipants.exchangeId, exchangeId))
    .innerJoin(persons, eq(exchangeParticipants.personId, persons.id));
  return participantsList as ExchangeParticipantResponse[];
}

export async function removeParticipantFromExchange(
  exchangeId: string,
  personId: string,
) {
  await db
    .delete(exchangeParticipants)
    .where(
      and(
        eq(exchangeParticipants.exchangeId, exchangeId),
        eq(exchangeParticipants.personId, personId),
      ),
    );
}

export async function removeAllParticipantsFromExchange(exchangeId: string) {
  await db
    .delete(exchangeParticipants)
    .where(eq(exchangeParticipants.exchangeId, exchangeId));
}

export async function removeAllExchangesForPerson(personId: string) {
  await db
    .delete(exchangeParticipants)
    .where(eq(exchangeParticipants.personId, personId));
}
