---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
approved_sha256: "2342fb4bbe939ffbc47eb5dde27727f0224b270338ad9e43b174f23a3b6b2278"
---
## Task T-002 — View the ticket board
**Parent:** story S-0001.01 · feature 0001-master-ticket-tracker (docs/features/0001-master-ticket-tracker/ — its PRD + TSD)
**Slice:** full vertical — list endpoints on the backend, three-column board on the frontend, seeded default project, end-to-end in the browser.
**Acceptance criteria:** (tag each `behavior`/`invariant`/`non-functional`/`e2e`)
- [ ] AC-1 [behavior]: `GET /api/tickets` returns 200 with a JSON array of tickets, each carrying `id`, `projectId`, `title`, `description`, `status` (exactly one of `todo|in_progress|done`); optional `?projectId=` filters.
- [ ] AC-2 [behavior]: `GET /api/projects` returns 200 with a JSON array of projects including one default project (`id`, `name`, `key`) present at boot with no setup call.
- [ ] AC-3 [behavior]: the board page renders three columns labeled To Do / In Progress / Done and places each ticket fetched from the API into the column matching its status (no local seed data).
- [ ] AC-4 [e2e]: with both dev servers running, opening the frontend in a browser shows the three-column board backed by live API data.
**End-to-end AC:** AC-4 [e2e] — reachable through the running app.
**Tests:** AC-1, AC-2, AC-3  ← ordered; first = tracer bullet (backend list endpoint drives the slice). AC-4 verified as smoke in the verification report.
**Test scope:** backend/test/ (supertest integration) + frontend/src/ colocated *.test.tsx (RTL with faked API)
**Done =** reviewable PR, all tests pass, links to chain. One PR per task (default).
