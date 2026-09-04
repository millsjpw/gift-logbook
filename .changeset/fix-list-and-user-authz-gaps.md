---
"gift-logbook": patch
---

Fixed two authorization gaps: `GET /lists/:id` now requires the requester to own the list (previously any authenticated user could view any list by id), and the `/users/:id` endpoints now require the requester to be acting on their own account (previously any authenticated user could read, update, or delete any other account). Introduced a small `authz.ts` helper (`assertSelf`, `assertListAccess`) to centralize these checks ahead of upcoming list-sharing and shared-logbook features.
