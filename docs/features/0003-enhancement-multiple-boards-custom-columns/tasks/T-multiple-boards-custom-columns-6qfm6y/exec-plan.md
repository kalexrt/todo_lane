---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-24"
planned_behaviors: "3"
approved_sha256: "f50460c0cc84f3e98e2c07ba2d06c26973d2e67d38176cc410c57f0a7f4295d1"
---
## Exec Plan — Task T-multiple-boards-custom-columns-6qfm6y
> Authored during planning, before any code. ★GATE: DEV/SA approve via `lane approve` BEFORE any code (lane writes the stamp). Resolve all ambiguities first.

**Will build:** (mapped to each AC)
- AC-1 (list boards + active board shows only its tickets): `frontend/src/api.ts` gains `fetchProjects(): Promise<Project[]>` and a `Project` type (`{ id, name, key }`), and `fetchTickets` gains an optional `projectId` argument that, when provided, appends `?projectId=` to the request (the backend already accepts it). `frontend/src/App.tsx` gains a board selector that lists every project, holds the active board's id in view state (initialized to the default project on first load), and fetches only the active board's tickets with the `?projectId=` filter. The three status columns stay hardcoded To Do / In Progress / Done for this task — customizable columns are S-0003.02.
- AC-3 (ticket created in the active board; switching shows different tickets): `createTicket` in `api.ts` gains an optional `projectId` argument forwarded in the POST body (the backend's `createValidated` already accepts and validates `projectId`); `App.tsx` passes the active board's id when creating, and switching the active board re-fetches that board's tickets. No backend change — `POST /api/tickets` with `projectId` already rejects an unknown project with 400.
- AC-2 (create a new board): `api.ts` gains `createProject({ name, key }): Promise<Project>` (the backend `POST /api/projects` already exists, 400 on missing/empty `name` or `key`); `App.tsx` adds a "create board" UI (name + key) that calls it and refreshes the board list; the new board appears in the selector, is selectable, and starts with no tickets.
- AC-4 (e2e): no new automatable code — the browser path is the whole task. Verified as smoke (see below).
- No backend changes of any kind. Every endpoint this task needs already ships (`GET /api/projects`, `POST /api/projects`, `GET /api/tickets?projectId=`, `POST /api/tickets` with `projectId`), so the backend specs stay green **unedited** — a change to any backend file here would be a contract break, not this task's work.

**Approach:**
Frontend-only, one container. `api.ts` stays a thin `fetch` wrapper (CONSTITUTION convention 3 — plain `fetch` + `useState`/`useEffect`, no axios/react-query/redux); it gains `Project` / `fetchProjects` / `createProject` and the two optional-argument additions above, nothing more. `App.tsx` adds: `projects` state + `activeProjectId` state (defaulting to `DEFAULT_PROJECT_ID` once projects load), a board selector (a list/select of projects), and rewires its ticket load to `fetchTickets(activeProjectId)`; `CreateTicketForm` receives the active `projectId` (and a board label) and forwards it. State stays view-only — the frontend holds no domain rules (BLUEPRINT boundary rule); a board switch or ticket create is always a request to the backend.

The one structural judgment call: the existing frontend specs (`App.test.tsx`, `App.create.test.tsx`, `App.move.test.tsx`) stub `fetch` and encode the **old** single-board contract — `App.test.tsx` even asserts `fetchMock` was called with exactly `'/api/tickets'`. This task intentionally changes the frontend's load/create behavior (single board → multi-board), so those tests cannot "stay green unedited" the way 0002's did. They are updated to the new multi-board contract (mocking `GET /api/projects` + the active board, expecting `?projectId=`) as part of B-1. This is honest contract-following (the approved PRD/TSD changes the contract), not test-shaping-to-match-code: the fail→pass is driven by the new `App.tsx`, and the updated assertions describe the intended new behavior, not whatever the code happens to do. Flagged for ratification at this gate.

**Boundaries & mocks:**
- **HTTP API — FAKED in every frontend test** (unchanged from today): `fetch` is stubbed per-test with `vi.stubGlobal('fetch', …)`, returning canned projects/tickets and recording the URLs hit. No real network, no real backend in the component suite. The new `fetchProjects` / `createProject` calls are added to each test's stub so the board selector has data.
- No filesystem, no clock, no randomness in the frontend. `randomUUID` lives in the backend (unchanged).
- **Smoke AC hitting the real boundary in a realistic environment: AC-4** — real dev servers (Vite proxy → Nest on :3000 → real SQLite), two boards created and switched in the browser, recorded in `verification.md`.

**Behaviors (TDD order):**
- **B-1 (tracer bullet): the board selector lists projects and the active board shows only its tickets.** Given the stubbed API returns two projects (default + a second) each with their own tickets, when `App` loads, the board selector lists both projects, the default board is active, and the board renders only the default board's tickets — fetched via `GET /api/tickets?projectId=<default>`. Forces the whole vertical: `Project` type + `fetchProjects` in `api.ts`, `projects`/`activeProjectId` state + board selector + filtered `fetchTickets` in `App.tsx`, and updating the three existing specs to the new contract. Fails today: there is no `fetchProjects` and no board selector.
- **B-2: a ticket created while a board is active is created in that board's project, and switching boards shows different tickets.** Given two boards with the second active, when a ticket is created it is POSTed with the active board's `projectId` and appears on that board; switching to the other board re-fetches and shows only that board's tickets (not the just-created one). Forces `createTicket({ projectId })` and board-switch re-fetch.
- **B-3: the user can create a new board; it appears in the selector, is selectable, and starts empty.** Given the stubbed `POST /api/projects` returns a new project, when the user submits name + key, the new board appears in the selector, selecting it fetches its (empty) tickets, and no other board's tickets show. Forces `createProject` in `api.ts` + the create-board UI + list refresh.
- **AC-4 [e2e] is smoke, not a fourth ledger cycle** (hence `planned_behaviors: "3"`): its automatable substance — list boards, switch, create per board — *is* B-1+B-2+B-3 at the component level, the same seam the browser drives. What only a human can exercise is the real two-board walk against live dev servers; that is done by hand and recorded in `verification.md`. Manufacturing a Jest "B-4" would duplicate B-1..B-3 or assert a fake server — a vacuous proof (philosophy §2b).

**Regression guards (not ledger cycles):**
- **Backend suite** needs no new guard: every backend endpoint this task uses already ships and is already covered by `backend/src/**/*.spec.ts`. It must stay green **unedited** — a backend change here is out of scope. `lane green` runs it (per-runner) and `lane review` runs the full suite.

**PR will contain:**
- edited: `frontend/src/api.ts` (`Project` type, `fetchProjects`, `createProject`, optional `projectId` on `fetchTickets`/`createTicket`)
- edited: `frontend/src/App.tsx` (board selector, `projects`/`activeProjectId` state, filtered load, create-board UI) and `frontend/src/CreateTicketForm.tsx` (forwards active `projectId`)
- updated to the new contract: `frontend/src/App.test.tsx`, `frontend/src/App.create.test.tsx`, `frontend/src/App.move.test.tsx` (mock `GET /api/projects` + active board, expect `?projectId=`)
- new: `frontend/src/App.boards.test.tsx` for B-1, B-2, B-3
- unchanged: the entire backend, `main.ts`, all backend specs
- this exec plan + behavior spec + verification report (with the AC-4 smoke walk recorded)

**Open questions / ambiguities:**
- One judgment call, resolved and flagged for ratification: the card's "must stay green unchanged" test-scope line was carried from the 0002 (no-behavior-change) template and does **not** hold for this task — S-0003.01 changes the frontend's load/create contract, so the three existing frontend specs are updated to the multi-board contract as part of B-1 (see Approach). The backend specs, by contrast, do stay green unedited. If the reviewer wants the existing-frontend-spec updates split into their own commit or done at RED rather than B-1 GREEN, say so before `lane red`.
- Noted, not blocking: `fork_policy: "stacked"` was set in `.lane/lane.config` so this task could fork from the `test2` staging branch (specs live on `test2`, not `main`, because two features share this checkout); `lane start` warned on the stacked fork as designed. Revisit when the feature lands.

**Path:** L (lean, default)
**Escalation signals hit (≥2 → R):**
- One signal: blast radius touches `App.tsx` + `api.ts` + `CreateTicketForm.tsx` + three existing specs + new specs (frontend-only, one container). No security surface (local single-user app, no auth), no amendments, no prior failure, one resolved ambiguity. One signal < 2 ⇒ L stands.
- [ ] Refactor pass done (on green; tests unchanged) — before PR
