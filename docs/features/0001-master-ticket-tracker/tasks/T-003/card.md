---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
approved_sha256: "6756d8903f9c2a88ad2171e3f2422348242cf975fa3f53de71a3a586fdefe1bd"
---
## Task T-003 — Create a ticket
**Parent:** story S-0001.02 · feature 0001-master-ticket-tracker (docs/features/0001-master-ticket-tracker/ — its PRD + TSD)
**Slice:** full vertical — creation endpoints with validation on the backend, create form on the board, new ticket visible in To Do without reload.
**Acceptance criteria:** (tag each `behavior`/`invariant`/`non-functional`/`e2e`)
- [ ] AC-1 [behavior]: `POST /api/tickets` with a non-empty `title` (optional `description`) returns 201 with the created ticket — server-assigned unique `id`, status `todo`, `projectId` defaulting to the default project — and the ticket appears in subsequent `GET /api/tickets`.
- [ ] AC-2 [behavior]: missing/empty/whitespace `title` → 400 and nothing is created; unknown `projectId` → 400 and nothing is created.
- [ ] AC-3 [behavior]: `POST /api/projects` with `name` and `key` returns 201 with the created project; missing `name` or `key` → 400.
- [ ] AC-4 [e2e]: submitting the board's create form (title + description) makes the new ticket appear in the To Do column without a manual page reload, and the form clears on success.
**End-to-end AC:** AC-4 [e2e] — reachable through the running app.
**Tests:** AC-1, AC-2, AC-3, AC-4  ← ordered; first = tracer bullet (happy-path create). AC-4's browser path verified as smoke in the verification report; its form behavior unit-tested with a faked API.
**Test scope:** backend/test/ (supertest integration) + frontend/src/ colocated *.test.tsx
**Done =** reviewable PR, all tests pass, links to chain. One PR per task (default).
