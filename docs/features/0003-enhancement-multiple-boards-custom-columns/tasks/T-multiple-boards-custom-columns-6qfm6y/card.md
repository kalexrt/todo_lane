---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-24"
approved_sha256: "4c5c606a668cc2ee0593a414054e89022edce0f8b1e5ac7644e634b6d9fbac57"
---
## Task T-multiple-boards-custom-columns-6qfm6y — Multiple boards (one per project)
**Parent:** story S-0003.01 · feature 0003-enhancement-multiple-boards-custom-columns (docs/features/0003-enhancement-multiple-boards-custom-columns/ — its PRD + TSD)
**Slice:** full vertical, frontend-only — the frontend surfaces the already-shipping `GET /api/projects` / `POST /api/projects` / `GET /api/tickets?projectId=` / `POST /api/tickets` (with `projectId`) contracts as a board selector + per-board ticket view, so a user can run several boards side by side, each holding its own tickets. No backend change: no new endpoint, no status-code or error-case change, no new persistent state. The board view keeps the hardcoded three columns for now (To Do / In Progress / Done); per-board customizable columns are the *next* task (S-0003.02, depends on this one).
**Acceptance criteria:** (tag each `behavior`/`invariant`/`non-functional`/`e2e`; behavior ACs = observable outcome through an interface — NO "calls X / saves to table Y / uses lib Z")
- [ ] AC-1 [behavior]: The frontend lists every project as a board and lets the user select which board is active; the board view shows only the tickets belonging to the active project, fetched with `GET /api/tickets?projectId=`.
- [ ] AC-2 [behavior]: The user can create a new board (name + key) from the UI; after creation it appears in the board list, can be selected, and starts with no tickets, via the existing `POST /api/projects` endpoint.
- [ ] AC-3 [behavior]: A ticket created while a board is active is created in that board's project (the create request carries the active `projectId`); switching to another board shows that board's tickets and not the first's, so each board keeps its own tickets.
- [ ] AC-4 [e2e]: Through the running app: create two boards, add a ticket to each, switch between them, and see only the relevant tickets in each board.
**End-to-end AC:** AC-4 [e2e] — reachable through the running app (browser + real backend + real persisted projects/tickets).
**Tests:** AC-1, AC-3, AC-2, AC-4  ← ordered; first = tracer bullet (the board selector lists projects and the active board shows only its tickets — proves the core multi-board behavior before breadth). AC-4's browser walk is verified as smoke in the verification report; its API half is covered by AC-1/AC-3 at the component level.
<!-- exception: Tests: N/A — reason: config | scaffolding | spike | refactor | tooling | integration -->
**Test scope:** frontend/src/**/*.test.tsx (Vitest + React Testing Library, `api.ts` mocked) — plus the existing specs in that tree, which must stay green unchanged.
<!-- approval: written by `lane approve` as frontmatter (approved_by/at/sha256) after a human confirms — never hand-edit -->
**Done =** reviewable PR, all tests pass, links to chain. One PR per task (default).
