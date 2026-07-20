---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
approved_sha256: "bb8da1ec6de5d9057242b53699ad15375d6ae1987d5790a475c97a35e1f831de"
---
## Task T-001 — Bootstrap monorepo scaffold + committed toolchain
**Parent:** story S-0001.01 · feature 0001-master-ticket-tracker (docs/features/0001-master-ticket-tracker/ — its PRD + TSD)
**Slice:** foundation bootstrap — commits the two packages and their test toolchain so every later red-green task forks from a base that carries the runner (`lane verify` replays in a fresh checkout).
**Acceptance criteria:** (tag each `behavior`/`invariant`/`non-functional`/`e2e`)
- [ ] AC-1 [behavior]: `backend/` is a NestJS (TypeScript) package — `npm ci && npm run start:dev` boots an HTTP server on port 3000 with the `/api` global prefix.
- [ ] AC-2 [behavior]: `frontend/` is a React + Vite (TypeScript) package — `npm ci && npm run dev` serves a page, with a dev proxy routing `/api` to `localhost:3000`.
- [ ] AC-3 [behavior]: each package's test runner runs and passes with one trivial placeholder test (`npx jest` in backend, `npx vitest run` in frontend), proving the toolchain works from a fresh checkout.
- [ ] AC-4 [invariant]: lockfiles are committed; `node_modules` and build output are gitignored; `.lane/lane.config` gains the runner matrix (runner.api → backend/jest, runner.web → frontend/vitest) with `test_ran_pattern` and `setup_cmd: npm ci` per runner.
**End-to-end AC:** AC-1 + AC-2 — both dev servers reachable through a browser/HTTP client.
**Tests:** N/A — reason: scaffolding — bootstrap task committing the toolchain itself; no product behavior to assert yet (placeholder tests only prove the runners execute).
**Test scope:** N/A (bootstrap — later tasks own real tests)
**Done =** reviewable PR, both packages boot and their runners pass, links to chain. One PR per task (default).
