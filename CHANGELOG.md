# gift-logbook

## 4.1.0

### Minor Changes

- [#123](https://github.com/millsjpw/gift-logbook/pull/123) [`a4cc3f3`](https://github.com/millsjpw/gift-logbook/commit/a4cc3f33282aec0e772dc9f8bc4dea596a3e1bb1) Thanks [@millsjpw](https://github.com/millsjpw)! - Added read-only list sharing: the owner of a list can share it with another registered user by email, and that user can view it (but not edit) under a new "Shared with me" section. Adds a `list_shares` table, new `/lists/:id/shares` endpoints, and a share dialog on the list page.

- [#124](https://github.com/millsjpw/gift-logbook/pull/124) [`e59cabf`](https://github.com/millsjpw/gift-logbook/commit/e59cabf67c8c1c88c03266f1c09f7842f9b0b3db) Thanks [@millsjpw](https://github.com/millsjpw)! - Added shared logbooks: gift recipients ("persons") and gift-purchase history ("records") now live in a logbook rather than being owned directly by a single user. Every account gets a personal default logbook automatically, and any member can invite another registered user to share it — all members get full read/write access to that logbook's persons and records. A logbook switcher appears in the navbar once you belong to more than one, and a new "Logbooks" manager (from the user menu) lets you rename logbooks, invite or remove members, and create additional logbooks. Existing accounts were migrated automatically: each user's existing persons and records were moved into their new default logbook, preserving all data.

### Patch Changes

- [#121](https://github.com/millsjpw/gift-logbook/pull/121) [`b3150ba`](https://github.com/millsjpw/gift-logbook/commit/b3150ba8e4411815d43f897522517c56906dbf38) Thanks [@millsjpw](https://github.com/millsjpw)! - Fixed two authorization gaps: `GET /lists/:id` now requires the requester to own the list (previously any authenticated user could view any list by id), and the `/users/:id` endpoints now require the requester to be acting on their own account (previously any authenticated user could read, update, or delete any other account). Introduced a small `authz.ts` helper (`assertSelf`, `assertListAccess`) to centralize these checks ahead of upcoming list-sharing and shared-logbook features.

## 4.0.1

### Patch Changes

- [#118](https://github.com/millsjpw/gift-logbook/pull/118) [`8c30d22`](https://github.com/millsjpw/gift-logbook/commit/8c30d225d926a015f5bc367653ad9821aa8cae5a) Thanks [@millsjpw](https://github.com/millsjpw)! - Removed orphaned exchange_exclusions query code left over from the person_exclusions rework, and fixed stale test arguments that were failing `tsc --noEmit` without CI catching it.

## 4.0.0

### Major Changes

- [#115](https://github.com/millsjpw/gift-logbook/pull/115) [`79800f6`](https://github.com/millsjpw/gift-logbook/commit/79800f653811803c3f5e429751be6d9be066a30e) Thanks [@millsjpw](https://github.com/millsjpw)! - Reworked exchange_exclusions into person_exclusions so that they are tied to the person rather than the exchange. Introduced new and modified endpoints as a result. Functionality improved to allow for exchange creation, randomizing, and saving

## 3.2.0

### Minor Changes

- [#109](https://github.com/millsjpw/gift-logbook/pull/109) [`37074d9`](https://github.com/millsjpw/gift-logbook/commit/37074d9d8afed462aaed7b4dfe1bb41c9ba3c126) Thanks [@millsjpw](https://github.com/millsjpw)! - Adding the modal for Settings

- [#109](https://github.com/millsjpw/gift-logbook/pull/109) [`37074d9`](https://github.com/millsjpw/gift-logbook/commit/37074d9d8afed462aaed7b4dfe1bb41c9ba3c126) Thanks [@millsjpw](https://github.com/millsjpw)! - Adding custom tags for colors, and their API and UI updates

- [#111](https://github.com/millsjpw/gift-logbook/pull/111) [`26467fe`](https://github.com/millsjpw/gift-logbook/commit/26467fe5da0a3e6fa83617722397a5d7234f427d) Thanks [@millsjpw](https://github.com/millsjpw)! - Dark mode update

## 3.1.0

### Minor Changes

- [#108](https://github.com/millsjpw/gift-logbook/pull/108) [`5751a95`](https://github.com/millsjpw/gift-logbook/commit/5751a9570bb335972f2b22f0499c5ece4aeefdd6) Thanks [@millsjpw](https://github.com/millsjpw)! - Adding the modal for Settings

- [#108](https://github.com/millsjpw/gift-logbook/pull/108) [`5751a95`](https://github.com/millsjpw/gift-logbook/commit/5751a9570bb335972f2b22f0499c5ece4aeefdd6) Thanks [@millsjpw](https://github.com/millsjpw)! - Adding custom tags for colors, and their API and UI updates

- [#106](https://github.com/millsjpw/gift-logbook/pull/106) [`8bfd477`](https://github.com/millsjpw/gift-logbook/commit/8bfd477120ee4c81c0612458cae83b85ca23e9a5) Thanks [@millsjpw](https://github.com/millsjpw)! - Added user settings functionality to database and API

## 3.0.0

### Major Changes

- [#103](https://github.com/millsjpw/gift-logbook/pull/103) [`38b0c76`](https://github.com/millsjpw/gift-logbook/commit/38b0c76b96ab8f2edab3424f55f8504891d70959) Thanks [@millsjpw](https://github.com/millsjpw)! - Replace JWT authentication with secure HttpOnly session cookies.

  Authentication no longer uses JWT access tokens or refresh tokens stored in
  `localStorage`. Instead, the server issues a signed session cookie (`HttpOnly`,
  `Secure`, `SameSite`) on login and registration. All protected API requests
  are authenticated by validating that cookie against the sessions table.

  **Breaking changes:**
  - `POST /auth/login` and `POST /users` responses no longer include
    `accessToken` or `refreshToken` fields.
  - `POST /auth/refresh` endpoint has been removed.
  - `GET /auth/me` endpoint has been added — returns the current authenticated
    user from the active session cookie.
  - All API clients must send requests with `credentials: 'include'`
    (or equivalent) so the session cookie is forwarded.
  - Environment variables `JWT_SECRET`, `JWT_ISSUER`, `JWT_DEFAULT_DURATION`,
    and `JWT_REFRESH_DURATION` have been replaced by a single
    `SESSION_DURATION` variable (integer, seconds).
  - Existing sessions are invalidated — all users will need to log in again.

  No database schema changes are required.

## 2.0.0

### Major Changes

- [#96](https://github.com/millsjpw/gift-logbook/pull/96) [`1066806`](https://github.com/millsjpw/gift-logbook/commit/106680654a63fc77125e676f572057a0acd86941) Thanks [@millsjpw](https://github.com/millsjpw)! - Robust tagging, breaking API changes, removal of meta fields.

  Tags were the better choice, and relational tables have been created.

  Interfaces are available to add and remove tags from entities.

  Ability to edit and remove tags will come at a later date.

## 1.1.3

### Patch Changes

- [#93](https://github.com/millsjpw/gift-logbook/pull/93) [`0583a47`](https://github.com/millsjpw/gift-logbook/commit/0583a47c44fce0c2741019cc9e24430796b77da5) Thanks [@millsjpw](https://github.com/millsjpw)! - Removal of person and item count columns from My Lists

## 1.1.2

### Patch Changes

- [#91](https://github.com/millsjpw/gift-logbook/pull/91) [`a3807d1`](https://github.com/millsjpw/gift-logbook/commit/a3807d1204594dd70e7e2f432025e0615984cc35) Thanks [@millsjpw](https://github.com/millsjpw)! - Adding analytics and speed insights

## 1.1.1

### Patch Changes

- [#89](https://github.com/millsjpw/gift-logbook/pull/89) [`e49aa07`](https://github.com/millsjpw/gift-logbook/commit/e49aa07296a7c16ccdfcf968094463e0a16bc1c9) Thanks [@millsjpw](https://github.com/millsjpw)! - Navbar icon changes and other minor UI tweaks

## 1.1.0

### Minor Changes

- [#71](https://github.com/millsjpw/gift-logbook/pull/71) [`4a90d9c`](https://github.com/millsjpw/gift-logbook/commit/4a90d9c0a98747d710f1f80ae7776b973c274062) Thanks [@millsjpw](https://github.com/millsjpw)! - Add automated semantic versioning and release workflows

- [#76](https://github.com/millsjpw/gift-logbook/pull/76) [`f61f031`](https://github.com/millsjpw/gift-logbook/commit/f61f031fbad9783380093ddd5242f5905a989ddd) Thanks [@millsjpw](https://github.com/millsjpw)! - Normalize release system to single-version architecture
