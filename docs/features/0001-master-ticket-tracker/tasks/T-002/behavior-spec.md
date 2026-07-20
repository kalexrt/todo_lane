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
- Given:
- When:
- Then:

## B-2: AC-2 [behavior]: `GET /api/projects` returns 200 with a JSON array of projects including one default project (`id`, `name`, `key`) present at boot with no setup call.
- Given:
- When:
- Then:

## B-3: AC-3 [behavior]: the board page renders three columns labeled To Do / In Progress / Done and places each ticket fetched from the API into the column matching its status (no local seed data).
- Given:
- When:
- Then:

## B-4: AC-4 [e2e]: with both dev servers running, opening the frontend in a browser shows the three-column board backed by live API data.
- Given:
- When:
- Then:

