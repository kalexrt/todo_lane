# Behavior Spec — T-002: View the ticket board
> Source: task card ACs + docs/features/0001-master-ticket-tracker/tasks/T-002/snapshot-TSD.md
> One test at a time. B-1 = tracer bullet. Never write B-N+1 before B-N is GREEN.
> Fill a behavior's Given/When/Then JUST BEFORE you `lane red` it — `lane red` checks
> only the behavior it's about to prove, so later B-N may stay stubs until their turn.
> B-N below seed from the card's drivable ACs (behavior / e2e) — a starting point, not
> final. One AC may be several behaviors (split it); the Critic may surface more (add
> them). B-numbering is the Coordinator's, not fixed by AC count. Invariant /
> non-functional ACs are not RED→GREEN cycles — any are listed in their own section.

## B-1 (tracer bullet): AC-1 [behavior]: `GET /api/tickets` returns 200 with a JSON array of tickets, each carrying `id`, `projectId`, `title`, `description`, `status` (exactly one of `todo|in_progress|done`); optional `?projectId=` filters.
- Given: a running app (in-process Nest app with the `/api` prefix); ticket state empty at boot, or seeded through the tickets service (the domain seam — no HTTP create surface exists until T-003)
- When: a client GETs `/api/tickets` (optionally with `?projectId=<id>`)
- Then: 200 with a JSON array — `[]` at boot; seeded tickets appear with exactly `id`, `projectId`, `title`, `description`, `status` (from the union, `todo` on creation); with `?projectId=` only that project's tickets return

## B-2: AC-2 [behavior]: `GET /api/projects` returns 200 with a JSON array of projects including one default project (`id`, `name`, `key`) present at boot with no setup call.
- Given: a freshly booted app (in-process Nest app with the `/api` prefix), no setup calls made
- When: a client GETs `/api/projects`
- Then: 200 with a JSON array containing exactly one project — the default — with string `id`, `name`, and `key` fields, and the default project's id matches the `projectId` that tickets receive when created without one

## B-3: AC-3 [behavior]: the board page renders three columns labeled To Do / In Progress / Done and places each ticket fetched from the API into the column matching its status (no local seed data).
- Given: the app component rendered with the HTTP API faked (stubbed `fetch`) returning a payload of tickets with mixed statuses — or an empty array
- When: the page loads (the component fetches tickets on mount, one request to the tickets endpoint)
- Then: three columns titled To Do / In Progress / Done are visible; each ticket's title appears in exactly the column matching its status; with an empty payload the three columns render empty (no locally seeded tickets)

## B-4: AC-4 [e2e]: with both dev servers running, opening the frontend in a browser shows the three-column board backed by live API data.
- Given:
- When:
- Then:

