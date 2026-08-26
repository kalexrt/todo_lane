---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-26"
approved_sha256: "acce8d994450bf30ef06eb0775331619c78dd5ef7694d9937bbaa5b20079b346"
---
# Patch 0004 — Add "Reviewing" ticket status/column
> A `patch` iteration — the TWO-STAMP ceremony for small, known-scope work (a bug fix, a
> tweak, one behavior, one PR). This ONE document is the ticket + TSD + task card + exec
> plan: your single `lane approve` stamp covers all of it (stamp 1 of 2; stamp 2 is the
> verification report at the end). The TDD ledger, Critic snapshot, and verify replay are
> unchanged — a patch removes redundant signatures, never proof.
> Too big for a patch? More than one story, more than ~3 behaviors, or more than one task
> → use `lane new fix` / `lane new enhancement` instead (agents: CALL THIS OUT when
> drafting; the human decides at the stamp).

**Severity:** minor
**Source:** direct user request — add a "reviewing" column to the ticket board

**Current behavior:** The ticket status union is `'todo' | 'in_progress' | 'done'` (`backend/src/tickets/ticket.entity.ts`, mirrored in `frontend/src/api.ts`), validated on `PATCH /api/tickets/:id/status` via `@IsIn(TICKET_STATUSES)` (`backend/src/tickets/dto/update-ticket-status.dto.ts`), and rendered as a 3-column board (`frontend/src/App.tsx` `COLUMNS`). There is no status between `in_progress` and `done`.
**Expected behavior:** A fourth status, `'reviewing'`, exists between `in_progress` and `done`. The backend accepts and persists it like any other status; the board renders a fourth "Reviewing" column in that position, and a ticket moved to `reviewing` appears there.
**Must NOT change:** Status transitions stay unrestricted (per PRODUCT.md, transition gating is explicitly out of scope) — any status, including `reviewing`, may move to any other status. No new dependencies, no auth, no ORM (per CONSTITUTION.md hard rules).

## TSD S-0004.01 — Add `reviewing` status value and board column
> Behavior + contracts ONLY — never the library/method/pattern. The Critic anchors to THIS
> section (snapshot frozen at `lane start`), exactly as it would to a TSD.md section.

| Aspect | Spec |
|--------|------|
| Interfaces | `PATCH /api/tickets/:id/status` (existing endpoint, unchanged shape) now accepts `status: 'reviewing'` in addition to the existing three values. |
| Data / State | `TICKET_STATUSES` const (`backend/src/tickets/ticket.entity.ts`, mirrored in `frontend/src/api.ts`) gains `'reviewing'`, inserted between `'in_progress'` and `'done'`. SQLite stores status as TEXT with no column-level CHECK constraint, so no migration is needed — existing rows are unaffected. |
| Behavior | A ticket's status can be set to `'reviewing'` via the existing PATCH endpoint and is returned as such on subsequent fetches. The frontend board (`frontend/src/App.tsx` `COLUMNS`) renders a "Reviewing" column between "In Progress" and "Done"; a ticket with status `reviewing` renders in that column. |
| Boundaries | None — no external dependencies touched. |
| Tests | Backend: PATCH accepts `'reviewing'` and persists it (supertest e2e, mirroring existing status-persistence spec pattern). Frontend: board renders the "Reviewing" column and places a `reviewing`-status ticket in it (React Testing Library, mirroring existing App.test.tsx pattern). |

## Task T-reviewing-column-xicuk5 — Add `reviewing` status value and board column
**Slice:** a complete observable behavior end-to-end + tests (full vertical)
**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
- [ ] AC-1 [behavior]: `PATCH /api/tickets/:id/status` with `{ status: 'reviewing' }` returns 200 and the ticket's persisted status is `'reviewing'` on a subsequent fetch.
- [ ] AC-2 [behavior]: The board renders a "Reviewing" column positioned between "In Progress" and "Done", and a ticket with status `reviewing` is displayed inside that column.
**Tests:** AC-1, AC-2  ← ordered; first = tracer bullet

## Execution Plan
> Approved BY the spec stamp: `lane start` copies this section verbatim into the worktree's
> exec-plan.md and carries your stamp onto it — no separate plan gate. Keep it last in this file.

**Approach:** Add `'reviewing'` to the shared `TICKET_STATUSES` const in `backend/src/tickets/ticket.entity.ts` (single source of truth the DTO's `@IsIn` already reads from) and mirror it in `frontend/src/api.ts`. Add a matching entry to the `COLUMNS` array in `frontend/src/App.tsx` between `in_progress` and `done`. No new files, no schema migration (SQLite status column is untyped TEXT).
**Boundaries & mocks:** None — real SQLite file, real HTTP round-trip in backend e2e test; real component render in frontend test. Nothing faked.
**Behaviors (TDD order):**
- B-1: Backend — failing supertest e2e asserting `PATCH /api/tickets/:id/status` with `'reviewing'` returns 200 and persists, then add `'reviewing'` to `TICKET_STATUSES` in `ticket.entity.ts` to make it pass.
- B-2: Frontend — failing RTL test asserting a "Reviewing" column renders between "In Progress" and "Done" and holds a `reviewing`-status ticket, then add `'reviewing'` to `TICKET_STATUSES` in `api.ts` and the `COLUMNS` array in `App.tsx` to make it pass.
**Open questions:** none
