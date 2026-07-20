# Behavior Spec — T-003: Create a ticket
> Source: task card ACs + docs/features/0001-master-ticket-tracker/tasks/T-003/snapshot-TSD.md
> One test at a time. B-1 = tracer bullet. Never write B-N+1 before B-N is GREEN.
> Fill a behavior's Given/When/Then JUST BEFORE you `lane red` it — `lane red` checks
> only the behavior it's about to prove, so later B-N may stay stubs until their turn.
> B-N below seed from the card's drivable ACs (behavior / e2e) — a starting point, not
> final. One AC may be several behaviors (split it); the Critic may surface more (add
> them). B-numbering is the Coordinator's, not fixed by AC count. Invariant /
> non-functional ACs are not RED→GREEN cycles — any are listed in their own section.

## B-1 (tracer bullet): AC-1 [behavior]: `POST /api/tickets` with a non-empty `title` (optional `description`) returns 201 with the created ticket — server-assigned unique `id`, status `todo`, `projectId` defaulting to the default project — and the ticket appears in subsequent `GET /api/tickets`.
- Given: a running app with the default project seeded, no tickets yet
- When: a client POSTs `/api/tickets` with `{title, description?}` (no projectId)
- Then: 201 with the created ticket — server-assigned unique `id`, `status: 'todo'`, `projectId` equal to the default project's id, `title`/`description` echoed — and a subsequent `GET /api/tickets` includes it

## B-2: AC-2 [behavior]: missing/empty/whitespace `title` → 400 and nothing is created; unknown `projectId` → 400 and nothing is created.
- Given: a running app with the default project seeded, no tickets yet
- When: a client POSTs `/api/tickets` with a missing/empty/whitespace-only `title`, OR with a valid `title` but a `projectId` that names no existing project
- Then: 400 in both cases, and a subsequent `GET /api/tickets` is still empty — nothing was created

## B-3: AC-3 [behavior]: `POST /api/projects` with `name` and `key` returns 201 with the created project; missing `name` or `key` → 400.
- Given: a running app with only the default project existing
- When: a client POSTs `/api/projects` with `{name, key}` (happy path), OR with `name` or `key` missing/empty (error path)
- Then: happy path → 201 with the created project (server-assigned unique `id`, `name`/`key` echoed), and it appears in `GET /api/projects`; error path → 400 and nothing created

## B-4: AC-4 [e2e]: submitting the board's create form (title + description) makes the new ticket appear in the To Do column without a manual page reload, and the form clears on success.
- Given: the app rendered with `fetch` faked — initial `GET /api/tickets` returns `[]`, and `POST /api/tickets` resolves with a created ticket
- When: a user types a title (and description) into the create form and submits it
- Then: the board refetches tickets and the new ticket's title appears in the To Do column without a manual reload; the form's inputs are cleared

