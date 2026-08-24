# Behavior Spec — T-multiple-boards-custom-columns-6qfm6y: Multiple boards (one per project)
> Source: task card ACs + docs/features/0003-enhancement-multiple-boards-custom-columns/tasks/T-multiple-boards-custom-columns-6qfm6y/snapshot-TSD.md
> One test at a time. B-1 = tracer bullet. Never write B-N+1 before B-N is GREEN.
> Fill a behavior's Given/When/Then JUST BEFORE you `lane red` it — `lane red` checks
> only the behavior it's about to prove, so later B-N may stay stubs until their turn.
> B-N below seed from the card's drivable ACs (behavior / e2e) — a starting point, not
> final. One AC may be several behaviors (split it); the Critic may surface more (add
> them). B-numbering is the Coordinator's, not fixed by AC count. Invariant /
> non-functional ACs are not RED→GREEN cycles — any are listed in their own section.

## B-1 (tracer bullet): AC-1 [behavior]: The frontend lists every project as a board and lets the user select which board is active; the board view shows only the tickets belonging to the active project, fetched with `GET /api/tickets?projectId=`.
- Given: the stubbed API serves two projects — `default` ("Default") and `p2` ("Second") — and `GET /api/tickets?projectId=default` returns one ticket ("Default ticket", `todo`) while `GET /api/tickets?projectId=p2` returns a different ticket ("Second ticket", `todo`).
- When: the app loads (no user interaction).
- Then: the board selector lists both "Default" and "Second", "Default" is the active (selected) board, the app fetches `/api/tickets?projectId=default`, and the board renders "Default ticket" in To Do — "Second ticket" does not appear.

## B-2: AC-2 [behavior]: The user can create a new board (name + key) from the UI; after creation it appears in the board list, can be selected, and starts with no tickets, via the existing `POST /api/projects` endpoint.
- Given: the stubbed API serves the default project, and `POST /api/projects` with `{ name, key }` returns a new project (`id: "p3"`, name "New Board", key "NEW") and adds it to the project list.
- When: the user types "New Board" / "NEW" into the create-board form and submits it.
- Then: the app POSTs `/api/projects` with `{ name: "New Board", key: "NEW" }`, the new board "New Board" appears in the board selector, selecting it sets it active, and its board starts with no tickets.

## B-3: AC-3 [behavior]: A ticket created while a board is active is created in that board's project (the create request carries the active `projectId`); switching to another board shows that board's tickets and not the first's, so each board keeps its own tickets.
- Given: the stubbed API serves two boards (`default` with one ticket "Default ticket", `p2` empty) and accepts `POST /api/tickets` with a `projectId`, storing the new ticket under that project.
- When: the user switches to the `p2` ("Second") board and creates a ticket "Second board ticket", then switches back to `default`.
- Then: the create request body contains `"projectId":"p2"` and the ticket appears on the Second board; switching back to Default shows "Default ticket" and not "Second board ticket".

## B-4: AC-4 [e2e]: Through the running app: create two boards, add a ticket to each, switch between them, and see only the relevant tickets in each board.
- Given:
- When:
- Then:

