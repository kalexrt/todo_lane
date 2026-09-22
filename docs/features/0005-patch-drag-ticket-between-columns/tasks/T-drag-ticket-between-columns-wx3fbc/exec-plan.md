---
approved_by: "Kalash Shrestha"
approved_at: "2026-09-22"
approved_sha256: "bcb53be634fa39b1fad23295773b9cfe25b1d9327f2ab7383fb33c87a1c13cab"
---
## Exec Plan — Task T-drag-ticket-between-columns-wx3fbc
> Derived verbatim from this patch's approved SPEC.md (`## Execution Plan` section) —
> the human's ONE spec stamp covers this plan (two-stamp ceremony, patch kind). Editing
> this file reopens its gate like any stamped artifact (stale hash → re-approve).

## Execution Plan
> Approved BY the spec stamp: `lane start` copies this section verbatim into the worktree's
> exec-plan.md and carries your stamp onto it — no separate plan gate. Keep it last in this file.

**Approach:** Use the browser's built-in HTML5 drag-and-drop events in `frontend/src/App.tsx` — no library, per the CONSTITUTION dependency rule. Mark each `li.ticket` as a drag source that writes its ticket id onto the drag payload; make each `section.column` allow the drop and, on drop, read the ticket id back and call the same `moveTicket(id, status)` helper the "Move to" buttons already call — so the single status seam is untouched. Track the hovered column in local `useState` purely for a highlight class, added to `App.css` alongside the existing `.column` rules. No backend change, no new files.
**Boundaries & mocks:** `fetch` is stubbed with the same stateful fake used in `App.move.test.tsx` (faked HTTP only). The component, its drag handlers, and the real DOM event dispatch are exercised for real. RTL's `fireEvent` dispatches the drag events with a minimal `dataTransfer` stand-in, since jsdom does not implement one.
**Behaviors (TDD order):**
- B-1: Failing RTL test — drag a `todo` ticket onto the "Done" column; assert a PATCH to that ticket's status endpoint with `done` was issued and the card renders in the "Done" column and not in "To Do". Then make the card a drag source and the column a drop target wired to `moveTicket`.
- B-2: Failing RTL test — drop a `todo` ticket onto the "To Do" column; assert no PATCH was issued and the card is still in "To Do". Then add the same-status guard before calling `moveTicket`.
**Open questions:** none
