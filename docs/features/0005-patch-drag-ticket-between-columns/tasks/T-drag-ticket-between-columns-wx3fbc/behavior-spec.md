# Behavior Spec — T-drag-ticket-between-columns-wx3fbc: Drag a ticket card onto a column to change its status
> Source: task card ACs + docs/features/0005-patch-drag-ticket-between-columns/tasks/T-drag-ticket-between-columns-wx3fbc/snapshot-TSD.md
> One test at a time. B-1 = tracer bullet. Never write B-N+1 before B-N is GREEN.
> Fill a behavior's Given/When/Then JUST BEFORE you `lane red` it — `lane red` checks
> only the behavior it's about to prove, so later B-N may stay stubs until their turn.
> B-N below seed from the card's drivable ACs (behavior / e2e) — a starting point, not
> final. One AC may be several behaviors (split it); the Critic may surface more (add
> them). B-numbering is the Coordinator's, not fixed by AC count. Invariant /
> non-functional ACs are not RED→GREEN cycles — any are listed in their own section.

## B-1 (tracer bullet): AC-1 [behavior]: Dragging a ticket card from one column and dropping it on a different column requests that ticket's status change to the target column's status, and the card is then rendered inside the target column and absent from the source column.
- Given:
- When:
- Then:

## Invariants & non-functional ACs (NOT RED→GREEN cycles)
> Not standalone behaviors to drive. An invariant usually holds as a property of a
> behavior above (state which) or is locked by a guard test recorded off-ledger with
> `lane red --regression`. Non-functional ACs are validated out-of-band (load test, etc.).
- AC-2 [invariant]: Dropping a ticket card on the column it already occupies issues no status-change request and leaves the card where it is. — coverage:
- AC-3 [invariant]: The "Move to <Label>" buttons remain rendered on every card and still move the ticket (existing `App.move.test.tsx` continues to pass unchanged). — coverage:

