import * as personsDb from "../db/queries/persons.js";
import * as personTagsDb from "../db/queries/person_tags.js";
import * as tagsDb from "../db/queries/tags.js";
import { Person, Tag } from "../db/schema.js";
import { NotFoundError, UserForbiddenError } from "../api/errors.js";

export type PersonWithTags = Person & { tags: Tag[] };

async function hydratePerson(person: Person): Promise<PersonWithTags> {
  const personTags = await personTagsDb.getTagsByPersonId(person.id);
  return { ...person, tags: personTags };
}

async function resolveAndSyncPersonTags(
  personId: string,
  userId: string,
  tagNames: string[],
): Promise<Tag[]> {
  const resolvedTags = await Promise.all(
    tagNames.map((name) => tagsDb.findOrCreateTag(userId, name)),
  );
  await personTagsDb.syncTagsForPerson(
    personId,
    resolvedTags.map((t) => t.id),
  );
  return resolvedTags;
}

export async function addPerson(
  userId: string,
  name: string,
  birthMonth?: number | null,
  birthDay?: number | null,
  birthYear?: number | null,
  tags?: string[],
): Promise<PersonWithTags> {
  const person = await personsDb.createPerson(
    userId,
    name,
    birthMonth,
    birthDay,
    birthYear,
  );
  const resolvedTags = tags?.length
    ? await resolveAndSyncPersonTags(person.id, userId, tags)
    : [];
  return { ...person, tags: resolvedTags };
}

export async function getPersonById(id: string): Promise<PersonWithTags | null> {
  const person = await personsDb.getPersonById(id);
  if (!person) return null;
  return hydratePerson(person);
}

export async function getAllPeopleCreatedByUser(
  userId: string,
): Promise<PersonWithTags[]> {
  const people = await personsDb.getPersonsByUserId(userId);
  return Promise.all(people.map(hydratePerson));
}

export async function searchPeopleByName(
  userId: string,
  name: string,
): Promise<PersonWithTags[]> {
  const people = await personsDb.getPersonsByName(userId, name);
  return Promise.all(people.map(hydratePerson));
}

export async function updatePerson(
  userId: string,
  id: string,
  name?: string,
  birthMonth?: number | null,
  birthDay?: number | null,
  birthYear?: number | null,
  tags?: string[],
): Promise<PersonWithTags> {
  const person = await personsDb.getPersonById(id);
  if (!person) {
    throw new NotFoundError("Person not found");
  }
  if (person.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to update this person",
    );
  }
  const updated = await personsDb.updatePerson(
    id,
    name,
    birthMonth,
    birthDay,
    birthYear,
  );
  const resolvedTags =
    tags !== undefined
      ? await resolveAndSyncPersonTags(updated.id, userId, tags)
      : await personTagsDb.getTagsByPersonId(updated.id);
  return { ...updated, tags: resolvedTags };
}

function ordinalSuffix(n: number): string {
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  if (mod10 === 1) return `${n}st`;
  if (mod10 === 2) return `${n}nd`;
  if (mod10 === 3) return `${n}rd`;
  return `${n}th`;
}

export async function getUpcomingBirthdays(
  userId: string,
  limit = 5,
  daysAhead = 180,
): Promise<string[]> {
  const people = await personsDb.getPersonsByUserId(userId);

  const today = new Date();
  const todayMonth = today.getMonth() + 1; // 1-indexed
  const todayDay = today.getDate();
  const currentYear = today.getFullYear();

  type Entry = { daysUntil: number; label: string };
  const entries: Entry[] = [];

  for (const person of people) {
    const { birthMonth, birthDay, birthYear, name } = person;
    if (!birthMonth || !birthDay) continue;

    // Days until next occurrence of this month/day
    let candidateYear = currentYear;
    if (
      birthMonth < todayMonth ||
      (birthMonth === todayMonth && birthDay < todayDay)
    ) {
      candidateYear = currentYear + 1;
    }

    const nextBirthday = new Date(candidateYear, birthMonth - 1, birthDay);
    const todayMidnight = new Date(currentYear, todayMonth - 1, todayDay);
    const daysUntil = Math.round(
      (nextBirthday.getTime() - todayMidnight.getTime()) / 86_400_000,
    );

    if (daysUntil > daysAhead) continue;

    const dateStr = `${birthMonth}/${birthDay}`;

    let birthdayStr: string;
    const PLACEHOLDER_YEAR = 1900;
    if (birthYear && birthYear !== PLACEHOLDER_YEAR) {
      const age = candidateYear - birthYear;
      birthdayStr = `${dateStr} - ${name}'s ${ordinalSuffix(age)} birthday`;
    } else {
      birthdayStr = `${dateStr} - ${name}'s birthday`;
    }

    entries.push({
      daysUntil,
      label: `${daysUntil} days until ${birthdayStr}`,
    });
  }

  entries.sort((a, b) => a.daysUntil - b.daysUntil);

  return entries.slice(0, limit).map((e) => e.label);
}

export async function deletePerson(userId: string, id: string): Promise<void> {
  const person = await personsDb.getPersonById(id);
  if (!person) {
    return; // If the person doesn't exist, we can consider it "deleted"
  }
  if (person.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to delete this person",
    );
  }
  await personsDb.deletePerson(id);
}

export async function deletePeopleCreatedByUser(userId: string): Promise<void> {
  await personsDb.deletePersonsByUserId(userId);
}

export async function addTagToPerson(
  userId: string,
  personId: string,
  tagId: string,
): Promise<void> {
  const person = await personsDb.getPersonById(personId);
  if (!person) {
    throw new NotFoundError("Person not found");
  }
  if (person.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to modify this person",
    );
  }
  await personTagsDb.addTagToPerson(personId, tagId);
}

export async function removeTagFromPerson(
  userId: string,
  personId: string,
  tagId: string,
): Promise<void> {
  const person = await personsDb.getPersonById(personId);
  if (!person) {
    throw new NotFoundError("Person not found");
  }
  if (person.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to modify this person",
    );
  }
  await personTagsDb.removeTagFromPerson(personId, tagId);
}

export async function getTagsForPerson(
  userId: string,
  personId: string,
): Promise<Tag[]> {
  const person = await personsDb.getPersonById(personId);
  if (!person) {
    throw new NotFoundError("Person not found");
  }
  if (person.userId !== userId) {
    throw new UserForbiddenError(
      "You do not have permission to view this person's tags",
    );
  }
  return await personTagsDb.getTagsByPersonId(personId);
}
