# Behavior Spec — T-004: Move a ticket between statuses
> Source: task card ACs + docs/features/0001-master-ticket-tracker/tasks/T-004/snapshot-TSD.md
> One test at a time. B-1 = tracer bullet. Never write B-N+1 before B-N is GREEN.
> Fill a behavior's Given/When/Then JUST BEFORE you `lane red` it — `lane red` checks
> only the behavior it's about to prove, so later B-N may stay stubs until their turn.
> B-N below seed from the card's drivable ACs (behavior / e2e) — a starting point, not
> final. One AC may be several behaviors (split it); the Critic may surface more (add
> them). B-numbering is the Coordinator's, not fixed by AC count. Invariant /
> non-functional ACs are not RED→GREEN cycles — any are listed in their own section.

## B-1 (tracer bullet): AC-1 [behavior]: `PATCH /api/tickets/:id/status` with `{"status": "todo"|"in_progress"|"done"}` returns 200 with the updated ticket; any valid status may move to any other, and the new status persists across a subsequent `GET /api/tickets`.
- Given: a running app with one existing ticket (status `todo`, created via the tickets service)
- When: a client PATCHes `/api/tickets/:id/status` with each of the three statuses in turn (todo→in_progress, in_progress→done, done→todo — proving any-to-any, not just forward progression)
- Then: 200 with the updated ticket reflecting the new status each time, and a subsequent `GET /api/tickets` shows that same status persisted

## B-2: AC-2 [behavior]: a status outside the three allowed strings → 400 with the ticket unchanged; an unknown ticket id → 404.
- Given: a running app with one existing ticket (status `todo`)
- When: a client PATCHes that ticket's status with a value outside `todo|in_progress|done`, OR PATCHes a ticket id that doesn't exist (valid status)
- Then: invalid status → 400, and a subsequent `GET /api/tickets` shows the ticket still `todo`; unknown id → 404

## B-3: AC-4 [e2e]: clicking a move button on a ticket card moves the card to the target column, and the change survives a page refresh (server-held state).
- Given: the app rendered with `fetch` faked — a stateful stub tracking server-side ticket status, so a status PATCH is reflected in the next GET (learned from T-003's B-4 mock bug: a stateless stub can never prove persistence)
- When: a user clicks a ticket's move-to-<status> button
- Then: the board refetches and the ticket's card appears in the target column (and no longer in its old column); a simulated reload (re-render against the same faked server state) still shows it in the target column

## Invariants & non-functional ACs (NOT RED→GREEN cycles)
> Not standalone behaviors to drive. An invariant usually holds as a property of a
> behavior above (state which) or is locked by a guard test recorded off-ledger with
> `lane red --regression`. Non-functional ACs are validated out-of-band (load test, etc.).
- AC-3 [invariant]: the status endpoint and the single service method behind it are the only code path that mutates a ticket's status — no generic ticket-update surface exists. — coverage:

