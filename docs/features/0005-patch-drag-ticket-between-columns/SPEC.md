---
approved_by: "Kalash Shrestha"
approved_at: "2026-09-22"
approved_sha256: "77425ea6735e2b5a90c84c144f0332155272858935a6c4854c4a7da388d31b82"
---
# Patch 0005 — Drag a ticket between board columns with the mouse
> A `patch` iteration — the TWO-STAMP ceremony for small, known-scope work (a bug fix, a
> tweak, one behavior, one PR). This ONE document is the ticket + TSD + task card + exec
> plan: your single `lane approve` stamp covers all of it (stamp 1 of 2; stamp 2 is the
> verification report at the end). The TDD ledger, Critic snapshot, and verify replay are
> unchanged — a patch removes redundant signatures, never proof.
> Too big for a patch? More than one story, more than ~3 behaviors, or more than one task
> → use `lane new fix` / `lane new enhancement` instead (agents: CALL THIS OUT when
> drafting; the human decides at the stamp).

**Severity:** minor
**Source:** direct user request — make board columns accept tickets dragged with the mouse

**Current behavior:** The board (`frontend/src/App.tsx`) renders one `section.column` per status, each listing its tickets as `li.ticket`. The only way to change a ticket's status is to click one of the "Move to <Label>" buttons rendered inside every card. Cards are not draggable; a column is not a drop target; a mouse drag does nothing.
**Expected behavior:** A ticket card can be picked up with the mouse and dropped onto any column. Dropping it on a column whose status differs from the ticket's issues the same status change the "Move to" button issues, and the card appears in the target column. Dropping a ticket on the column it already belongs to is a no-op (no request).
**Must NOT change:** The "Move to <Label>" buttons stay, keep their labels, and keep working — they are the keyboard/assistive path and the only path covered by the existing move test. Status changes still go only through `updateTicketStatus` → `PATCH /api/tickets/:id/status` (BLUEPRINT boundary rule); the frontend never mutates status locally or applies transition rules. No new dependencies (CONSTITUTION hard rule) — no drag-and-drop library.

## TSD S-0005.01 — Ticket cards are drag sources, columns are drop targets
> Behavior + contracts ONLY — never the library/method/pattern. The Critic anchors to THIS
> section (snapshot frozen at `lane start`), exactly as it would to a TSD.md section.

| Aspect | Spec |
|--------|------|
| Interfaces | No API change. The existing `updateTicketStatus(id, status)` client call (`frontend/src/api.ts`) backed by `PATCH /api/tickets/:id/status` is the only status-mutation path; a drop calls it with exactly the arguments the equivalent "Move to" button would pass. |
| Data / State | Transient view state only: which ticket id is currently being dragged, and which column (if any) is the current drop target for hover styling. Nothing is persisted client-side; server state stays the single source of truth and is re-fetched after a successful drop, as the button path already does. |
| Behavior | Each ticket card is a drag source carrying its ticket id. Each column is a drop target that accepts a dragged ticket. Dropping a ticket on a column whose status differs from the ticket's current status changes that ticket's status to the column's status, after which the card is rendered in the target column and no longer in the source column. Dropping a ticket on its own column changes nothing and issues no status request. A column under an active drag is visually distinguishable from the others while the pointer is over it, and that indication is cleared when the drag leaves or ends. The "Move to" buttons remain present and functional throughout. |
| Boundaries | None owned externally. Tests fake the HTTP layer (`fetch`) exactly as the existing frontend specs do; no drag-and-drop library is introduced. |
| Tests | Frontend (Vitest + React Testing Library): drag a `todo` card onto the "Done" column and assert it moves there and a status change for that ticket to `done` was requested; drag a card onto its own column and assert no status request is made and the card stays put. Mirrors the faked-server pattern in `frontend/src/App.move.test.tsx`. |

## Task T-drag-ticket-between-columns-wx3fbc — Drag a ticket card onto a column to change its status
**Slice:** a complete observable behavior end-to-end + tests (full vertical)
**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
- [ ] AC-1 [behavior]: Dragging a ticket card from one column and dropping it on a different column requests that ticket's status change to the target column's status, and the card is then rendered inside the target column and absent from the source column.
- [ ] AC-2 [invariant]: Dropping a ticket card on the column it already occupies issues no status-change request and leaves the card where it is.
- [ ] AC-3 [invariant]: The "Move to <Label>" buttons remain rendered on every card and still move the ticket (existing `App.move.test.tsx` continues to pass unchanged).
**Tests:** AC-1, AC-2  ← ordered; first = tracer bullet

## Execution Plan
> Approved BY the spec stamp: `lane start` copies this section verbatim into the worktree's
> exec-plan.md and carries your stamp onto it — no separate plan gate. Keep it last in this file.

**Approach:** Use the browser's built-in HTML5 drag-and-drop events in `frontend/src/App.tsx` — no library, per the CONSTITUTION dependency rule. Mark each `li.ticket` as a drag source that writes its ticket id onto the drag payload; make each `section.column` allow the drop and, on drop, read the ticket id back and call the same `moveTicket(id, status)` helper the "Move to" buttons already call — so the single status seam is untouched. Track the hovered column in local `useState` purely for a highlight class, added to `App.css` alongside the existing `.column` rules. No backend change, no new files.
**Boundaries & mocks:** `fetch` is stubbed with the same stateful fake used in `App.move.test.tsx` (faked HTTP only). The component, its drag handlers, and the real DOM event dispatch are exercised for real. RTL's `fireEvent` dispatches the drag events with a minimal `dataTransfer` stand-in, since jsdom does not implement one.
**Behaviors (TDD order):**
- B-1: Failing RTL test — drag a `todo` ticket onto the "Done" column; assert a PATCH to that ticket's status endpoint with `done` was issued and the card renders in the "Done" column and not in "To Do". Then make the card a drag source and the column a drop target wired to `moveTicket`.
- B-2: Failing RTL test — drop a `todo` ticket onto the "To Do" column; assert no PATCH was issued and the card is still in "To Do". Then add the same-status guard before calling `moveTicket`.
**Open questions:** none
