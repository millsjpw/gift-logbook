![CI](https://github.com/millsjpw/gift-logbook/actions/workflows/ci.yml/badge.svg) [![Release](https://github.com/millsjpw/gift-logbook/actions/workflows/release.yml/badge.svg)](https://github.com/millsjpw/gift-logbook/actions/workflows/release.yml) [![Deploy API](https://github.com/millsjpw/gift-logbook/actions/workflows/deploy-api.yml/badge.svg)](https://github.com/millsjpw/gift-logbook/actions/workflows/deploy-api.yml)

# Gift Logbook API

A REST API for tracking gifts, people, lists, and exchanges (e.g. Secret Santa).

## Motivation

My family needed a way to keep track of what we plan to get for gifts, what we _have_ bought over the years, and to be able to run "name drawing" for gift exchanges.
Nothing out there would be able to meet our specific needs, so I built it myself.

## Features

- Session-based authentication with secure HttpOnly cookies
- Gift tracking by person and list
- Tagging system
- Exchange and assignment generation
- OpenAPI documentation with Redoc UI

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Drizzle ORM
- Cookie-based sessions (HttpOnly, SameSite)
- OpenAPI (Redoc)

---

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Docs](#api-docs)
- [Testing](#testing)
- [Endpoints](#endpoints)
- [Notes](#notes)

---

## Quick Start

```bash
git clone https://github.com/millsjpw/gift-logbook.git
cd gift-logbook

# Install dependencies for both server and app
npm --prefix server install
npm --prefix app install

# Configure environment (see Environment Variables below)
cp server/.env.example server/.env  # or create server/.env manually

# Run database migrations
npm --prefix server run migrate:dev

# Start the API server and frontend in separate terminals
npm run dev:server
npm run dev:app
```

## Environment Variables

Create a `.env` file in the `server/` directory (or export these in your shell):

| Variable         | Description                               | Default |
| ---------------- | ----------------------------------------- | ------- |
| PORT             | Server port                               | 3000    |
| PLATFORM         | Runtime environment                       | local   |
| DB_URL           | PostgreSQL connection string              | —       |
| DB_URL_TEST      | Separate test DB (prevents dev data loss) | —       |
| SESSION_DURATION | Session cookie lifetime (seconds)         | —       |

### Example `server/.env`

```
PORT=3000
PLATFORM=local
DB_URL=postgres://user:pass@localhost:5432/gift_logbook
DB_URL_TEST=postgres://user:pass@localhost:5432/gift_logbook_test
SESSION_DURATION=2592000
```

## Usage

### Development

Run the API server and frontend in separate terminals:

```bash
npm run dev:server   # starts the Express API (compiles TS then runs)
npm run dev:app      # starts the Vite frontend
```

### Production

```bash
npm run build:server
npm run build:app
npm --prefix server run start
```

## API Docs

- Redoc UI: `http://localhost:<PORT>/docs`
- OpenAPI JSON: `http://localhost:<PORT>/openapi.json`

## Testing

Integration tests require a real PostgreSQL database. Set `DB_URL_TEST` to a separate database to avoid affecting dev data.

```bash
# Integration tests (requires DB_URL or DB_URL_TEST)
npm test

# Unit tests (no database required — all DB calls are mocked)
npm run test:unit
```

## Endpoints (Summary)

#### Health

- `GET /health — check service status`

#### Auth

- `POST /auth/login — login (sets session cookie)`
- `GET /auth/me — return current authenticated user`
- `POST /auth/logout — logout (clears session cookie)`

#### Users

- `POST /users — create`
- `GET /users/:id — retrieve`
- `PUT /users/:id — update`
- `DELETE /users/:id — delete`

#### Persons (auth required)

- `POST /persons — create`
- `GET /persons — list`
- `GET /persons/search?name=... — search`
- `GET /persons/upcoming-birthdays?limit=&daysAhead= — upcoming birthdays`
- `GET /persons/:id — retrieve`
- `PUT /persons/:id — update`
- `DELETE /persons/:id — delete`
- `DELETE /persons — delete all`

#### Lists (auth required)

- `POST /lists — create`
- `GET /lists — list all`
- `GET /lists/search?name=... — search`
- `GET /lists/recent?limit= — recently updated`
- `GET /lists/person/:personId — by person`
- `GET /lists/:id — retrieve`
- `PUT /lists/:id — update`
- `DELETE /lists/:id — delete list`
- `DELETE /lists/:listId/items/:itemId — delete item`
- `POST /lists/:listId/items/:itemId/tags — add tag to item`
- `DELETE /lists/:listId/items/:itemId/tags/:tagId — remove tag from item`

#### Records (auth required)

- `POST /records — create`
- `GET /records — list`
- `GET /records/:id — retrieve`
- `GET /records/person/:personId — by person`
- `GET /records/search — search`
- `PUT /records/:id — update`
- `DELETE /records/:id — delete`
- `DELETE /records/person/:personId — delete by person`
- `DELETE /records — delete all`
- `POST /records/:id/tags — add tag`
- `GET /records/:id/tags — list tags`
- `DELETE /records/:id/tags/:tag — remove tag from record`

#### Tags (auth required)

- `POST /tags — create`
- `GET /tags — list`
- `GET /tags/:id — retrieve`
- `PUT /tags/:id — update`
- `DELETE /tags/:id — delete`

#### Exchanges (auth required)

- `POST /exchanges — create`
- `GET /exchanges — list`
- `GET /exchanges/:id — retrieve`
- `PUT /exchanges/:id — update`
- `DELETE /exchanges/:id — delete`
- `POST /exchanges/:id/participants — add participants`
- `POST /exchanges/:id/exclusions — add exclusions`
- `GET /exchanges/:id/generate — generate assignments`
- `POST /exchanges/:id/clone — clone exchange`
- `POST /exchanges/:id/assignments — create assignments`

For full request/response schemas, see `/docs` or `openapi.json`.

## Notes

Ensure PostgreSQL is running and accessible via DB_URL before running migrations.
The app serves OpenAPI docs at `/docs`.

## Contributing

### Clone the repo

```bash
git clone https://github.com/millsjpw/gift-logbook
cd gift-logbook
```

### Build the project

```bash
npm run build:server
npm run build:app
```

### Run the tests

```bash
npm run test:unit   # unit tests, no DB required
npm test            # integration tests, requires DB_URL or DB_URL_TEST
```

### Submit a pull request

If you'd like to contribute, please fork the repository and open a pull request to the `main` branch.
