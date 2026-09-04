---
"gift-logbook": minor
---

Added read-only list sharing: the owner of a list can share it with another registered user by email, and that user can view it (but not edit) under a new "Shared with me" section. Adds a `list_shares` table, new `/lists/:id/shares` endpoints, and a share dialog on the list page.
