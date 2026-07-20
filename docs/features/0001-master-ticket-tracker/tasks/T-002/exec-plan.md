---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
# planned_behaviors — machine-read count of RED→GREEN cycles (B-N). Leave empty to let
# lane infer from B-N labels below; SET it when an AC becomes a regression guard so
# `lane next` knows the remaining count (frontmatter edits need no re-approval).
planned_behaviors: "3"
approved_sha256: "4b0c3dbd41e01819997eaa768bdb0656bfaf57b87eaa66b642659ca2210bbfb3"
---
## Exec Plan — Task T-002
> Authored during planning, before any code. ★GATE: DEV/SA approve via `lane approve` BEFORE any code (lane writes the stamp). Resolve all ambiguities first.

**Will build:** (mapped to each AC)
- AC-1: `backend/src/tickets/` Nest module — `GET /api/tickets` returning the in-memory ticket collection (empty at boot), each ticket `{id, projectId, title, description, status}` with status from `todo|in_progress|done`; `?projectId=` filters. No create/update surface yet (T-003/T-004).
- AC-2: `backend/src/projects/` Nest module — `GET /api/projects` returning the in-memory project collection, seeded at construction with one default project (fixed name "Default", key "DEF").
- AC-3: `frontend/src/api.ts` (fetch wrapper: `fetchTickets()`) + board UI in `App.tsx` — three columns labeled To Do / In Progress / Done, tickets fetched on load and placed by status. No create form / move buttons yet (T-003/T-004).
- AC-4: smoke — both dev servers up, browser shows the live board (verification report, not a ledger cycle).

**Approach:** standard Nest module per domain (controller thin, service owns state — CONSTITUTION conv. 2); backend specs are supertest integration tests against a TestingModule app with the `/api` prefix applied, colocated under `src/` (NOTE: the card's "Test scope: backend/test/" pointer is adjusted — the committed jest config (`rootDir: src`) is what runner.api executes, so specs live in `src/**/*.spec.ts`; `backend/test/` stays the generator's separate e2e harness). Frontend: plain fetch + useState/useEffect (conv. 3), RTL tests with a stubbed global `fetch`. Refactor pass removes the T-001 Hello World cruft (app.controller/service + their specs + generator `test/app.e2e-spec.ts`, flagged by the T-001 Critic) once real endpoints are green.

**Boundaries & mocks:** frontend's only boundary is the tracker's own HTTP API → FAKED in RTL tests by stubbing `fetch` (the `api.ts` wrapper is the port). Backend has no boundaries — its integration tests run the real Nest app in-process, nothing mocked. Smoke AC hitting the real boundary: AC-4 (real browser → real vite proxy → real backend).

**Behaviors (TDD order):** B-1 first (tracer bullet), then B-2, B-3; B-4 is the `e2e` smoke (not a ledger cycle — verified in the report)
- B-1 (tracer bullet): `GET /api/tickets` → 200 JSON array; empty at boot; entries carry the exact five fields; `?projectId=` filters. (Drives TicketsModule end-to-end through HTTP.)
- B-2: `GET /api/projects` → 200 with the seeded default project (`id`, `name`, `key`) present with no setup call.
- B-3: board page renders the three columns and sorts a faked `fetch` payload of mixed-status tickets into the right columns; no local seed data (empty board when API returns []).
- B-4 [e2e/smoke]: browser + both dev servers — board shows live API data. Recorded in verification.md.

**PR will contain:**
- `backend/src/tickets/` + `backend/src/projects/` (modules, controllers, services, shared status type) wired into `AppModule`
- backend integration specs colocated in `src/` (ledger)
- `frontend/src/api.ts`, board UI in `App.tsx` (+ column component if it earns its keep), RTL specs (ledger)
- refactor: Hello World controller/service/specs + generator e2e spec removed
- this exec plan + behavior spec + verification report

**Open questions / ambiguities:** none — contracts fixed by TSD S-0001.01; default project identity (name "Default", key "DEF") is an implementation detail no spec constrains.

**Path:** L (lean, default)
**Escalation signals hit (≥2 → R):** none — no ambiguity, additive blast radius, no security surface.
- [ ] Refactor pass done (on green; tests unchanged) — before PR
