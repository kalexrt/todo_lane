---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
approved_sha256: "8a57e6fb858021b4e0378a8f4c8d5d7a1e64b9751e7361a020c921bd5d5cd00e"
---
## Task T-004 — Move a ticket between statuses
**Parent:** story S-0001.03 · feature 0001-master-ticket-tracker (docs/features/0001-master-ticket-tracker/ — its PRD + TSD)
**Slice:** full vertical — dedicated status-change endpoint (the future gating seam) plus per-card move buttons on the board.
**Acceptance criteria:** (tag each `behavior`/`invariant`/`non-functional`/`e2e`)
- [ ] AC-1 [behavior]: `PATCH /api/tickets/:id/status` with `{"status": "todo"|"in_progress"|"done"}` returns 200 with the updated ticket; any valid status may move to any other, and the new status persists across a subsequent `GET /api/tickets`.
- [ ] AC-2 [behavior]: a status outside the three allowed strings → 400 with the ticket unchanged; an unknown ticket id → 404.
- [ ] AC-3 [invariant]: the status endpoint and the single service method behind it are the only code path that mutates a ticket's status — no generic ticket-update surface exists.
- [ ] AC-4 [e2e]: clicking a move button on a ticket card moves the card to the target column, and the change survives a page refresh (server-held state).
**End-to-end AC:** AC-4 [e2e] — reachable through the running app.
**Tests:** AC-1, AC-2, AC-3, AC-4  ← ordered; first = tracer bullet (legal move persists). AC-4's browser path verified as smoke in the verification report; its button behavior unit-tested with a faked API.
**Test scope:** backend/test/ (supertest integration) + frontend/src/ colocated *.test.tsx
**Done =** reviewable PR, all tests pass, links to chain. One PR per task (default).
