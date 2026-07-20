## TSD S-0001.01 — View the ticket board  (PRD §S-0001.01)
| Aspect | Spec |
|--------|------|
| Interfaces | `GET /api/projects` → 200, JSON array of Project. `GET /api/tickets` → 200, JSON array of Ticket; optional `?projectId=<id>` filters to that project. |
| Data / State | In-memory project and ticket collections. One default project (fixed name/key) exists at boot with no setup call; tickets start empty. |
| Behavior | Both list endpoints return current state, every ticket carries a status from the union. The frontend renders a single page with three columns labeled To Do / In Progress / Done and places each fetched ticket in the column matching its status; it fetches from the API on load (no local seed data). |
| Access | Any local HTTP client; browser frontend in dev reaches the API via an `/api` proxy or CORS — no auth. |
| Boundaries | Frontend's only boundary is the tracker's own HTTP API — faked in frontend unit tests. Backend has none (no clock/network/filesystem dependencies beyond serving HTTP). |
| Tests | unit/integration (backend): list endpoints return seeded project and created tickets with correct shapes. unit (frontend): board renders three columns and sorts tickets into them from a faked API response. smoke: with both dev servers running, the browser shows the board and seeded project data end-to-end. |
