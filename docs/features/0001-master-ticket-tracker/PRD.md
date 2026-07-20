---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
approved_sha256: "853b190699f9bdafe5f9fa002ae9074bc0b335ebd5086d414c85c3bf9ce62031"
---
# PRD 0001 — Barebones Jira-style Ticket Tracker
> User stories + acceptance criteria + success metrics. Signed off by PM + SA + DS.
> Feature-scoped (LANE §8): one PRD per feature/milestone, under docs/features/<FEAT>-<slug>/.

**Source:** Briefing 0001 — minimal tracker as a demo substrate for later status-transition gating
**Parent:** (none — master iteration, this is the umbrella)

---

## Story S-0001.01 — View the ticket board
As a developer running the app locally I want to see all tickets laid out in three status columns (To Do / In Progress / Done) so that I can grasp the state of the work at a glance.

**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
- [ ] AC-1 [behavior] — `GET /api/tickets` returns every ticket as JSON, each with `id`, `projectId`, `title`, `description`, and `status` (one of exactly `todo`, `in_progress`, `done`).
- [ ] AC-2 [behavior] — `GET /api/projects` returns the projects, including one default project that exists at boot without any setup call.
- [ ] AC-3 [e2e] — Opening the frontend in a browser (backend running) shows a board with three columns — To Do, In Progress, Done — and every existing ticket appears in the column matching its status.

**Success metric:** A fresh clone with both dev servers started shows the board with the seeded default project's tickets (initially empty columns) with no manual configuration.

## Story S-0001.02 — Create a ticket
As a developer I want to create a ticket with a title and description so that new work shows up on the board.

**Acceptance criteria:**
- [ ] AC-1 [behavior] — `POST /api/tickets` with a non-empty `title` (and optional `description`) creates the ticket in the default project with status `todo` and returns it (201) with a server-assigned `id`.
- [ ] AC-2 [behavior] — `POST /api/tickets` with a missing or empty `title` is rejected with 400 and creates nothing.
- [ ] AC-3 [behavior] — `POST /api/projects` with a `name` and `key` creates a project (201); `POST /api/tickets` may target it via `projectId`, and an unknown `projectId` is rejected with 400.
- [ ] AC-4 [e2e] — Submitting the board's create form with a title and description makes the new ticket appear in the To Do column without a manual page reload.

**Success metric:** A user can go from empty board to a visible ticket in one form submission.

## Story S-0001.03 — Move a ticket between statuses
As a developer I want to move a ticket between To Do, In Progress, and Done so that the board reflects the work's real state — and so the system has exactly one seam where transition rules can later be enforced.

**Acceptance criteria:**
- [ ] AC-1 [behavior] — `PATCH /api/tickets/:id/status` with body `{"status": "<todo|in_progress|done>"}` updates that ticket's status and returns the updated ticket; any valid status may move to any other (no transition rules yet, by design).
- [ ] AC-2 [behavior] — A status value outside the three allowed strings is rejected with 400 and the ticket is unchanged; an unknown ticket id returns 404.
- [ ] AC-3 [invariant] — The status-change endpoint (and the single service method behind it) is the only code path that mutates a ticket's status — generic ticket updates do not exist.
- [ ] AC-4 [e2e] — Clicking a move button on a ticket card moves the card to the target column, and the change survives a page refresh (it was persisted server-side, not just in view state).

**Success metric:** A ticket can be walked todo → in_progress → done from the browser, and adding a transition rule later requires touching only the one service method.

---

## Non-goals (out of scope for this feature)
- Authentication, users, roles, permissions.
- Persistence — in-memory storage only; state resets on restart by design.
- Ticket editing/deleting, comments, assignees, search, filters, drag-and-drop.
- Multi-project UI (API supports projects; the frontend uses the default project).
- Status-transition rules themselves — this feature builds the seam, not the rules.
