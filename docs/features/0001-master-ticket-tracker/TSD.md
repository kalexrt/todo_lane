---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
approved_sha256: "c7f6ba4313fc1691de1cd6967f3824e6019bf1417e65a1f8adf8089b451f8bd1"
---
# TSD 0001 — Barebones Jira-style Ticket Tracker
> Behavior + contracts ONLY. Never name the library/method/pattern (over-spec = defeats spec-first).
> One section per PRD story. Critic anchors to this as the external executable spec.

Shared contracts (all stories):
- Two containers per BLUEPRINT: a backend HTTP API (all routes under `/api`) and a browser frontend that consumes it. The frontend holds no domain rules.
- Ticket status is the string union `todo | in_progress | done` in every payload (CONSTITUTION convention 1).
- All state is in-memory inside the backend; it resets on process restart (PRODUCT scope). No database.
- Shapes: `Project { id: string, name: string, key: string }`, `Ticket { id: string, projectId: string, title: string, description: string, status: <union above> }`.

## TSD S-0001.01 — View the ticket board  (PRD §S-0001.01)
| Aspect | Spec |
|--------|------|
| Interfaces | `GET /api/projects` → 200, JSON array of Project. `GET /api/tickets` → 200, JSON array of Ticket; optional `?projectId=<id>` filters to that project. |
| Data / State | In-memory project and ticket collections. One default project (fixed name/key) exists at boot with no setup call; tickets start empty. |
| Behavior | Both list endpoints return current state, every ticket carries a status from the union. The frontend renders a single page with three columns labeled To Do / In Progress / Done and places each fetched ticket in the column matching its status; it fetches from the API on load (no local seed data). |
| Access | Any local HTTP client; browser frontend in dev reaches the API via an `/api` proxy or CORS — no auth. |
| Boundaries | Frontend's only boundary is the tracker's own HTTP API — faked in frontend unit tests. Backend has none (no clock/network/filesystem dependencies beyond serving HTTP). |
| Tests | unit/integration (backend): list endpoints return seeded project and created tickets with correct shapes. unit (frontend): board renders three columns and sorts tickets into them from a faked API response. smoke: with both dev servers running, the browser shows the board and seeded project data end-to-end. |

## TSD S-0001.02 — Create a ticket  (PRD §S-0001.02)
| Aspect | Spec |
|--------|------|
| Interfaces | `POST /api/tickets` body `{ title: string, description?: string, projectId?: string }` → 201 with the created Ticket (server-assigned unique `id`, status `todo`, `projectId` defaulting to the default project). `POST /api/projects` body `{ name: string, key: string }` → 201 with the created Project. |
| Data / State | Appends to the in-memory collections; no other state touched. |
| Behavior | Missing/empty/whitespace `title` → 400, nothing created. Unknown `projectId` → 400, nothing created. Missing `name` or `key` on project creation → 400. Created tickets appear in subsequent `GET /api/tickets`. The frontend's create form (title + description inputs) submits to the API and the new ticket appears in the To Do column without a manual page reload; the form clears on success. |
| Access | Same as S-0001.01 — any local client, no auth. |
| Boundaries | Frontend: the tracker's own HTTP API (faked in unit tests). Backend: id generation is the only nondeterminism; ids need only be unique per process. |
| Tests | integration (backend): 201 happy path (default + explicit project), 400 for empty title and unknown projectId, created ticket visible in the list. unit (frontend): submitting the form calls the API and the board shows the new ticket from the refreshed/returned data. smoke: create a ticket from the real browser form and see it in To Do. |

## TSD S-0001.03 — Move a ticket between statuses  (PRD §S-0001.03)
| Aspect | Spec |
|--------|------|
| Interfaces | `PATCH /api/tickets/:id/status` body `{ status: "todo" \| "in_progress" \| "done" }` → 200 with the updated Ticket. This is the ONLY write surface for status — no generic ticket-update endpoint exists. |
| Data / State | Mutates exactly one ticket's `status` field in the in-memory collection. |
| Behavior | Any of the three statuses may move to any other (no transition rules yet — that is the future feature this seam exists for). Status outside the union → 400 and the ticket is unchanged. Unknown ticket id → 404. All status mutation funnels through one domain operation behind this endpoint (BLUEPRINT boundary rule), so future gating touches exactly one place. Frontend: each ticket card shows move actions for the other two statuses; activating one calls the endpoint and the card moves to the target column; the new status is server-held, so it survives a page refresh. |
| Access | Same as other stories — any local client, no auth. |
| Boundaries | Frontend: the tracker's own HTTP API (faked in unit tests). Backend: none. |
| Tests | integration (backend): each legal move returns 200 and persists across a subsequent GET; 400 invalid status leaves ticket unchanged; 404 unknown id; no other route can change status. unit (frontend): move action triggers the status call and re-renders the ticket in the target column. smoke: walk one ticket todo → in_progress → done in the browser, refresh, and confirm it stays in Done. |
