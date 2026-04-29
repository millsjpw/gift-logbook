import * as exchangesDb from "../db/queries/exchanges.js";
import * as exchParticipantsDb from "../db/queries/exchange_participants.js";
import * as exchAssignmentsDb from "../db/queries/exchange_assignments.js";
import * as exchExclusionsDb from "../db/queries/exchange_exclusions.js";
import {
  Exchange,
  ExchangeParticipantResponse,
  ExchangeAssignmentResponse,
  ExchangeExclusionResponse,
} from "../db/schema.js";
import { BadRequestError, NotFoundError } from "../api/errors.js";

export type FullExchange = {
  exchange: Exchange;
  participants: ExchangeParticipantResponse[];
  assignments: ExchangeAssignmentResponse[];
  exclusions: ExchangeExclusionResponse[];
};

export async function getFullExchange(
  exchangeId: string,
): Promise<FullExchange> {
  const [exchange, participants, assignments, exclusions] = await Promise.all([
    exchangesDb.getExchangeById(exchangeId),
    exchParticipantsDb.getParticipantsByExchangeId(exchangeId),
    exchAssignmentsDb.getAssignmentsByExchangeId(exchangeId),
    exchExclusionsDb.getExclusionsByExchangeId(exchangeId),
  ]);

  if (!exchange) {
    throw new NotFoundError("Exchange not found");
  }

  return { exchange, participants, assignments, exclusions };
}

export async function createExchange(userId: string, name: string) {
  return await exchangesDb.createExchange(userId, name);
}

export async function updateExchange(exchangeId: string, name?: string) {
  return await exchangesDb.updateExchange(exchangeId, name);
}

export async function deleteExchange(exchangeId: string) {
  await exchangesDb.deleteExchange(exchangeId);
}

export async function addParticipant(exchangeId: string, personId: string) {
  return await exchParticipantsDb.addParticipantToExchange(
    exchangeId,
    personId,
  );
}

export async function setExclusions(
  exchangeId: string,
  personId: string,
  excludedPersonIds: string[],
) {
  await exchExclusionsDb.removeExclusionsForPersonInExchange(
    exchangeId,
    personId,
  );
  // bulk insert new exclusions
  const exclusions = excludedPersonIds.map((excludedId) => ({
    personId1: personId,
    personId2: excludedId,
  }));
  await exchExclusionsDb.bulkInsertExclusions(exchangeId, exclusions);
}

export async function generateAssignments(exchangeId: string) {
  const { participants, exclusions } = await getFullExchange(exchangeId);

  const previousAssignments =
    await exchAssignmentsDb.getAssignmentsByExchangeId(exchangeId);
  const participantIds = participants.map((p) => p.personId);
  const constraints = buildConstraintMap(
    participantIds,
    exclusions,
    previousAssignments ?? [],
  );

  validateParticipants(participants, constraints);

  const matching = generateMatching(participantIds, constraints);

  return Array.from(matching.entries()).map(([giverId, receiverId]) => ({
    exchangeId,
    giverId,
    receiverId,
    giverName:
      participants.find((p) => p.personId === giverId)?.personName ?? "",
    receiverName:
      participants.find((p) => p.personId === receiverId)?.personName ?? "",
  }));
}

export async function cloneExchange(exchangeId: string, userId: string) {
  const { exchange, participants, exclusions } =
    await getFullExchange(exchangeId);

  const newExchange = await exchangesDb.createExchange(
    userId,
    `${exchange.name} (Copy)`,
  );

  await exchParticipantsDb.bulkInsertParticipants(
    newExchange.id,
    participants.map((p) => p.personId),
  );
  await exchExclusionsDb.bulkInsertExclusions(
    newExchange.id,
    exclusions.map((e) => ({ personId1: e.personId1, personId2: e.personId2 })),
  );

  return newExchange;
}

export async function saveAssignments(
  exchangeId: string,
  assignments: { giverId: string; receiverId: string }[],
) {
  const nextRound = await exchAssignmentsDb.getNextRound(exchangeId);

  await exchAssignmentsDb.bulkInsertAssignments(
    exchangeId,
    assignments.map((a) => ({
      giverId: a.giverId,
      receiverId: a.receiverId,
      round: nextRound,
    })),
  );
}

export async function getAllFullExchangesForUser(userId: string) {
  const exchanges = await exchangesDb.getExchangesByUserId(userId);
  return await Promise.all(exchanges.map((e) => getFullExchange(e.id)));
}

function validateParticipants(
  participants: ExchangeParticipantResponse[],
  constraints: ConstraintMap,
) {
  if (participants.length < 2) {
    throw new BadRequestError(
      "At least 2 participants are required to generate assignments",
    );
  }

  for (const p of participants) {
    const invalid = constraints.get(p.personId) ?? new Set();

    // must have at least 1 valid receiver
    if (invalid.size >= participants.length) {
      throw new BadRequestError(
        `Participant ${p.personId} has no valid recipients due to exclusions`,
      );
    }
  }
}

type ConstraintMap = Map<string, Set<string>>;

function buildConstraintMap(
  participants: string[],
  exclusions: ExchangeExclusionResponse[],
  previousAssignments: ExchangeAssignmentResponse[],
): ConstraintMap {
  const map: ConstraintMap = new Map();

  for (const personId of participants) {
    map.set(personId, new Set([personId])); // A participant cannot be assigned to themselves
  }

  // exclusions (one-way)
  for (const e of exclusions) {
    map.get(e.personId1)?.add(e.personId2);
  }

  // previous recipients
  for (const a of previousAssignments) {
    map.get(a.giverId)?.add(a.receiverId);
  }

  return map;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function tryGenerate(
  participantIds: string[],
  constraints: ConstraintMap,
): Map<string, string> | null {
  const receivers = shuffle(participantIds);
  const result = new Map<string, string>();

  for (let i = 0; i < participantIds.length; i++) {
    const giver = participantIds[i];
    const receiver = receivers[i];

    if (constraints.get(giver)?.has(receiver)) {
      return null; // invalid assignment
    }
    result.set(giver, receiver);
  }
  return result;
}

function generateMatching(
  participantIds: string[],
  constraints: ConstraintMap,
  maxAttempts = 1000,
): Map<string, string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const assignment = tryGenerate(participantIds, constraints);
    if (assignment) {
      return assignment;
    }
  }
  throw new BadRequestError(
    "Failed to generate valid assignments: too many exclusions or constraints",
  );
}
