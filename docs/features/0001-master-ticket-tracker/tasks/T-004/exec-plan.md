---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
# planned_behaviors — machine-read count of RED→GREEN cycles (B-N). Leave empty to let
# lane infer from B-N labels below; SET it when an AC becomes a regression guard so
# `lane next` knows the remaining count (frontmatter edits need no re-approval).
planned_behaviors: "3"
approved_sha256: "22f7ee8c5d580284b8fef30020e060a1c1995944d73a7d5eb8e260e76f54488b"
---
## Exec Plan — Task T-004
> Authored during planning, before any code. ★GATE: DEV/SA approve via `lane approve` BEFORE any code (lane writes the stamp). Resolve all ambiguities first.

**Will build:** (mapped to each AC)
- AC-1: `PATCH /api/tickets/:id/status` on `TicketsController`, backed by a new `TicketsService.updateStatus(id, status)` — the only place that mutates a ticket's status. Any valid status may move to any other (no transition rules — the future feature this endpoint's existence sets up). Persists in the in-memory collection; visible in subsequent `GET`.
- AC-2: DTO-validated status (`UpdateTicketStatusDto`, `@IsIn(TICKET_STATUSES)`) → 400 on an invalid value, ticket unchanged; unknown ticket id → 404 (`NotFoundException` from the service).
- AC-3 (invariant, not a RED→GREEN cycle): enforced by construction — `updateStatus` is the only method that writes `status`; `create()` sets it once (`todo`) and never touches it again. Covered implicitly by B-1/B-2's tests (no other endpoint exists that could mutate status) — no separate guard test needed beyond what B-1/B-2 already prove; noted in the report rather than a dedicated regression test, since there is no alternate code path to assert the absence of.
- AC-4: `frontend/src/api.ts` gains `updateTicketStatus(id, status)`; each ticket card gets buttons for its two non-current statuses; clicking one calls the API then refetches (same refetch-not-optimistic pattern as T-003) so the move persists and survives a refresh.

**Approach:** same conventions as T-002/T-003 — Nest DTO + `ValidationPipe`, service owns the domain rule, controller stays thin. `updateStatus` looks up the ticket by id (throws `NotFoundException` if absent) and mutates its `status` field in place — this is intentionally the *only* write path to `status`, matching the BLUEPRINT boundary rule and setting up the seam for later transition gating (a single `if` in this one method). Frontend: extend the existing ticket `<li>` markup with two `<button>`s (one per non-current status), no new component needed — small enough to stay inline in `App.tsx`.

**Boundaries & mocks:** unchanged from T-002/T-003 — frontend's only boundary is the tracker's HTTP API, faked via stubbed `fetch` in RTL tests. Backend integration tests run the real Nest app in-process, nothing mocked.

**Behaviors (TDD order):** B-1 first (tracer bullet), then B-2, B-3 (e2e/smoke, verified in the report)
- B-1: `PATCH /api/tickets/:id/status` happy path — 200, each of the three statuses reachable from each other, persists across a subsequent `GET`.
- B-2: validation — invalid status string → 400 unchanged; unknown ticket id → 404.
- B-3 [e2e/smoke]: browser — click a move button, card moves column, refresh the page, card stays in the new column.

**PR will contain:**
- `backend/src/tickets/dto/update-ticket-status.dto.ts`, updated `tickets.controller.ts`/`tickets.service.ts`
- backend integration specs colocated in `src/`
- `frontend/src/api.ts` (`updateTicketStatus`), `App.tsx` move buttons, RTL specs
- this exec plan + behavior spec + verification report

**Open questions / ambiguities:** none — contracts fixed by TSD S-0001.03; button labels/placement are implementation detail no spec constrains.

**Path:** L (lean, default)
**Escalation signals hit (≥2 → R):** none — no ambiguity, additive blast radius, no security surface.
- [ ] Refactor pass done (on green; tests unchanged) — before PR
