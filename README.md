# Gift Logbook API

A REST API for tracking gifts, people, lists, and exchanges (e.g. Secret Santa).

## Features
- JWT-based authentication
- Gift tracking by person and list
- Tagging system
- Exchange and assignment generation
- OpenAPI documentation with Redoc UI

## Tech Stack
- Node.js
- Express
- PostgreSQL
- Drizzle ORM
- JWT Authentication
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
git clone <your-repo-url>
cd gift-logbook
npm install
npm run migrate
npm run dev
```
## Environment Variables

Create a .env file or export these in your shell:
| Variable             | Description                      | Default      |
| -------------------- | -------------------------------- | ------------ |
| PORT                 | Server port                      | 3000         |
| PLATFORM             | Runtime environment              | local        |
| DB_URL               | PostgreSQL connection string     | —            |
| JWT_SECRET           | Secret for signing tokens        | —            |
| JWT_DEFAULT_DURATION | Access token lifetime (seconds)  | 3600         |
| JWT_REFRESH_DURATION | Refresh token lifetime (seconds) | 86400        |
| JWT_ISSUER           | Token issuer                     | gift-logbook |

### Example
```
PORT=3000
PLATFORM=local
DB_URL=postgres://user:pass@localhost:5432/gift_logbook
JWT_DEFAULT_DURATION=3600
JWT_REFRESH_DURATION=86400
JWT_SECRET=change-me-to-a-secure-secret
JWT_ISSUER=gift-logbook
```

## Running the App
### Development
```
npm run dev
```
### Production
```
npm run build
npm start
```
## API Docs
- Redoc UI: `http://localhost:<PORT>/docs`
- OpenAPI JSON: `http://localhost:<PORT>/openapi.json`

## Testing
```
npm test
```

## Endpoints (Summary)
#### Health
- `GET /health — check service status`
#### Auth
- `POST /auth/login — login`
- `POST /auth/refresh — refresh token`
- `POST /auth/logout — logout`
#### Users
- `POST /users — create`
- `GET /users/:id — retrieve`
- `PUT /users/:id — update`
- `DELETE /users/:id — delete`
#### Persons (auth required)
- `POST /persons — create`
- `GET /persons — list`
- `GET /persons/search?name=... — search`
- `GET /persons/:id — retrieve`
- `PUT /persons/:id — update`
- `DELETE /persons/:id — delete`
#### Lists (auth required)
- `POST /lists — create`
- `GET /lists — list all`
- `GET /lists/:id — retrieve`
- `GET /lists/person/:personId — by person`
- `GET /lists/search?name=... — search`
- `PUT /lists/:id — update`
- `DELETE /lists/:id — delete list`
- `DELETE /lists/:listId/items/:itemId — delete item`
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