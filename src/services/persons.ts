import * as personsDb from '../db/queries/persons.js';
import { Person } from '../db/schema.js';

export async function addPerson(userId: string, name: string, meta?: Record<string, unknown>): Promise<Person> {
    return await personsDb.createPerson(userId, name, meta);
}

export async function getPersonById(id: string): Promise<Person | null> {
    return await personsDb.getPersonById(id);
}

export async function getAllPeopleCreatedByUser(userId: string): Promise<Person[]> {
    return await personsDb.getPersonsByUserId(userId);
}

export async function searchPeopleByName(userId: string, name: string): Promise<Person[]> {
    return await personsDb.getPersonsByName(userId, name);
}

export async function updatePerson(userId: string, id: string, name?: string, meta?: Record<string, unknown>): Promise<Person> {
    const person = await personsDb.getPersonById(id);
    if (!person) {
        throw new Error("Person not found");
    }
    if (person.userId !== userId) {
        throw new Error("User does not own this person");
    }
    return await personsDb.updatePerson(id, name, meta);
}

export async function deletePerson(userId: string, id: string): Promise<void> {
    const person = await personsDb.getPersonById(id);
    if (!person) {
        throw new Error("Person not found");
    }
    if (person.userId !== userId) {
        throw new Error("User does not own this person");
    }
    await personsDb.deletePerson(id);
}

export async function deletePeopleCreatedByUser(userId: string): Promise<void> {
    await personsDb.deletePersonsByUserId(userId);
}