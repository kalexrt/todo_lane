---
approved_by: ""
approved_at: ""
# planned_behaviors — machine-read count of RED→GREEN cycles (B-N). Leave empty to let
# lane infer from B-N labels below; SET it when an AC becomes a regression guard so
# `lane next` knows the remaining count (frontmatter edits need no re-approval).
planned_behaviors: "4"
---
## Exec Plan — Task T-003
> Authored during planning, before any code. ★GATE: DEV/SA approve via `lane approve` BEFORE any code (lane writes the stamp). Resolve all ambiguities first.

**Will build:** (mapped to each AC)
- AC-1: `POST /api/tickets` on `TicketsController`, backed by `TicketsService.create` (already exists from T-002, used there only as test seeding) — now reachable over HTTP via a DTO-validated body `{title, description?, projectId?}`. Returns 201 with the created ticket; visible in subsequent `GET /api/tickets`.
- AC-2: validation on the same endpoint — empty/whitespace-only `title` → 400 (Nest `ValidationPipe` + a DTO rule), nothing created; unknown `projectId` → 400 (service checks against `ProjectsService`), nothing created.
- AC-3: `POST /api/projects` on `ProjectsController`, backed by a new `ProjectsService.create` — DTO requires non-empty `name` and `key`; 201 with the created project; missing either → 400.
- AC-4: `frontend/src/api.ts` gains `createTicket()`; a create form component (title + description inputs) posts on submit, then triggers a refetch of tickets so the new ticket appears in To Do; form clears on success.

**Approach:** Nest `class-validator` DTOs (`CreateTicketDto`, `CreateProjectDto`) with a global `ValidationPipe({ whitelist: true })` in `main.ts`, so 400s come from the framework's declarative validation rather than hand-rolled checks (CONSTITUTION conv. 4). `TicketsService.create` gains a projectId-existence check by taking `ProjectsService` as a constructor dependency (Nest DI; both already exported from their modules). Frontend: a small `CreateTicketForm` component using controlled inputs + `useState`, calling `api.ts`'s `createTicket`, then the parent `App` refetches (no local optimistic insert — keeps single source of truth on the server, matching T-002's no-local-seed-data precedent).

**Boundaries & mocks:** unchanged from T-002 — frontend's only boundary is the tracker's HTTP API, faked via stubbed `fetch` in RTL tests. Backend integration tests run the real Nest app in-process, nothing mocked.

**Behaviors (TDD order):** B-1 first (tracer bullet), then B-2, B-3, B-4 (e2e/smoke, verified in the report)
- B-1: `POST /api/tickets` happy path — 201, created ticket has server-assigned id/status todo/default projectId, then shows up in `GET /api/tickets`.
- B-2: `POST /api/tickets` validation — empty/whitespace title → 400 nothing created; unknown projectId → 400 nothing created.
- B-3: `POST /api/projects` — 201 happy path with name+key; 400 when either is missing; nothing created on failure.
- B-4 [e2e/smoke]: browser — fill the create form, submit, see the new ticket in To Do without a manual reload, form clears.

**PR will contain:**
- `backend/src/tickets/dto/create-ticket.dto.ts`, updated `tickets.controller.ts`/`tickets.service.ts`
- `backend/src/projects/dto/create-project.dto.ts`, updated `projects.controller.ts`, new `projects.service.ts` create method
- `backend/src/main.ts` — global `ValidationPipe`
- backend integration specs colocated in `src/`
- `frontend/src/api.ts` (`createTicket`), new `CreateTicketForm` component, `App.tsx` wiring, RTL specs
- refactor: none planned beyond what T-002 already deferred (the leftover Hello World stack is untouched by this task's tests, so lane's refactor audit would still refuse removing it here; left for a dedicated cleanup)
- this exec plan + behavior spec + verification report

**Open questions / ambiguities:** none — contracts fixed by TSD S-0001.02; validation messages are an implementation detail no spec constrains.

**Path:** L (lean, default)
**Escalation signals hit (≥2 → R):** none — no ambiguity, additive blast radius, no security surface.
- [ ] Refactor pass done (on green; tests unchanged) — before PR
