---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-29"
approved_sha256: "a7b86ab7c74eee83df75670d97bcffb89f294a0f59c0d160a0db15d3f44258ef"
---
# TSD 0002 — Persist tickets and projects in SQLite
> Behavior + contracts ONLY. Never name the library/method/pattern (over-spec = defeats spec-first).
> One section per PRD story. Critic anchors to this as the external executable spec.
> Story IDs are S-0002.nn — the 0002 prefix is what resolves this folder (docs/features/0002-*/),
> so the `## TSD S-0002.nn` header below must match the story ID exactly.

Shared contracts (this enhancement):
- **This is a storage change, not a behavior or API change.** Every contract in TSD 0001
  (`GET /api/projects`, `POST /api/projects`, `GET /api/tickets` with optional `?projectId=`,
  `POST /api/tickets`, `PATCH /api/tickets/:id/status`, and every status code and error case
  they specify) stays exactly as written and remains binding. Nothing in the request/response
  shapes, status codes, or frontend behavior changes.
- **Supersedes** TSD 0001's shared contract line "All state is in-memory inside the backend;
  it resets on process restart. No database." State now lives in a file-based SQLite database
  (CONSTITUTION stack, ADR-0002) and survives process restarts.
- Shapes are unchanged: `Project { id: string, name: string, key: string }`,
  `Ticket { id: string, projectId: string, title: string, description: string, status: 'todo' | 'in_progress' | 'done' }`.
  Status stays that exact string union in stored rows as well as in payloads (CONSTITUTION
  convention 1) — not numeric codes, not display strings.
- The database is reached **only** from inside `TicketsService` / `ProjectsService`
  (BLUEPRINT boundary rule, ADR-0002). No controller, DTO, test helper, or frontend code
  queries it directly, and no new persistence layer/ORM/repository abstraction is introduced.
  The services' existing public methods keep their names, parameters, and return shapes, so
  their callers (controllers, tests) are unaffected; only their internals change.
- `PATCH /api/tickets/:id/status` and the single service method behind it remain the only code
  path that may write a ticket's status (CONSTITUTION hard rule) — persisting a status change
  happens inside that one method, not in a second write path.

## TSD S-0002.01 — Tickets and projects survive a backend restart  (PRD §S-0002.01)
| Aspect | Spec |
|--------|------|
| Interfaces | **No HTTP contract changes** — every endpoint, payload, status code, and error case from TSD 0001 is preserved verbatim (AC-1). The services' public surfaces are likewise unchanged: projects expose list / existence-check / create, tickets expose list-with-optional-project-filter / create / validated-create / single status change, all with the same return shapes. One new configuration input: the database location is read from a single backend environment variable, defaulting to a fixed file path inside the backend package when unset; a value selecting an ephemeral (non-file) database is accepted so tests can run isolated. |
| Data / State | A file-based SQLite database owned by the backend package, holding one table per domain collection: projects (`id` primary key, `name`, `key`) and tickets (`id` primary key, `projectId`, `title`, `description`, `status`), mirroring the shapes above one column per field. Both the database file (and any directory it needs) and the schema are created automatically on boot when absent, so a fresh checkout with no database boots cleanly (PRD success metric); an existing database is opened and its rows are used as-is. Startup is idempotent: re-running it against an existing database neither drops nor duplicates data. The database file is local developer state and is not committed. |
| Behavior | Reads (list projects, list tickets, filter tickets by project) return the rows currently in the database, so data created in one process run is visible in the next (AC-3). Writes (create project, create ticket, change ticket status) are durably recorded before the endpoint responds, so a restart immediately afterward retains them; `PATCH .../status` changes exactly one ticket's status row and leaves every other field and every other ticket untouched. All validation and error behavior is unchanged and must reject **before** any write: empty/whitespace title → 400 with no ticket persisted, unknown `projectId` → 400 with no ticket persisted, status outside the union → 400 with the stored ticket unchanged, unknown ticket id → 404 with nothing written, missing project `name`/`key` → 400 with no project persisted (AC-1). The default project (fixed id, name, and key, as in TSD 0001) is *ensured* at boot rather than inserted: after any number of restarts against the same database it exists exactly once, and a user-edited or user-created project is never overwritten or re-seeded (AC-2). Ticket ids remain server-assigned and unique; uniqueness now holds across process runs sharing a database, not just within one process. |
| Access | Unchanged — any local HTTP client, browser frontend via the `/api` prefix (dev proxy), no auth. The database itself is not exposed over HTTP and has no network listener: only the backend process reads or writes it, through the two services. |
| Boundaries | **The filesystem** — a durable local database file (and its parent directory) that the backend creates, opens, and writes. This is the one external dependency this enhancement adds; it is reached through the services only, and unit/integration tests point the configured location at an isolated ephemeral or per-run database so they stay hermetic and order-independent (ADR-0002 consequence). Id generation remains the only other nondeterminism. The frontend's only boundary is still the tracker's own HTTP API. |
| Tests | **unit** (backend): schema/bootstrap logic creates the schema when absent and is safe to re-run against an existing database; the default project is ensured exactly once across repeated bootstraps and is not duplicated or reset; each service's read/write methods round-trip a record through a fresh isolated database (create → read back with identical field values, including status as the exact union string), and rejected input writes nothing. **integration** (backend): the full existing endpoint suite from TSD 0001 continues to pass unchanged against the persistent store — list/create projects, list/create/filter tickets, each legal status move, and every error case (400 empty title, 400 unknown projectId, 400 invalid status with the ticket unchanged, 404 unknown ticket id) — plus a restart-equivalent flow: write through the API, tear the application down, build a *new* application instance against the *same* database, and read the same projects and tickets back with their statuses intact. Each integration spec uses its own isolated database, and a run against a location with no pre-existing database file succeeds. **smoke** (required — Boundaries non-empty): with the real dev servers and a real database file, create a ticket through the browser, move it to In Progress, stop and restart the backend process, reload the frontend, and see the ticket still present and still In Progress (AC-3); then confirm the default project still appears exactly once. |
