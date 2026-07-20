---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
# planned_behaviors — machine-read count of RED→GREEN cycles (B-N). Leave empty to let
# lane infer from B-N labels below; SET it when an AC becomes a regression guard so
# `lane next` knows the remaining count (frontmatter edits need no re-approval).
planned_behaviors: ""
approved_sha256: "e53a2341c5410834c2f1e8683d103ccd5bdb0e56c91c468c4a2922a3d7929c4e"
---
## Exec Plan — Task T-001
> Authored during planning, before any code. ★GATE: DEV/SA approve via `lane approve` BEFORE any code (lane writes the stamp). Resolve all ambiguities first.

**Will build:** (mapped to each AC)
- AC-1: `backend/` — a fresh NestJS 10 (TypeScript) package scaffolded with the standard Nest CLI layout (`src/main.ts`, `app.module.ts`), `app.setGlobalPrefix('api')`, listening on port 3000. `npm run start:dev` boots it.
- AC-2: `frontend/` — a fresh Vite + React + TypeScript package; `vite.config.ts` adds a dev-server proxy `/api → http://localhost:3000`. `npm run dev` serves the default page.
- AC-3: backend keeps Nest's default Jest wiring with one placeholder spec (`src/app.placeholder.spec.ts` asserting a trivial truth); frontend adds Vitest + React Testing Library + jsdom with one placeholder test. Both `npx jest` and `npx vitest run` pass from a fresh `npm ci`.
- AC-4: `package-lock.json` committed in both packages; root `.gitignore` extended for `node_modules/`, `dist/`; `.lane/lane.config` gains the runner matrix (runner.api: backend / `npx jest` / `Tests:.*[0-9]+ (passed|failed)` / `npm ci`; runner.web: frontend / `npx vitest run` / `Tests +[0-9]+ (passed|failed)` / `npm ci`).

**Approach:** scaffold both packages with their official generators (`nest new`, `npm create vite`), trim to minimum (no sample cruft beyond what the generators emit), wire the `/api` prefix and dev proxy, add the two placeholder tests, then commit the toolchain + lane.config runner matrix. No domain code — endpoints/UI belong to T-002..T-004.

**Boundaries & mocks:** none — this task ships no product behavior; nothing is faked. Toolchain is proven by running the real runners (AC-3) and booting both real dev servers (AC-1/AC-2 smoke).

**Behaviors (TDD order):** Tests: N/A — scaffolding (per approved card). No RED→GREEN cycles; the placeholder tests exist only to prove the runners execute. Execution steps in order:
1. Scaffold `backend/` (Nest CLI), set `/api` global prefix + port 3000, keep Jest, add placeholder spec, verify `npx jest` passes.
2. Scaffold `frontend/` (Vite react-ts), add `/api` dev proxy, add Vitest + RTL + placeholder test, verify `npx vitest run` passes.
3. Extend root `.gitignore`; commit both packages with lockfiles.
4. Update `.lane/lane.config` runner matrix; boot both dev servers as smoke.

**PR will contain:**
- `backend/` — Nest scaffold (src/, test config, package.json + lockfile)
- `frontend/` — Vite scaffold (src/, vite.config.ts with proxy, vitest setup, package.json + lockfile)
- root `.gitignore` additions
- `.lane/lane.config` — runner.api / runner.web matrix
- this exec plan + verification report

**Open questions / ambiguities:** none — stack and layout are fixed by CONSTITUTION.md; versions are whatever the current generators emit (pinned by the committed lockfiles).

**Path:** L (lean, default)
**Escalation signals hit (≥2 → R):** none — no ambiguities, blast radius is additive-only (new dirs + config), no security surface.
- [ ] Refactor pass done (on green; tests unchanged) — before PR
