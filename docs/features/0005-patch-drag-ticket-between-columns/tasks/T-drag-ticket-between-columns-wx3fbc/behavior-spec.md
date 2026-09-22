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
- Given: the board is rendered against a server holding one ticket, "Draggable ticket", with status `todo`, so the card sits in the "To Do" column and the "Done" column is empty.
- When: the user picks up that card with the mouse, drags it over the "Done" column, and releases it there.
- Then: exactly one status change is requested — ticket `t1` to `done` — and after the board reloads from the server the card is rendered inside the "Done" column and no longer inside "To Do".

## B-2: AC-2 [invariant, driven as a behavior per the approved exec plan]: Dropping a ticket card on the column it already occupies issues no status-change request and leaves the card where it is.
- Given: the board is rendered against a server holding one ticket, "Stationary ticket", with status `todo`, so the card sits in the "To Do" column.
- When: the user picks up that card and releases it over the "To Do" column — the column it already occupies.
- Then: no status change is requested at all, and the card is still rendered inside the "To Do" column.

## B-3: TSD Behavior clause — "a column under an active drag is visually distinguishable from the others WHILE THE POINTER IS OVER IT". Surfaced by the Critic (flag 4): dragleave bubbles, so crossing the column's own children clears the highlight.
- Given: the board is rendered, a card is being dragged, and the pointer has moved over the "Done" column so that column is highlighted as the drop target.
- When: the drag moves onto an element nested inside that same column (its "Done" heading) rather than out of the column.
- Then: the "Done" column stays highlighted — the indication is cleared only when the drag genuinely leaves the column or ends.

## Invariants & non-functional ACs (NOT RED→GREEN cycles)
> Not standalone behaviors to drive. An invariant usually holds as a property of a
> behavior above (state which) or is locked by a guard test recorded off-ledger with
> `lane red --regression`. Non-functional ACs are validated out-of-band (load test, etc.).
- AC-2 [invariant]: Dropping a ticket card on the column it already occupies issues no status-change request and leaves the card where it is. — coverage: promoted to a full RED→GREEN cycle as B-2 above, because the approved exec plan specifies it as behavior B-2 and it is directly drivable through the same interface as B-1.
- AC-3 [invariant]: The "Move to <Label>" buttons remain rendered on every card and still move the ticket (existing `App.move.test.tsx` continues to pass unchanged). — coverage: held by the pre-existing guard test `frontend/src/App.move.test.tsx`, which drives a move through the button path and is required to keep passing in every GREEN run of this task; no new test is added for it.
