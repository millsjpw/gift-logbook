# gift-logbook

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
