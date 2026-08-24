---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-24"
approved_sha256: "d332fad3e3c3372d10150cf2dae576bba19b73ba470eb095341b708ea200a149"
---
# TSD 0004 — Subtasks with completion gating
> Behavior + contracts ONLY. Never name the library/method/pattern (over-spec = defeats spec-first).
> One section per PRD story. Critic anchors to this as the external executable spec.
> Story IDs are S-0004.nn — the 0004 prefix is what resolves this folder (docs/features/0004-*/),
> so the `## TSD S-0004.nn` header below must match the story ID exactly.

Shared contracts (this enhancement):
- **Builds on 0001 + 0002; preserves every existing contract for parent-less tickets.** All endpoints,
  payloads, status codes, and error cases from TSD 0001/0002 stay binding and unchanged for a ticket
  that has no subtasks — this enhancement adds a parent/child relation and one status-transition rule;
  it changes no existing behavior or API shape for parent-less tickets (CONSTITUTION hard rule: no
  regression to existing behavior). Adding the optional, nullable `parentId` field below is backward-
  compatible (existing consumers that ignore unknown fields are unaffected).
- **Ticket shape gains one optional field:** `Ticket { id: string, projectId: string, title: string,
  description: string, status: 'todo' | 'in_progress' | 'done', parentId: string | null }`. `parentId`
  is `null` for a top-level ticket and the parent ticket's `id` for a subtask. Status stays the exact
  string union in stored rows and payloads (CONSTITUTION convention 1) — not numeric codes, not display
  strings. A subtask is a ticket: it has its own title, description, and status, and moves status through
  the same surfaces as any ticket.
- **One level of nesting only.** A subtask cannot have subtasks: a stored `parentId` always references a
  ticket whose own `parentId` is `null`. Creating a subtask under a ticket that is itself a subtask is
  rejected before any write.
- **A subtask belongs to its parent's project.** When a subtask is created under a named parent, its
  `projectId` is the parent's `projectId`; any `projectId` supplied in the request body is ignored for a
  subtask (the subtask inherits the parent's project). The parent must exist in the same store.
- **Subtask status moves through the SAME seam as any ticket** — `PATCH /api/tickets/:id/status` and the
  single service method behind it. There is NO subtask-only status path (CONSTITUTION hard rule: a
  ticket's status is mutated only through that one method).
- **The gating rule is enforced at that single status-change method** — the designated seam BLUEPRINT
  names for future transition gating. The rule is checked only on a parent's transition INTO `done`; it
  does not gate moves into `todo`/`in_progress`, nor moves back out of `done`. A parent already at `done`
  may still gain a subtask; the rule re-evaluates only the next time that parent is moved into `done`.
- **No new dependencies and no new persistence layer/ORM/repository abstraction** (CONSTITUTION hard
  rule). The subtask relation reuses the existing tickets storage reached only from inside
  `TicketsService`/`ProjectsService` (BLUEPRINT boundary rule, ADR-0002). No controller, DTO, test
  helper, or frontend code queries the store directly.

## TSD S-0004.01 — A ticket can have subtasks  (PRD §S-0004.01)
| Aspect | Spec |
|--------|------|
| Interfaces | `POST /api/tickets` gains an optional `parentId` in the request body; the response is the created `Ticket` (now including `parentId`). Omitting `parentId` creates a top-level ticket (`parentId: null`) exactly as before — no shape change to the existing happy path beyond the added field. `GET /api/tickets` (with or without `?projectId=`) returns every ticket — parents and subtasks alike — each now carrying its `parentId` (`null` for top-level). Validation, all rejected before any write: a `parentId` that names no existing ticket → 400, nothing created; a `parentId` that names a ticket which is itself a subtask (its `parentId` is not `null`) → 400, nothing created (one-level invariant). Title validation is unchanged (empty/whitespace `title` → 400, nothing created). |
| Data / State | The tickets store gains a parent reference per ticket (nullable; `null` = top-level). The relation is stored on the child: each subtask row carries its parent's `id`; a parent's children are the rows whose `parentId` equals the parent's `id`. `parentId` values always reference an existing top-level ticket. Creating a subtask writes exactly one new ticket row whose `projectId` equals the parent's `projectId`; no existing row is modified. |
| Behavior | Creating a subtask persists a ticket linked to the named parent and inheriting the parent's project. Listing returns subtasks alongside their parents, each tagged with `parentId`, so a client can reconstruct which tickets are subtasks of which parent and which are top-level. Nesting is capped at one level: a subtask-of-subtask request is rejected with nothing persisted. Unknown parent is rejected with nothing persisted. A subtask's status is changed through the same ticket status endpoint as any ticket. |
| Access | Unchanged — any local HTTP client; the browser frontend via the `/api` prefix (dev proxy); no auth. |
| Boundaries | Frontend: the tracker's own HTTP API (faked in frontend unit tests). Backend: the existing file-based SQLite store reached only through `TicketsService`/`ProjectsService` (BLUEPRINT, ADR-0002); id generation remains the only other nondeterminism. No new external dependency. |
| Tests | **unit** (backend): a created subtask round-trips with the correct `parentId` and inherits the parent's `projectId`; rejecting an unknown `parentId` and a subtask-of-subtask each write nothing; a top-level ticket created without `parentId` has `parentId: null`; the one-level invariant holds (a ticket whose `parentId` is set cannot itself be named as a parent). **integration** (backend): the endpoint returns 201 with the subtask (correct `parentId`, inherited project) on the happy path; 400 for unknown `parentId` (nothing created); 400 for subtask-of-subtask (nothing created); 400 for empty title still applies; the created subtask appears in `GET /api/tickets` with its `parentId`; a parent-less ticket in the same response still has `parentId: null`. **unit** (frontend): given an API response containing a parent and its subtask, the board renders the subtask nested under its parent and does NOT render the subtask as a standalone top-level card. **smoke** (required — Boundaries non-empty): with the real dev servers, create a ticket in the browser, add a subtask to it, and see the subtask shown nested beneath its parent on the board (AC-6). |

## TSD S-0004.02 — A parent cannot reach `done` until its subtasks are done  (PRD §S-0004.02)
| Aspect | Spec |
|--------|------|
| Interfaces | `PATCH /api/tickets/:id/status` — endpoint, request body, and success response shape are unchanged. New failure case: when the target status is `done` and the ticket has one or more subtasks whose status is not `done`, the response is 400 with a message indicating that incomplete subtasks block the transition. When the ticket has no subtasks, or all its subtasks are `done`, the move succeeds (200 with the updated `Ticket`) exactly as before. Moves into `todo` or `in_progress` are never gated. |
| Data / State | On a rejected move, nothing is written — the parent's status is unchanged and no subtask is modified (404-before-write semantics are unchanged: an unknown ticket id still 404s with nothing written, and that check precedes the gating check). On a successful move, only the target ticket's `status` changes; no other ticket and no subtask is modified. |
| Behavior | A parent ticket may move freely among `todo`/`in_progress` regardless of its subtasks. The gating rule applies only to a parent's transition INTO `done`: it is blocked while any subtask is not `done`, and permitted once every subtask is `done`. A ticket with no subtasks is wholly unaffected — it reaches `done` exactly as before (no regression to existing behavior or API shape for parent-less tickets, CONSTITUTION hard rule). The rule is evaluated at the moment of the `done` transition only; it does not auto-progress or auto-reopen a parent when a subtask later changes. The frontend, on a 400 from a blocked move-to-`done`, surfaces the reason (incomplete subtasks) to the user rather than failing silently; once the blocking subtasks are `done`, the same move succeeds. |
| Access | Unchanged — any local HTTP client; browser via `/api`; no auth. |
| Boundaries | Frontend: the tracker's own HTTP API (faked in frontend unit tests). Backend: the existing store reached only via `TicketsService`/`ProjectsService`; the gating rule is a read of the parent's subtasks' statuses at the single status-change seam — no new external dependency. |
| Tests | **unit** (backend): a parent with an open subtask → 400 on move to `done` and the parent's status is unchanged; the same parent with all subtasks `done` → 200; a ticket with no subtasks → 200 (regression); a move to `in_progress` is never gated even with open subtasks; a rejected move writes nothing (parent and all subtasks unchanged); unknown ticket id still 404s before any gating read. **integration** (backend): full flow — create a parent with a subtask, move parent to `done` (400, unchanged), move the subtask to `done`, move the parent to `done` (200); a parent-less ticket moves to `done` unchanged. **unit** (frontend): when the backend rejects a parent's move-to-`done` (open subtasks), the UI surfaces the block reason and the parent card remains in its prior column; after the subtasks are `done`, the move succeeds and the card moves. **smoke** (required — Boundaries non-empty): with the real dev servers, create a parent ticket with a subtask in the browser, attempt to move the parent to Done (blocked), move the subtask to Done, then move the parent to Done (it now succeeds) (AC-5). |
