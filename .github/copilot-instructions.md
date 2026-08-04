# Gift Logbook — Codebase Reference

## Tech Stack

| Layer    | Tech                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, React Router 7, Tailwind CSS 3 (dark mode via media), React Aria Components |
| Backend  | Express 5, TypeScript, Drizzle ORM 0.45, Neon Serverless Postgres                                       |
| Auth     | Argon2 password hashing, JWT in HTTP-only cookies                                                       |
| Build    | tsup (server → CJS), tsc + Vite (app), drizzle-kit (migrations)                                         |
| Test     | Vitest (integration + unit configs)                                                                     |
| Monorepo | npm workspaces: root, `app/`, `server/`                                                                 |

## Dev Commands

```
# Root
npm run dev           # runs both app and server concurrently
npm run dev:app       # Vite dev server
npm run dev:server    # builds server then runs with nodemon

# server/
npm run generate      # drizzle-kit generate (schema → migration file)
npm run migrate:dev   # drizzle-kit migrate
npm run migrate       # node dist/scripts/migrate.js (production)
npm run build         # tsup
npm run test          # vitest integration
npm run test:unit     # vitest unit

# app/
npm run build         # tsc -b && vite build
npm run preview       # vite preview
```

## Database Schema (14 tables)

| Table                   | Key columns                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `users`                 | id PK, name, email unique, hashedPassword                                                               |
| `sessions`              | token PK, userId FK, expiresAt, revokedAt                                                               |
| `persons`               | id PK, userId FK, name (unique per user), birthMonth/Day/Year (nullable, checked), tags via join        |
| `person_exclusions`     | personId1+personId2 composite PK; "person1 cannot give to person2" — **global to person, not exchange** |
| `tags`                  | id PK, userId FK, name (unique per user), color (default blue)                                          |
| `person_tags`           | personId+tagId composite PK                                                                             |
| `lists`                 | id PK, userId FK, personId FK (nullable), name (unique per user)                                        |
| `list_items`            | id PK, listId FK cascade, title, url nullable                                                           |
| `list_item_tags`        | listItemId+tagId composite PK                                                                           |
| `records`               | id PK, userId FK, personId FK (nullable, set null on delete), itemText, amount (numeric ≥0), date       |
| `record_tags`           | recordId+tagId composite PK                                                                             |
| `exchanges`             | id PK, userId FK, name (unique per user)                                                                |
| `exchange_participants` | exchangeId+personId composite PK                                                                        |
| `exchange_assignments`  | exchangeId+round+giverId composite PK; assignments are per-round so multiple saves increment round      |

Migrations live in `server/src/db/migrations/`, currently 0000–0010.

## Server Structure

```
server/src/
  index.ts                  — Express app + all route definitions
  api/
    auth.ts                 — login, me, logout handlers
    users.ts                — CRUD user handlers
    persons.ts              — CRUD persons + upcoming birthdays + GET/PUT /persons/:id/exclusions
    lists.ts                — CRUD lists + items + item tags
    records.ts              — CRUD records + record tags
    tags.ts                 — CRUD tags
    exchanges.ts            — CRUD exchanges + participants + generate/clone/save assignments
    middleware.ts           — middlewareRequireAuth, middlewareLogResponses, middlewareErrorHandler
    errors.ts               — BadRequestError(400), UserNotAuthenticatedError(401), UserForbiddenError(403), NotFoundError(404)
    cookies.ts              — SESSION_COOKIE constant + cookie options
    json.ts                 — respondWithJSON helper
  services/
    auth.ts                 — hashPassword, verifyPassword, makeSessionToken, login, logout
    users.ts                — addUser (hashes pw, creates session), CRUD
    persons.ts              — addPerson, updatePerson, getUpcomingBirthdays, getExclusions, setExclusions; hydratePerson adds tags
    lists.ts                — createList (with items), hydrateItems adds tags per item, CRUD
    records.ts              — addRecord, hydrateRecord adds tags, CRUD
    tags.ts                 — CRUD tags
    exchanges.ts            — getFullExchange, generateAssignments (Secret Santa algorithm), cloneExchange, saveAssignments
  db/
    schema.ts               — All Drizzle table definitions and inferred types
    db.ts                   — Drizzle client instantiation
    queries/
      users.ts              — createUser, getUserByEmail, getUserById, updateUser, deleteUser
      sessions.ts           — createSession, getSessionByToken, getUserBySessionToken, isSessionValid, revokeSession
      persons.ts            — createPerson, getPersonsByUserId, getPersonById, getPersonsByName, updatePerson, deletePerson
      person_exclusions.ts  — getExclusionsForPerson, getExclusionsByPersonIds (batch), setExclusionsForPerson (full replace), deleteAllExclusionsForPerson
      person_tags.ts        — getTagsByPersonId, syncTagsForPerson
      lists.ts              — CRUD lists
      list_items.ts         — CRUD list items, bulkInsertListItems
      list_item_tags.ts     — addTagToListItem, syncTagsForListItem, removeTagFromListItem
      records.ts            — CRUD records
      record_tags.ts        — addTagToRecord, syncTagsForRecord, removeTagFromRecord
      tags.ts               — CRUD tags, findOrCreateTag
      exchanges.ts          — CRUD exchanges
      exchange_participants.ts — addParticipantToExchange, bulkInsertParticipants, getParticipantsByExchangeId, removeParticipantFromExchange
      exchange_assignments.ts  — bulkInsertAssignments (requires round field), getNextRound, getAssignmentsByExchangeId
    migrations/             — SQL files 0000–0010
  config/
    db.ts                   — dbConfig from env (DB_URL)
    env.ts                  — requireEnv, optionalEnv, requireNumber helpers
    runtime.ts              — central config object: api.port, session.duration, db.url
  scripts/
    migrate.ts              — production migration runner
  types/
    express.d.ts            — augments Request with auth?: { userId }
```

## API Routes

```
POST   /auth/login                             — no auth required
GET    /auth/me                                — no auth required
POST   /auth/logout                            — no auth required
POST   /users                                  — signup, no auth required

GET/PUT/DELETE  /users/:id
POST   /persons                                — create person (name required, birthMonth/Day/Year + tags optional)
GET    /persons                                — all persons for logged-in user
GET    /persons/search?name=                   — search by name
GET    /persons/upcoming-birthdays
GET    /persons/:id
PUT    /persons/:id
GET    /persons/:id/exclusions                 — get person's exclusions
PUT    /persons/:id/exclusions                 — set person's exclusions { excludedPersonIds: string[] } (full replace)
DELETE /persons/:id

POST/GET/PUT/DELETE  /lists
GET    /lists/search?name=
GET    /lists/recent
GET    /lists/person/:personId
POST   /lists/:listId/items/:itemId/tags
DELETE /lists/:listId/items/:itemId/tags/:tagId
DELETE /lists/:listId/items/:itemId

POST/GET/PUT/DELETE  /records
GET    /records/search?q=
GET    /records/person/:personId
POST/GET/DELETE  /records/:id/tags

POST/GET/PUT/DELETE  /tags

POST   /exchanges                              — create exchange { name }
GET    /exchanges                              — all exchanges for user
GET    /exchanges/:id                          — FullExchange: { exchange, participants, assignments }
PUT    /exchanges/:id
DELETE /exchanges/:id
POST   /exchanges/:id/participants             — add participant { personId }
DELETE /exchanges/:id/participants/:personId   — remove participant
GET    /exchanges/:id/generate                 — run Secret Santa algorithm, returns assignments (not saved)
POST   /exchanges/:id/assignments              — save assignments { assignments: [{giverId, receiverId}] }
POST   /exchanges/:id/clone

GET    /health
GET    /openapi.json
GET    /docs                                   — Redoc UI
```

## App Structure

```
app/src/
  main.tsx                  — React 19 entry, StrictMode
  App.tsx                   — BrowserRouter, ProtectedRoute, all routes
  api/
    client.ts               — apiFetch: VITE_API_URL base, credentials: include, auto-redirect to /login on 401
    auth.ts                 — login, register, getMe, logout wrappers
  context/
    AuthContext.tsx          — user, isAuthenticated, isLoading, setUser, signOut; useAuth() hook
  models/
    Person.ts               — { id, name, timestamps, birthMonth/Day/Year, tags: Tag[] }
    List.ts                 — { id, name, userId, personId?, items: ListItem[], timestamps }
    ListItem.ts             — { id, title, url?, listId, tags: Tag[], timestamps }
    GiftRecord.ts           — { id, userId, personId?, itemText, amount: string, date, tags: Tag[], timestamps }
    Tag.ts                  — { id, name, color, userId, timestamps }
    Exchanges.ts            — Exchange, ExchangeParticipant, ExchangeAssignment, PersonExclusion, FullExchange
  pages/
    Login.tsx               — /login; login + register toggle
    Dashboard.tsx           — /; UpcomingBirthdaysCard + RecentListsCard
    MyPeople.tsx            — /people; manage persons with birthday + tags; sortable
    MyLists.tsx             — /lists; manage lists
    ListView.tsx            — /lists/:id; list items with tags
    Logbook.tsx             — /logbook; gift records; paginated (10/20/50), sortable, searchable
    GiftExchanges.tsx       — /gift-exchanges; CRUD exchanges list
    GiftExchangeView.tsx    — /gift-exchanges/:id; add/remove participants, per-person exclusions panel, randomize, save assignments
  components/
    Layout.tsx              — Navbar + main content wrapper
    Navbar.tsx              — Nav links + settings button
    PageLoader.tsx          — Loading spinner / error display
    PersonTypeahead.tsx     — Autocomplete for person name search (by ID selection internally)
    BirthdayPicker.tsx      — Birth month/day/year picker
    DatePickerInput.tsx     — Calendar-based date input
    TagInput.tsx            — Add/remove tags by name
    TagBadge.tsx            — Colored tag chip display
    ListItemCard.tsx        — List item with tags
    RecentListsCard.tsx     — Dashboard card: 5 recent lists
    UpcomingBirthdaysCard.tsx — Dashboard card: upcoming birthdays (30 days)
    SettingsModal.tsx        — Account settings modal
  utils/
    birthdate.ts            — calendarDateToFields, fieldsToCalendarDate, formatBirthday
    time.ts                 — formatTimeAgo("2 hours ago", "just now", etc.)
```

## Key Conventions

**Errors:** Custom error classes thrown in services/handlers; `middlewareErrorHandler` maps to HTTP status codes. Frontend catches and stores in component `error` state.

**Auth:** HTTP-only session cookie (`SESSION_COOKIE`). `middlewareRequireAuth` validates token against `sessions` table. `req.auth.userId` populated for all protected routes.

**Service layer pattern:** Handlers call services; services call DB queries. Handlers never touch Drizzle directly. Services handle business logic (e.g. `hydratePerson` joining tags, `generateAssignments` constraint map).

**Mutations without re-fetch:** Frontend mutates local React state after successful API calls instead of re-fetching (prevents flicker). Re-fetch only on initial load.

**Exchange assignments:** Multiple saves are supported via `round` integer. `getNextRound` reads the highest existing round and increments. `bulkInsertAssignments` **requires** `round` in each record (not defaulted).

**Person exclusions:** Stored globally on the person (`person_exclusions` table), not per-exchange. `generateAssignments` fetches them by participant IDs. Setting exclusions uses full-replace semantics (`setExclusionsForPerson` deletes then re-inserts).

**Tags:** Shared by userId. `findOrCreateTag` is used on write paths to avoid duplicates. `syncTagsForPerson/List/Record` replaces all tags atomically.

**Tailwind dark mode:** Uses `media` strategy (system preference). Always add `dark:` variants when adding color classes.
