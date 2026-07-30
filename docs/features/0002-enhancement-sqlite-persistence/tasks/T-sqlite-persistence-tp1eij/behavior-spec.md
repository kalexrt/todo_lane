# Behavior Spec — T-sqlite-persistence-tp1eij: Tickets and projects survive a backend restart
> Source: task card ACs + docs/features/0002-enhancement-sqlite-persistence/tasks/T-sqlite-persistence-tp1eij/snapshot-TSD.md
> One test at a time. B-1 = tracer bullet. Never write B-N+1 before B-N is GREEN.
> Fill a behavior's Given/When/Then JUST BEFORE you `lane red` it — `lane red` checks
> only the behavior it's about to prove, so later B-N may stay stubs until their turn.
> B-N below seed from the card's drivable ACs (behavior / e2e) — a starting point, not
> final. One AC may be several behaviors (split it); the Critic may surface more (add
> them). B-numbering is the Coordinator's, not fixed by AC count. Invariant /
> non-functional ACs are not RED→GREEN cycles — any are listed in their own section.

> Renumbered from the scaffold to match the approved exec plan. AC-2 is the only drivable
> behavior AC and it bundles three distinct write paths, so it splits into B-1/B-2/B-3
> (one per path). AC-1 is carried by the existing suite, AC-3/AC-4 hold by construction
> and are locked as off-ledger guards, and AC-5 is manual smoke — all in the section below.

## B-1 (tracer bullet): a ticket created over the API is still there for a new application instance opened against the same database file  (AC-2, first write path)
- Given: `TRACKER_DB_PATH` points at a unique, empty temp directory path with no existing database file, and a Nest application instance A is built from `AppModule` with the `/api` prefix and the same global `ValidationPipe` as `main.ts`.
- When: `POST /api/tickets` with a title and description returns 201 with a server-assigned id; then instance A is closed; then a *separate* instance B is built from `AppModule` against that same `TRACKER_DB_PATH`.
- Then: `GET /api/tickets` on instance B returns 200 and contains exactly that ticket, with the same `id`, `title`, `description`, and `projectId`, and `status` equal to the literal string `todo`. (Fails before implementation: instance B starts from an empty in-memory array and returns `[]`.)

## B-2: a project created over the API is still there for a new instance against the same file  (AC-2, second write path)
- Given: `TRACKER_DB_PATH` points at a unique, empty temp directory path with no existing database file, and instance A is built from `AppModule` wired as `main.ts` does.
- When: `POST /api/projects` with a `name` and `key` returns 201 with a server-assigned id; then instance A is closed; then a separate instance B is built against that same path.
- Then: `GET /api/projects` on instance B returns 200 and contains the created project with the same `id`, `name`, and `key` — and the default project appears exactly once alongside it, for two projects in total. (Fails before implementation: `ProjectsService` still holds an in-memory array, so instance B returns only its freshly-seeded default project.)

## B-3 — reclassified to a regression guard (see below); not a RED→GREEN cycle
Planned as the third write path, but it passes on arrival, so `lane red` rightly refuses it
as a green-at-RED. Recorded with `lane red --regression` and `planned_behaviors` dropped to 2.
Why it cannot be a genuine RED: B-1 replaced the in-memory `Ticket[]` with a table, which left
`updateStatus` no in-memory object to mutate — a write-through `UPDATE` was the minimal coherent
implementation, not over-reach. Making it deliberately *not* persist in order to manufacture a
failing test would be writing a bug for ceremony's sake (philosophy §2b, vacuous proof).

## Invariants, guards & smoke (NOT RED→GREEN cycles)
> Not standalone behaviors to drive. An invariant usually holds as a property of a
> behavior above (state which) or is locked by a guard test recorded off-ledger with
> `lane red --regression`. Non-functional ACs are validated out-of-band (load test, etc.).
- AC-1 [behavior] — Every existing API behavior is unchanged (all endpoints, all error cases). — coverage: **the existing backend endpoint suite in `backend/src/**/*.spec.ts`, unedited.** It already asserts the whole surface and is already green, so a new test for it would pass at RED and `lane red` would rightly refuse it. Enforced by every `lane green` run and by `lane review`'s full-suite run. If any existing spec needs editing to pass, that is a contract break to escalate, not a test to fix.
- AC-2 [behavior], third write path — a status change made through `PATCH /api/tickets/:id/status` survives into a new instance, leaving other tickets untouched. — coverage: guard test committed with `lane red --regression` (`tickets.status-persistence.spec.ts`), for the reason recorded under B-3 above. Still guards the real bug it was written for: a status-change method that mutates the row object it read instead of writing through.
- AC-3 [invariant] — A rejected request writes nothing. — coverage: property of B-1/B-2/B-3's write paths (DTO/`ValidationPipe` rejection happens before the service is entered; `createValidated`'s unknown-`projectId` check and `updateStatus`'s unknown-id 404 both precede any write statement). Locked by a guard test committed with `lane red --regression`: each 400/404 case followed by a read from a newly-opened instance showing nothing written, and the target ticket's stored status unchanged in the invalid-status case.
- AC-4 [invariant] — The default project exists exactly once across any number of boots, and a boot against a location with no database succeeds. — coverage: holds by construction from B-1's schema bootstrap (`CREATE TABLE IF NOT EXISTS` + insert-if-absent, never insert-or-replace) — B-1 cannot pass at all unless reopening an existing database works. Locked by a guard test committed with `lane red --regression`: three consecutive instances against one file yield exactly one default project, and a project the user created or changed is untouched by the later boots.
- AC-5 [e2e] — Browser create → In Progress → real backend process restart → reload, ticket still present and still In Progress, default project still appears exactly once. — coverage: **manual smoke, recorded in `verification.md`.** Its automatable substance is B-1+B-2+B-3 at the same API seam the browser drives; what only a human can exercise is the real process kill/restart plus a browser reload against the real `backend/data/tracker.db`. Not a fourth ledger cycle — a Jest "B-4" here would either duplicate B-1..B-3 or assert a fake restart.
