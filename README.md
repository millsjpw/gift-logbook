# Gift Logbook API

## Instructions

Quick start — run locally

1. Clone the repository

```bash
git clone <your-repo-url>
cd gift-logbook
```

2. Install dependencies

```bash
npm install
```

3. Provide environment variables (example `.env`)

Create a `.env` file or export the values in your shell. Example `.env`:

```
PORT=3000
PLATFORM=local
DB_URL=postgres://user:pass@localhost:5432/gift_logbook
JWT_DEFAULT_DURATION=3600
JWT_REFRESH_DURATION=86400
JWT_SECRET=change-me-to-a-secure-secret
JWT_ISSUER=gift-logbook
```

4. Run database migrations

```bash
npm run migrate
```

5. Build & run

```bash
npm run build
npm start
```

Dev run (quick):

```bash
npm run dev
```

6. API docs

- Redoc UI: `http://localhost:<PORT>/docs`
- Raw OpenAPI JSON: `http://localhost:<PORT>/openapi.json`

Testing

```bash
npm test
```

Notes

- Ensure Postgres is reachable at `DB_URL` before running migrations.
- The app serves `openapi.json` and a Redoc UI at `/docs`.

## Endpoints (short reference)

Health
- `GET /health` — public, returns `OK`.

Auth
- `POST /auth/login` — body: `{ email, password }`. Returns tokens and user info.
- `POST /auth/refresh` — refresh tokens.
- `POST /auth/logout` — revoke refresh token.

Users
- `POST /users` — create user.
- `GET/PUT/DELETE /users/:id` — manage a user (auth required).

Persons — (auth required for all)
- `POST /persons` — create person.
- `GET /persons` — list your people.
- `GET /persons/search?name=...` — search.
- `GET/PUT/DELETE /persons/:id` — manage person.

Lists — (auth required for all)
- `POST /lists` — create list.
- `GET /lists` — get all lists for user.
- `GET /lists/:id` — get list by id.
- `GET /lists/person/:personId` — get lists associated with a person.
- `GET /lists/search?name="<...>"` — search lists by name.
- `PUT /lists/:id` — modify a list.
- `DELETE /lists/:id`, `DELETE /lists/:listId/items/:itemId` — delete lists and/or items.

Records
- `POST /records` — add record (auth).
- `GET /records`, `GET /records/:id`, `GET /records/person/:personId`, `GET /records/search` — retrieval (auth).
- `PUT /records/:id`, `DELETE /records/:id`, `DELETE /records/person/:personId`, `DELETE /records` — modify/delete (auth).
- `POST /records/:id/tags`, `GET /records/:id/tags`, `DELETE /records/:id/tags/:tag` — tags on records (auth).

Tags
- `POST /tags`, `GET /tags`, `GET /tags/:id`, `PUT /tags/:id`, `DELETE /tags/:id` (auth).

Exchanges
- `POST /exchanges`, `GET /exchanges`, `GET /exchanges/:id`, `PUT /exchanges/:id`, `DELETE /exchanges/:id` (auth).
- `POST /exchanges/:id/participants`, `POST /exchanges/:id/exclusions`, `GET /exchanges/:id/generate`, `POST /exchanges/:id/clone`, `POST /exchanges/:id/assignments` (auth).

For full request/response shapes, open the hosted docs at `/docs` or inspect `openapi.json`.
