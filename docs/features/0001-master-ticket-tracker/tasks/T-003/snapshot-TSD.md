## TSD S-0001.02 — Create a ticket  (PRD §S-0001.02)
| Aspect | Spec |
|--------|------|
| Interfaces | `POST /api/tickets` body `{ title: string, description?: string, projectId?: string }` → 201 with the created Ticket (server-assigned unique `id`, status `todo`, `projectId` defaulting to the default project). `POST /api/projects` body `{ name: string, key: string }` → 201 with the created Project. |
| Data / State | Appends to the in-memory collections; no other state touched. |
| Behavior | Missing/empty/whitespace `title` → 400, nothing created. Unknown `projectId` → 400, nothing created. Missing `name` or `key` on project creation → 400. Created tickets appear in subsequent `GET /api/tickets`. The frontend's create form (title + description inputs) submits to the API and the new ticket appears in the To Do column without a manual page reload; the form clears on success. |
| Access | Same as S-0001.01 — any local client, no auth. |
| Boundaries | Frontend: the tracker's own HTTP API (faked in unit tests). Backend: id generation is the only nondeterminism; ids need only be unique per process. |
| Tests | integration (backend): 201 happy path (default + explicit project), 400 for empty title and unknown projectId, created ticket visible in the list. unit (frontend): submitting the form calls the API and the board shows the new ticket from the refreshed/returned data. smoke: create a ticket from the real browser form and see it in To Do. |
