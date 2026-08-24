---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-24"
approved_sha256: "29cb50684c17564f73f47e4cd4c747509add4d4bda05a3a4c4aff399618252ea"
---
# Mini PRD 0003 — Multiple boards with customizable columns
> An `enhancement` iteration (LANE §8) — a small, scoped improvement on top of what already
> ships. Lighter than a full feature PRD: usually one story, no full success-metrics apparatus.
> Paired with TSD.md in this folder. If it grows past a couple of stories, it's a `feature` —
> create one instead.

**Parent:** 0001 (master feature) — this enhancement extends the single-board, fixed-column tracker with multiple boards (one per project) and per-board customizable columns.
**Source:** user request — the tracker currently renders one fixed three-column board (To Do / In Progress / Done) on the default project; the user wants multiple boards and the ability to customize each board's columns (todo, done, etc).

> **Convention change — requires an ADR.** Story S-0003.02 replaces the fixed ticket-status
> union `'todo' | 'in_progress' | 'done'` (Constitution #1) with per-board column definitions.
> Breaking a stated convention is a human decision, never a silent divergence; the TSD must
> ship ADR-0003 ("Replace the fixed ticket-status union with per-board columns") before that
> story's work begins. The default board is seeded with the existing three columns so prior
> data stays valid (see S-0003.02 AC-6).

---

## Story S-0003.01 — Multiple boards (one per project)
As a developer running the tracker locally I want to create and switch between multiple boards — one per project — so that I can keep separate sets of tickets for different efforts on a single tracker.

**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
> `behavior` = observable outcome through an interface. `e2e` = reachable by a real user through the running system.
- [ ] AC-1 [behavior] — The frontend lists every project as a board and lets the user select which board is active; the board view shows only the tickets belonging to the active project, reusing the existing `GET /api/projects` and `GET /api/tickets?projectId=` endpoints (no new backend route for listing or switching boards).
- [ ] AC-2 [behavior] — The user can create a new board from the UI (name + key); after creation it appears in the board list, can be selected, and starts with no tickets, reusing the existing `POST /api/projects` endpoint.
- [ ] AC-3 [behavior] — A ticket created while a board is active is created in that board's project (the create call carries the active `projectId`); switching boards shows different tickets, and each board keeps its own tickets.
- [ ] AC-4 [e2e] — Create two boards through the running app, add a ticket to each, switch between them, and see only the relevant tickets in each board.

**Success metric:** A user can run several independent boards side by side, each holding its own tickets, with no board leaking another's tickets.

---

## Story S-0003.02 — Customizable columns per board
As a developer running the tracker locally I want to define the columns (status values) for each board myself — e.g. todo, done, or any others I choose — so that a board's workflow matches the effort it tracks instead of being locked to To Do / In Progress / Done.

**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
> `behavior` = observable outcome through an interface. `e2e` = reachable by a real user through the running system.
- [ ] AC-1 [behavior] — A board owns an ordered list of columns, each a status value (machine slug, per Constitution #1's slug-not-display-string rule) plus a display label; the board view renders exactly that board's columns dynamically instead of the hardcoded To Do / In Progress / Done set.
- [ ] AC-2 [behavior] — The user can add, rename, and remove columns on a board through the UI; the board view updates to reflect the board's current columns.
- [ ] AC-3 [invariant] — A ticket's status is always one of its board's current columns; the status-change seam (`PATCH /api/tickets/:id/status` and the single service method behind it) rejects, with 400, a status that is not a column on the ticket's board — and remains the only code path that mutates a ticket's status.
- [ ] AC-4 [behavior] — A new ticket is created in the board's initial column (the first column); a column that has been removed is not offered as a move target for tickets on that board.
- [ ] AC-5 [e2e] — On a fresh board whose columns are `Backlog` / `Done`, create a ticket (it lands in `Backlog`), move it to `Done`, and reload the app: the board still shows its custom columns and the ticket is still in `Done`.
- [ ] AC-6 [invariant] — The default board is seeded with the existing columns `todo` / `in_progress` / `done`, so tickets created before this enhancement remain valid on upgrade (no orphaned statuses, no data migration required).

**Success metric:** Each board can run a workflow shaped by its owner (any number of named columns), a ticket only ever holds a status its board defines, and the existing default-board data continues to work without migration.
