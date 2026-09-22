> Lane-generated — extracted from SPEC.md at approval. View only; edit the TSD section in SPEC.md, not here.

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
