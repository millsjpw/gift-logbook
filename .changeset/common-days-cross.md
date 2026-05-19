---
"gift-logbook": major
---

Replace JWT authentication with secure HttpOnly session cookies.

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
