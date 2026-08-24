---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-24"
approved_sha256: "00a5add77b0db90d6431db45f442d2b29c630c70a3ccdc4581bf55b0758a10a2"
---
# TSD 0003 — Multiple boards with customizable columns
> Behavior + contracts ONLY. Never name the library/method/pattern (over-spec = defeats spec-first).
> One section per PRD story. Critic anchors to this as the external executable spec.
> Story IDs are S-0003.nn — the 0003 prefix is what resolves this folder (docs/features/0003-*/),
> so the `## TSD S-0003.nn` header below must match the story ID exactly.

Shared contracts (this enhancement):
- **Boards are projects.** A "board" is exactly an existing project (`{ id, name, key }`); the
  multiple-boards story adds no new top-level container and no new backend route for listing or
  switching boards — it surfaces the existing `GET /api/projects` / `POST /api/projects` /
  `GET /api/tickets?projectId=` contracts in the frontend. The default project (fixed id `default`,
  name `Default`, key `DEF`) continues to be ensured exactly once at boot, unchanged.
- **Convention change, authorized by ADR-0003.** Story S-0003.02 replaces the fixed ticket-status
  union `'todo' | 'in_progress' | 'done'` (CONSTITUTION convention #1) with **per-board columns**.
  This is a deliberate, ADR-authorized divergence from a stated convention — never a silent one.
  `TicketStatus` widens from that closed union to `string` (a column slug on the ticket's board) in
  both the backend entity and the frontend API types. The slug-not-display-string, not-numeric-code
  discipline of convention #1 is preserved; only the *closed set* is opened to be per-board.
- **New project shape.** `Project { id: string, name: string, key: string, columns: Column[] }` where
  `Column { slug: string, label: string }` and `columns` is ordered (array order is the column order).
  `GET /api/projects` returns this shape (the response gains a `columns` field); `POST /api/projects`
  still accepts `{ name, key }` and returns the created project seeded with its initial columns.
  `Ticket` is otherwise unchanged: `{ id, projectId, title, description, status }`, except `status`
  is now `string` (a column slug), not the fixed union.
- **The status seam is unchanged in location, changed in validation.** `PATCH /api/tickets/:id/status`
  and the single `TicketsService` method behind it remain the **only** code path that may write a
  ticket's status (CONSTITUTION hard rule). The DTO's static `@IsIn(TICKET_STATUSES)` check is
  replaced by a non-empty-string DTO check; the now-dynamic "is this status a column on this
  ticket's board?" rule is a domain rule owned by the service, not the DTO (BLUEPRINT boundary rule:
  HTTP concerns stay out of services; services own domain rules).
- **Persistence.** Columns are persisted in SQLite alongside projects and tickets (ADR-0002),
  reached **only** from inside `ProjectsService` / `TicketsService` — no controller, DTO, test
  helper, or frontend code queries the database, and no new repository layer or ORM is introduced
  (BLUEPRINT boundary rule, CONSTITUTION hard rule). The schema and any default columns are created
  automatically on boot when absent; booting against an existing database neither drops nor
  duplicates columns, and never reseeds a board whose columns the user has since changed.
- `CONSTITUTION.md` (convention #1), `PRODUCT.md`, and `BLUEPRINT.md` are **read-only during this
  feature** and will be updated via `lane fold` after it lands to record the new status model and the
  columns collection — per ADR-0003.

## TSD S-0003.01 — Multiple boards (one per project)  (PRD §S-0003.01)
| Aspect | Spec |
|--------|------|
| Interfaces | **No backend contract changes.** The frontend consumes the already-shipping endpoints verbatim: `GET /api/projects` (list boards), `POST /api/projects` with `{ name, key }` (create a board), `GET /api/tickets?projectId=<id>` (tickets for the active board), and `POST /api/tickets` with `{ title, description?, projectId }` (create a ticket in the active board — `projectId` is already accepted and validated by the existing `createValidated` path, which rejects an unknown `projectId` with 400). Frontend `api.ts` gains `fetchProjects()` and `createProject({ name, key })`, and `createTicket` gains an optional `projectId` argument it forwards in the body; `Ticket`/`Project` types are re-exported from `api.ts` as today. No new backend route, no change to any status code or error case. |
| Data / State | No new persistent state. The frontend gains **view state only**: the id of the active board (a `projectId`), initialized to the default project on first load. The active board's tickets are loaded by `GET /api/tickets?projectId=`; switching boards re-queries. No ticket or project data is created or mutated by switching or listing boards — those are reads. New boards and their tickets are persisted by the existing backend writes. |
| Behavior | On load the frontend lists every project as a board and selects the default board active (AC-1). The board view shows only the active board's tickets (those whose `projectId` matches the active board), fetched with the `?projectId=` filter (AC-1, AC-3). Creating a ticket while a board is active creates it in that board (the create call carries the active `projectId`); switching to another board shows that board's tickets and not the first's, so each board keeps its own tickets (AC-3). The user can create a new board (name + key) from the UI; after creation it appears in the board list, can be selected, and starts with no tickets (AC-2). |
| Access | Unchanged — any local HTTP client, browser frontend via the `/api` prefix (dev proxy), no auth. |
| Boundaries | The frontend's only boundary remains the tracker's own HTTP API (unchanged). No new external dependency. |
| Tests | **unit/integration** (frontend): the board selector renders every project from `GET /api/projects`; selecting a board fetches that board's tickets via `?projectId=` and renders only them; creating a ticket while a board is active sends that board's `projectId`; creating a board calls `POST /api/projects` with name+key and the new board appears in the selector. **e2e** (frontend, AC-4): create two boards through the running app, add a ticket to each, switch between them, and see only the relevant tickets in each board. (Backend endpoints are unchanged and covered by their existing specs.) |

## TSD S-0003.02 — Customizable columns per board  (PRD §S-0003.02)
| Aspect | Spec |
|--------|------|
| Interfaces | **New backend surface on projects (column management):** `GET /api/projects` returns each project with its ordered `columns: [{ slug, label }, ...]` (array order = column order). `PUT /api/projects/:id/columns` sets a board's full ordered column list from a body `[{ slug, label }, ...]`, replacing the prior list; it returns the updated project. Validation on `PUT`: every column has a non-empty string `slug` and `label`; no duplicate `slug` within the request; at least one column; the referenced `:id` must name an existing project (404 otherwise); and **no column may be removed if any ticket on that board still has that column's slug as its status** — such a removal is rejected with 400 naming the offending slug (so a board never holds a ticket whose status is not one of its columns). Column slugs are immutable once a column exists within a request (rename changes `label`, not `slug`); reorder/add/rename/remove are all expressed by sending the desired ordered array. **Status-change seam changed:** `PATCH /api/tickets/:id/status` now takes `{ status: string }` (DTO validates non-empty string only); the service rejects 400 when `status` is not a column slug on the ticket's board, and 404 when the ticket id is unknown (404 before any write). Unknown `:id` on `PUT .../columns` is 404. Empty/whitespace or missing `slug`/`label`, duplicate slug, or an empty column list is 400 with no columns changed. **Frontend:** the board view renders the active board's `columns` dynamically (slug→label, in order) instead of the hardcoded To Do / In Progress / Done set; the UI lets the user add, rename, and remove columns by building the desired column array and `PUT`-ing it; the move-target buttons offer only the board's *other* current columns (a removed column is no longer offered, AC-4); a rejected `PUT` (e.g. removing a column that has tickets) surfaces the 400 to the user. `api.ts` gains `setBoardColumns(projectId, columns)`; `updateTicketStatus` keeps its signature but `status` is now a `string` slug. |
| Data / State | A **columns** collection owned per project, persisted in SQLite (ADR-0002), reached only through `ProjectsService` / `TicketsService`. Each entry is `{ projectId, slug, label, position }` (ordered by `position`; `(projectId, slug)` is unique; `slug` and `label` are non-empty text). The schema and default columns are created automatically on boot when absent and re-running boot against an existing database neither drops nor duplicates columns nor reseeds a board a user has edited. **Seeding:** the default project (`default`) is seeded with the columns `todo` / `in_progress` / `done` (labels `To Do` / `In Progress` / `Done`) so prior tickets stay valid with no migration (AC-6); a newly created board is seeded with `todo` / `done` (labels `To Do` / `Done`) as a minimal starting workflow the user can then customize. `tickets.status` remains a text column but now stores a column slug rather than one of the three fixed values. The `PUT .../columns` replace is durable before the endpoint responds; a restart retains it. |
| Behavior | The board view renders exactly the active board's columns, in order, each labelled (AC-1). The user can add, rename (label), and remove columns on a board through the UI; the board view updates to the new column set (AC-2). A ticket's status is always one of its board's current columns: the seam rejects a status not on the ticket's board with 400, and is the only code path that writes a ticket's status (AC-3). A new ticket is created in its board's first column (the column at position 0); a removed column is not offered as a move target (AC-4). Removing a column that has tickets is rejected, so the invariant in AC-3 is never violated. Ticket ids remain server-assigned and unique across restarts (ADR-0002); column slugs are unique within a board. |
| Access | Unchanged — any local HTTP client, browser frontend via the `/api` prefix, no auth. The columns collection is not exposed except through the project + ticket endpoints above. |
| Boundaries | The filesystem (the SQLite database, ADR-0002) — reached only through the two services; tests point `TRACKER_DB_PATH` at an isolated ephemeral or per-run database to stay hermetic (unchanged from TSD 0002). The frontend's only boundary remains the tracker's own HTTP API. No new external dependency. |
| Tests | **unit** (backend): a project's columns round-trip through a fresh isolated database (seed → read back with identical slug/label/order); the default project is seeded with `todo`/`in_progress`/`done` exactly once across repeated bootstraps and is not reset; a newly created project is seeded with `todo`/`done`; `PUT .../columns` accepts a valid ordered list (add/rename-label/reorder/remove-empty), rejects 400 on empty/whitespace `slug` or `label`, duplicate `slug`, empty list, and rejects 400 naming the slug when removing a column that has tickets (with columns unchanged), and 404 for an unknown project; `createValidated` lands a new ticket in its board's first column; `updateStatus` rejects 400 for a status not on the ticket's board, 404 for an unknown ticket (404 before any write), and succeeds for a valid board column. **integration** (backend): the full endpoint flow against a persistent isolated database — create board → read its seeded columns → `PUT` a `Backlog`/`Done` column set → create a ticket (lands in `Backlog`) → move it to `Done` → `PUT` again to reject removing `Done` while the ticket is in it (400) → move ticket out → remove now succeeds → reload board and see the updated columns and the ticket intact; plus a restart-equivalent flow (new app instance, same database) retaining custom columns and ticket statuses. **e2e** (frontend, AC-5): on a fresh board whose columns are `Backlog` / `Done`, create a ticket (it lands in `Backlog`), move it to `Done`, and reload the app — the board still shows its custom columns and the ticket is still in `Done`. **smoke** (required — Boundaries non-empty): with the real dev servers and a real database file, set a board's columns to `Backlog` / `Done` through the browser, create and move a ticket across them, restart the backend, reload, and confirm the custom columns and the ticket's status survive. |
