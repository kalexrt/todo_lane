---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-30"
# planned_behaviors — machine-read count of RED→GREEN cycles (B-N). Leave empty to let
# lane infer from B-N labels below; SET it when an AC becomes a regression guard so
# `lane next` knows the remaining count (frontmatter edits need no re-approval).
# Dropped 3 → 2 during execution: B-3 (status-change persistence) passes on arrival once B-1
# replaces the in-memory array, so it is recorded as a regression guard instead of a fake RED.
# The body below still reads "3" — body edits would reopen the approval gate, so it is left as
# approved and the change is recorded in verification.md.
planned_behaviors: "2"
approved_sha256: "16e9cd22f5abea230102396664118a0ec5a9c0564befabdf4f3e1d79c218a882"
---
## Exec Plan — Task T-sqlite-persistence-tp1eij
> Authored during planning, before any code. ★GATE: DEV/SA approve via `lane approve` BEFORE any code (lane writes the stamp). Resolve all ambiguities first.

**Will build:** (mapped to each AC)
- AC-2 (cross-instance persistence — the substance of this task): `ProjectsService` and `TicketsService` stop holding `Project[]` / `Ticket[]` arrays and instead read and write rows in a file-based SQLite database. Their public methods keep their exact names, parameters, and **synchronous** return shapes (`findAll(projectId?): Ticket[]`, `create(...): Ticket`, `createValidated(...): Ticket`, `updateStatus(id, status): Ticket`, `exists(id): boolean`), so every controller and existing spec calling them is untouched.
- AC-2 (storage location): a single backend env var `TRACKER_DB_PATH` selects the database, read **at provider-construction time** (not as a module-load constant) so each spec can point it somewhere isolated. Unset → `backend/data/tracker.db`; the file and its parent directory are created when absent. The value `:memory:` selects an ephemeral database.
- AC-1 (no behavior change): nothing in the controllers, DTOs, `main.ts` routing, or the frontend changes. The existing endpoint specs in `backend/src/**/*.spec.ts` are the guard and must stay green **unedited** — if any of them needs a change to pass, that is a contract break, not a test fix.
- AC-4 (default project once): the schema is created with `CREATE TABLE IF NOT EXISTS` and the default project row is *ensured* (insert-if-absent, never insert-or-replace), so booting repeatedly against one database neither duplicates it nor resets a project the user created or changed.
- AC-3 (rejected requests write nothing): holds unchanged — DTO/`ValidationPipe` rejection happens before the service is entered, and `createValidated`'s unknown-`projectId` check and `updateStatus`'s unknown-id 404 both run before any write statement. This task must not move a write earlier than its check.
- AC-5 (e2e): no new code — the browser path already exists. Verified as smoke (see below).
- Housekeeping: `backend/data/` added to `.gitignore` (local developer state, per the TSD).

**Approach:**

One new backend runtime dependency: a **synchronous** SQLite driver (`better-sqlite3`). This is not a free choice — the approved TSD requires the services' return shapes to stay identical, and every current method is synchronous. An async driver would turn all of them into `Promise`-returning methods, cascading into every controller and every existing spec, which is exactly the contract break AC-1 forbids. Node 20.19 (the project's runtime) has no built-in `node:sqlite`, so a dependency is required regardless; ADR-0002 anticipates one. Verified in a scratch project: installs from prebuilt binaries on this platform, and a file database written by one handle is readable by a second, freshly-opened handle.

State lives behind one small Nest provider that owns the connection: it resolves the path, opens the database, and runs `CREATE TABLE IF NOT EXISTS` for `projects` and `tickets`, then closes the handle on module destroy (so `app.close()` releases the file and a second instance can open it). **All SQL that reads or writes domain rows stays inside the two services** — the provider is a connection handle, not a repository or data-access layer, so ADR-0002's "no new architectural layer, no repository layer beyond those services" and BLUEPRINT's "SQLite is reached only from inside `TicketsService`/`ProjectsService`" both hold. This is the one structural judgment call in the plan and is called out for ratification at this gate; the alternative (each service opening its own handle) means two writers on one file for no benefit.

Two tables, one column per field of the existing shapes, `id` as primary key, `status` stored as the literal union string `todo | in_progress | done` (CONSTITUTION convention 1) — **no** `FOREIGN KEY` on `tickets.projectId`: referential integrity deliberately stays where it is today, in `createValidated`, because `TicketsService.create` is documented as a raw seam with no integrity check and existing specs seed through it. Ids stay server-assigned `randomUUID`.

The default project is ensured in `ProjectsService`'s **constructor** — the direct analogue of today's field initializer, so the timing is unchanged and no method can observe a missing default. Deliberately not `OnModuleInit`: two existing specs (`app.controller.spec.ts`, `app.placeholder.spec.ts`) never call `app.init()`, and hanging domain seeding on a lifecycle hook would make correctness depend on which specs happen to init the app.

Test isolation: `backend/test/jest-setup.ts` registered as a Jest `setupFiles` entry sets `TRACKER_DB_PATH=':memory:'` for every backend spec, so the ~10 existing specs each get a private empty database per app instance and never touch the developer's real file — no edits to those spec files. A spec that needs real cross-instance persistence overrides the var with its own unique temp-directory path in `beforeAll`. This keeps the suite hermetic and order-independent (ADR-0002's test-isolation consequence): nothing outside `npm ci` is required, so `lane verify`'s fresh-worktree replay holds.

**Boundaries & mocks:**
- **Filesystem — REAL in every backend test, never faked.** No mock/stub filesystem and no fake driver: faking the store would make these tests assert the mock rather than persistence, which is the exact failure the Critic looks for. Isolation comes from *where* the database points (ephemeral, or a unique temp file), not from replacing it. B-1/B-2/B-3 each open a real SQLite file in a fresh temp directory and a real second app instance against it.
- Randomness: `randomUUID` stays real (ids are asserted for round-trip equality, never for value). No clock dependency. No network.
- Frontend: unchanged; its only boundary is still the tracker's HTTP API, faked in its existing Vitest specs. No frontend test changes.
- **Smoke AC hitting the real boundary in a realistic environment: AC-5** — real dev servers, the real default `backend/data/tracker.db` file, and a real backend process kill/restart, walked in the browser and recorded in the verification report.

**Behaviors (TDD order):**
- **B-1 (tracer bullet): a ticket created over the API is still there for a new application instance opened against the same database file.** Given `TRACKER_DB_PATH` pointing at a fresh temp path, when `POST /api/tickets` succeeds against instance A and A is closed and a new instance B is built against that same path, then `GET /api/tickets` on B returns the ticket with the same id, title, description, projectId, and status `todo`. Fails today: B starts from an empty array. Forces the whole vertical — dependency, connection provider, path resolution, schema creation, ticket writes and reads, Jest isolation setup.
- **B-2: a project created over the API is still there for a new instance against the same file.** Same shape as B-1 for `POST /api/projects` → `GET /api/projects` on a new instance, and the default project is present exactly once alongside it. A genuinely separate code path (`ProjectsService`) that B-1 does not force.
- **B-3: a status change made through `PATCH /api/tickets/:id/status` survives into a new instance.** Given a persisted ticket, when it is moved to `in_progress` on instance A and A is closed, then a new instance B reports it as `in_progress` (and other tickets are unaffected). Catches the specific bug where the single status-change method mutates a row object it read rather than writing through to the database.
- **AC-5 [e2e] is smoke, not a fourth ledger cycle** (hence `planned_behaviors: "3"`): its automatable substance — write, restart, read back with status intact — *is* B-1+B-2+B-3 at the API level, which is the same seam the browser drives. What only a human can exercise is the real `Ctrl-C`/restart of the backend process plus a browser reload; that is walked by hand and recorded in `verification.md`. Manufacturing a Jest "B-4" here would either duplicate B-1..B-3 or assert a fake restart — a vacuous proof (philosophy §2b).

**Regression guards (not ledger cycles — recorded off-ledger with `lane red --regression`):**
- **AC-1** needs no new guard: the existing backend endpoint suite already covers the full surface and every error case, it is already green, and it must stay green unedited. `lane green` runs it and `lane review` runs the full suite. A new test here would pass at RED, which `lane red` correctly refuses.
- **AC-3** (rejected request writes nothing) and **AC-4** (default project exactly once across boots) both hold *by construction* once B-1 lands — validation already precedes writes, and B-1's `IF NOT EXISTS` / insert-if-absent bootstrap is what makes reopening a database work at all. So each gets an explicit guard test committed with `lane red --regression`: a 400/404 followed by a read from a newly-opened instance showing nothing written and the target ticket's stored status unchanged (AC-3), and three consecutive boots against one file yielding exactly one default project with a user-modified project untouched (AC-4). They are honest guards against future regression, not fabricated REDs.

**PR will contain:**
- `backend/package.json` + `backend/package-lock.json` — the SQLite driver dependency; `jest.setupFiles` pointing at the new setup file
- new: backend SQLite connection provider (path resolution + schema bootstrap + close-on-destroy) and its module wiring
- rewritten internals of `backend/src/projects/projects.service.ts` and `backend/src/tickets/tickets.service.ts` (public surfaces unchanged)
- new: `backend/test/jest-setup.ts` (ephemeral database default for all backend specs)
- new backend specs for B-1, B-2, B-3 plus the two `--regression` guards, each on its own temp database
- `.gitignore` — `backend/data/`
- unchanged: all existing spec files, all controllers/DTOs, `main.ts`, the entire frontend
- this exec plan + behavior spec + verification report (with the AC-5 smoke walk recorded)

**Open questions / ambiguities:**
- None left open. Three judgment calls were resolved above and are flagged for ratification at this gate rather than left ambiguous: (1) a synchronous driver is forced by the TSD's "same return shapes" contract; (2) the connection-owning provider is a handle, not a repository layer — all domain SQL stays in the two services; (3) AC-1/AC-3/AC-4 are regression guards rather than ledger cycles, because a RED for them would pass on arrival. If the reviewer disagrees with (2) in particular, it changes the file layout and should be settled before `lane red`.
- Noted, not blocking: the driver ships prebuilt native binaries, so `npm ci` in `lane verify`'s fresh worktree needs network — the same requirement the existing install already has.

**Path:** L (lean, default)
**Escalation signals hit (≥2 → R):**
- One signal: blast radius touches both backend domain services and the test-isolation setup for the whole backend suite. No ambiguities left open, no security surface (local single-user app, no auth, no network exposure of the database), no amendments, no prior failure. One signal < 2 ⇒ L stands.
- [ ] Refactor pass done (on green; tests unchanged) — before PR
