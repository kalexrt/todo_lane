# Engineering Constitution — Ticket Tracker

> Human-maintained. No frontmatter baseline — update when conventions change, review when onboarding.

## Stack
- Runtime: Node.js 20+
- Language: TypeScript (strict) in both packages
- Framework: NestJS (backend), React 18 + Vite (frontend)
- DB: SQLite, file-based, accessed through the existing Nest services (ADR-0002) — no ORM
- Test runner: Jest + supertest (backend), Vitest + React Testing Library (frontend)

## Conventions
1. Ticket status is the string union `'todo' | 'in_progress' | 'done'`, spelled exactly this way everywhere (API payloads, types, tests) — NOT: enums, numeric codes, or display strings like `"In Progress"` in data.
2. Backend endpoints live under the `/api` global prefix and follow Nest module structure (`src/<domain>/<domain>.module|controller|service.ts` + `dto/`) — NOT: routes registered ad hoc on the app or logic in controllers.
3. Frontend uses plain `fetch` wrapped in `src/api.ts` plus `useState`/`useEffect` — NOT: axios, react-query, redux, or other state/data libraries.
4. Invalid input returns 400, unknown resource returns 404, via Nest's built-in exceptions and `ValidationPipe` — NOT: 200-with-error-body or hand-rolled validators.

## Hard Rules
- Never mutate a ticket's status except through the tickets service's single status-change method (backed by `PATCH /api/tickets/:id/status`) — it is the designated seam for future transition gating.
- Never add auth, a second persistence mechanism/ORM, or new dependencies beyond the stack above without an ADR — the product is deliberately barebones.
- Always route frontend→backend communication through the `/api` REST boundary — the frontend holds no domain rules.

## File Organization
- `backend/src/` → Nest modules per domain (`projects/`, `tickets/`), `backend/test/` → supertest e2e specs
- `frontend/src/` → React app (`App.tsx`, `api.ts`, components, colocated `*.test.tsx`)
- `docs/` → LANE artifacts (specs, tasks, context, ADRs)
