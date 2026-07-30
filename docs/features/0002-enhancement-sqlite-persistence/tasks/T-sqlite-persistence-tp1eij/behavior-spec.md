# Behavior Spec — T-sqlite-persistence-tp1eij: Tickets and projects survive a backend restart
> Source: task card ACs + docs/features/0002-enhancement-sqlite-persistence/tasks/T-sqlite-persistence-tp1eij/snapshot-TSD.md
> One test at a time. B-1 = tracer bullet. Never write B-N+1 before B-N is GREEN.
> Fill a behavior's Given/When/Then JUST BEFORE you `lane red` it — `lane red` checks
> only the behavior it's about to prove, so later B-N may stay stubs until their turn.
> B-N below seed from the card's drivable ACs (behavior / e2e) — a starting point, not
> final. One AC may be several behaviors (split it); the Critic may surface more (add
> them). B-numbering is the Coordinator's, not fixed by AC count. Invariant /
> non-functional ACs are not RED→GREEN cycles — any are listed in their own section.

## B-1 (tracer bullet): AC-1 [behavior]: Every existing API behavior is unchanged — `GET /api/projects`, `POST /api/projects`, `GET /api/tickets` (with and without `?projectId=`), `POST /api/tickets`, and `PATCH /api/tickets/:id/status` return the same shapes and status codes as before, including every error case: 400 on missing/empty/whitespace title, 400 on unknown `projectId`, 400 on a status outside `todo | in_progress | done`, 400 on a project missing `name` or `key`, 404 on an unknown ticket id.
- Given:
- When:
- Then:

## B-2: AC-2 [behavior]: Data written through the API is readable by a *different* application instance opened against the same storage location — create a project and a ticket, move the ticket to `in_progress`, tear the app down, build a new one against the same location, and `GET /api/projects` / `GET /api/tickets` return them with every field intact and the status still `in_progress`.
- Given:
- When:
- Then:

## B-3: AC-5 [e2e]: Through the running app: create a ticket in the browser, move it to In Progress, stop and restart the backend process, reload the frontend — the ticket is still on the board, still in In Progress, and the default project still appears exactly once.
- Given:
- When:
- Then:

## Invariants & non-functional ACs (NOT RED→GREEN cycles)
> Not standalone behaviors to drive. An invariant usually holds as a property of a
> behavior above (state which) or is locked by a guard test recorded off-ledger with
> `lane red --regression`. Non-functional ACs are validated out-of-band (load test, etc.).
- AC-3 [invariant]: A rejected request writes nothing — after each 400/404 case in AC-1, a subsequent read from a newly-opened instance shows no partial or orphan record, and in the invalid-status case the target ticket's stored status is unchanged. — coverage:
- AC-4 [invariant]: The default project exists exactly once no matter how many times the backend boots against the same storage — repeated boots neither duplicate it nor reset a project the user created or changed. Booting against a location with no existing database succeeds and creates it (fresh checkout boots clean). — coverage:

