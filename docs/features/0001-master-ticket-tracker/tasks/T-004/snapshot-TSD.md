## TSD S-0001.03 — Move a ticket between statuses  (PRD §S-0001.03)
| Aspect | Spec |
|--------|------|
| Interfaces | `PATCH /api/tickets/:id/status` body `{ status: "todo" \| "in_progress" \| "done" }` → 200 with the updated Ticket. This is the ONLY write surface for status — no generic ticket-update endpoint exists. |
| Data / State | Mutates exactly one ticket's `status` field in the in-memory collection. |
| Behavior | Any of the three statuses may move to any other (no transition rules yet — that is the future feature this seam exists for). Status outside the union → 400 and the ticket is unchanged. Unknown ticket id → 404. All status mutation funnels through one domain operation behind this endpoint (BLUEPRINT boundary rule), so future gating touches exactly one place. Frontend: each ticket card shows move actions for the other two statuses; activating one calls the endpoint and the card moves to the target column; the new status is server-held, so it survives a page refresh. |
| Access | Same as other stories — any local client, no auth. |
| Boundaries | Frontend: the tracker's own HTTP API (faked in unit tests). Backend: none. |
| Tests | integration (backend): each legal move returns 200 and persists across a subsequent GET; 400 invalid status leaves ticket unchanged; 404 unknown id; no other route can change status. unit (frontend): move action triggers the status call and re-renders the ticket in the target column. smoke: walk one ticket todo → in_progress → done in the browser, refresh, and confirm it stays in Done. |
