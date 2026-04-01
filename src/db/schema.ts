import { AnyPgColumn, pgTable, timestamp, varchar, uuid, jsonb, numeric, index, uniqueIndex, primaryKey, check, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// =====================
// Users
// =====================

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).notNull().unique(),
    hashedPassword: varchar("hashed_password", { length: 256 }).notNull(),
});

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserResponse = Omit<typeof users.$inferSelect, 'hashedPassword'>;

export function omitPassword(user: any): UserResponse {
    const { hashedPassword, ...rest } = user as any;
    return rest;
}

// =====================
// Sessions
// =====================

export const sessions = pgTable("sessions", {
    token: varchar("token", {length: 512 }).primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
    index("session_user_index").on(table.userId),
    index("session_expires_index").on(table.expiresAt),
]);

export type NewSession = typeof sessions.$inferInsert;
export type Session = typeof sessions.$inferSelect;

// =====================
// Persons
// =====================

export const persons = pgTable("persons", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    meta: jsonb("meta").notNull().default("{}"),
}, (table) => [
    index("user_person_name_index").on(table.userId, lower(table.name)),
]);

export type NewPerson = typeof persons.$inferInsert;
export type Person = typeof persons.$inferSelect;

// =====================
// Lists
// =====================

export const lists = pgTable("lists", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    personId: uuid("person_id").references(() => persons.id, { onDelete: "set null" }),
}, (table) => [
    index("user_list_name_index").on(table.userId, lower(table.name)),
    index("user_list_person_index").on(table.userId, table.personId),
]);

export type NewList = typeof lists.$inferInsert;
export type List = typeof lists.$inferSelect;

// =====================
// List Items
// =====================

export const listItems = pgTable("list_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    listId: uuid("list_id").notNull().references(() => lists.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 2048 }),
}, (table) => [
    index("user_list_item_title_index").on(table.listId, lower(table.title)),
    index("user_list_item_list_index").on(table.listId),
]);

export type NewListItem = typeof listItems.$inferInsert;
export type ListItem = typeof listItems.$inferSelect;

// =====================
// Records
// =====================

export const records = pgTable("records", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    personId: uuid("person_id").references(() => persons.id, { onDelete: "set null" }),
    itemText: varchar("item_text", { length: 256 }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }),
    date: timestamp("date").notNull(),
    meta: jsonb("meta").notNull().default("{}"),
}, (table) => [
    index("user_record_date_index").on(table.userId, table.date),
    index("user_record_person_index").on(table.userId, table.personId),
    index("person_record_index").on(table.personId),
    check("amount_non_negative", sql`${table.amount} >= 0`),
]);

export type NewGiftRecord = typeof records.$inferInsert;
export type GiftRecord = typeof records.$inferSelect;

// =====================
// Tags
// =====================

export const tags = pgTable("tags", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
}, (table) => [
    uniqueIndex("user_tag_unique").on(table.userId, lower(table.name)),
]);

export type NewTag = typeof tags.$inferInsert;
export type Tag = typeof tags.$inferSelect;

export function lower(column: AnyPgColumn) {
    return sql`lower(${column})`;
}

// =====================
// Record Tags
// =====================

export const recordTags = pgTable("record_tags", {
    recordId: uuid("record_id").notNull().references(() => records.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
    primaryKey({ columns: [table.recordId, table.tagId] }),
    index("record_tag_record_index").on(table.recordId),
    index("record_tag_tag_index").on(table.tagId),
]);

export type NewRecordTag = typeof recordTags.$inferInsert;
export type RecordTag = typeof recordTags.$inferSelect;

// =====================
// Exchanges
// =====================

export const exchanges = pgTable("exchanges", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 256 }).notNull(),
}, (table) => [
  uniqueIndex("user_exchange_unique").on(table.userId, lower(table.name)),
]);

export type NewExchange = typeof exchanges.$inferInsert;
export type Exchange = typeof exchanges.$inferSelect;

// =====================
// Exchange Participants
// =====================

export const exchangeParticipants = pgTable("exchange_participants", {
  exchangeId: uuid("exchange_id")
    .notNull()
    .references(() => exchanges.id, { onDelete: "cascade" }),

  personId: uuid("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  primaryKey({ columns: [table.exchangeId, table.personId] }),
  index("exchange_participant_exchange_index").on(table.exchangeId),
  index("exchange_participant_person_index").on(table.personId),
]);

export type NewExchangeParticipant = typeof exchangeParticipants.$inferInsert;
export type ExchangeParticipant = typeof exchangeParticipants.$inferSelect;
export type ExchangeParticipantResponse = Omit<ExchangeParticipant, "createdAt" | "updatedAt"> & { personName: string };

// =====================
// Exchange Exclusions (one-way)
// =====================

export const exchangeExclusions = pgTable("exchange_exclusions", {
  exchangeId: uuid("exchange_id")
    .notNull()
    .references(() => exchanges.id, { onDelete: "cascade" }),

  personId1: uuid("person_id_1")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),

  personId2: uuid("person_id_2")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  primaryKey({ columns: [table.exchangeId, table.personId1, table.personId2] }),
  index("exchange_exclusion_exchange_index").on(table.exchangeId),
  index("exchange_exclusion_person1_index").on(table.personId1),
  index("exchange_exclusion_person2_index").on(table.personId2),
]);

export type NewExchangeExclusion = typeof exchangeExclusions.$inferInsert;
export type ExchangeExclusion = typeof exchangeExclusions.$inferSelect;
export type ExchangeExclusionResponse = Omit<ExchangeExclusion, "createdAt" | "updatedAt"> & { personName1: string, personName2: string };

// =====================
// Exchange Assignments
// =====================

export const exchangeAssignments = pgTable("exchange_assignments", {
  exchangeId: uuid("exchange_id")
    .notNull()
    .references(() => exchanges.id, { onDelete: "cascade" }),

  round: integer("round").notNull().default(1),

  giverId: uuid("giver_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),

  receiverId: uuid("receiver_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  primaryKey({
    columns: [table.exchangeId, table.round, table.giverId],
  }),

  uniqueIndex("exchange_assignment_unique")
    .on(table.exchangeId, table.round, table.giverId),

  uniqueIndex("exchange_receiver_unique")
    .on(table.exchangeId, table.round, table.receiverId),

  index("exchange_assignment_exchange_index").on(table.exchangeId),
  index("exchange_assignment_giver_index").on(table.giverId),
  index("exchange_assignment_receiver_index").on(table.receiverId),
]);

export type NewExchangeAssignment = typeof exchangeAssignments.$inferInsert;
export type ExchangeAssignment = typeof exchangeAssignments.$inferSelect;
export type ExchangeAssignmentResponse = Omit<ExchangeAssignment, "createdAt" | "updatedAt" | "round"> & { giverName: string, receiverName: string };