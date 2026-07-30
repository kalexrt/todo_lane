---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-30"
approved_sha256: "18f8b4229a8d1f74e3995664db077a39b87f1a86da712d24d013f12b57c298e7"
---
## Task T-sqlite-persistence-tp1eij — Tickets and projects survive a backend restart
**Parent:** story S-0002.01 · feature 0002-enhancement-sqlite-persistence (docs/features/0002-enhancement-sqlite-persistence/ — its PRD + TSD)
**Slice:** full vertical — the backend's projects/tickets state moves from in-memory arrays to a file-based SQLite database behind the existing `ProjectsService`/`TicketsService`, with no HTTP contract change, so data created through the running app is still there after the backend process restarts. Storage change only: no new endpoint, no frontend change.
**Acceptance criteria:** (tag each `behavior`/`invariant`/`non-functional`/`e2e`; behavior ACs = observable outcome through an interface — NO "calls X / saves to table Y / uses lib Z")
- [ ] AC-1 [behavior]: Every existing API behavior is unchanged — `GET /api/projects`, `POST /api/projects`, `GET /api/tickets` (with and without `?projectId=`), `POST /api/tickets`, and `PATCH /api/tickets/:id/status` return the same shapes and status codes as before, including every error case: 400 on missing/empty/whitespace title, 400 on unknown `projectId`, 400 on a status outside `todo | in_progress | done`, 400 on a project missing `name` or `key`, 404 on an unknown ticket id.
- [ ] AC-2 [behavior]: Data written through the API is readable by a *different* application instance opened against the same storage location — create a project and a ticket, move the ticket to `in_progress`, tear the app down, build a new one against the same location, and `GET /api/projects` / `GET /api/tickets` return them with every field intact and the status still `in_progress`.
- [ ] AC-3 [invariant]: A rejected request writes nothing — after each 400/404 case in AC-1, a subsequent read from a newly-opened instance shows no partial or orphan record, and in the invalid-status case the target ticket's stored status is unchanged.
- [ ] AC-4 [invariant]: The default project exists exactly once no matter how many times the backend boots against the same storage — repeated boots neither duplicate it nor reset a project the user created or changed. Booting against a location with no existing database succeeds and creates it (fresh checkout boots clean).
- [ ] AC-5 [e2e]: Through the running app: create a ticket in the browser, move it to In Progress, stop and restart the backend process, reload the frontend — the ticket is still on the board, still in In Progress, and the default project still appears exactly once.
**End-to-end AC:** AC-5 [e2e] — reachable through the running app (browser + real database file + a real process restart).
**Tests:** AC-2, AC-1, AC-4, AC-3, AC-5  ← ordered; first = tracer bullet (one record round-trips across a fresh instance — proves real persistence before breadth). AC-1 is the existing endpoint suite re-run green against the persistent store. AC-5's browser-and-restart walk is verified as smoke in the verification report; its persistence half is covered by AC-2 at the API level.
**Test scope:** backend/src/**/*.spec.ts (Jest + supertest, per-spec isolated database) — plus the existing specs in that tree, which must stay green unchanged.
<!-- approval: written by `lane approve` as frontmatter (approved_by/at/sha256) after a human confirms — never hand-edit -->
**Done =** reviewable PR, all tests pass, links to chain. One PR per task (default).
