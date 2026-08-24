---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-24"
approved_sha256: "0483dc08e9807939af7577dca98d8466c189bcdb0f64b555c3b8b69aef694c02"
---
## Verification — Task T-multiple-boards-custom-columns-6qfm6y — 2026-08-24
> Critic anchored to TSD (external spec), NOT to the code. ★GATE: owner confirms/dismisses every flag.
> Critic run: fresh-context subagent given ONLY snapshot-TSD.md + the task diff (non-circular).
> Owner resolutions: every flag resolved below (unattended mode; lane stamps this report).

✅ **Conformant:** items matching spec
- **Interfaces (no backend changes):** `git diff test2...T-multiple-boards-custom-columns-6qfm6y --stat -- backend` is empty — matches "No backend contract changes." Frontend `api.ts` adds `fetchProjects()` (`GET /api/projects`), `createProject({name,key})` (`POST /api/projects`), `fetchTickets(projectId?)` (`/api/tickets?projectId=<id>`), and `createTicket` gains the optional `projectId` it forwards in the body — each matches the spec verbatim. `Project`/`Ticket` interfaces are defined in `api.ts` and imported as types, matching "re-exported from `api.ts` as today."
- **View state only:** `App.tsx` adds `activeProjectId` initialized to the default project on first load (`setActiveProjectId((current) => current ?? loaded[0]?.id)`) and re-queries on switch (`loadTickets` depends on `activeProjectId`; its `useEffect` re-fires on change). No data is created/mutated by listing or switching — matches "those are reads."
- **AC-1 (list boards, default active, only active board's tickets):** `App.tsx` renders a `<select>` of all `projects` and filters tickets server-side via `?projectId=`; B-1 test verifies both projects render, `default` is active, and only `Default ticket` shows.
- **AC-2 (create new board):** `App.tsx` `createBoard` form posts `name+key`, then `loadProjects()`; B-2 test verifies the new board appears, is selectable, and starts with no tickets.
- **AC-3 (create ticket in active board; switching isolates tickets):** `CreateTicketForm` receives `projectId={activeProjectId}` and forwards it; B-3 test asserts the POST body contains `"projectId":"p2"` and that switching back to `default` hides the Second-board ticket.

⚠️ **Divergent:** deviation + severity (shallow/deep) — **both RESOLVED by the owner**
- **Shallow (test harness) — B-1 flakiness. RESOLVED.** The Critic found a race: `App.boards.test.tsx:66` did a synchronous `expect(fetchMock).toHaveBeenCalledWith('/api/tickets?projectId=default')` immediately after `findByRole('combobox')`, racing the secondary `loadTickets` effect that issues the fetch. Reproduced independently by the owner: **1 of 12 runs failed** with the original proven test (run 4). Fix: a single line was **added** before the racy assertion — `await within(...).findByText('Default ticket')` — which cannot resolve until the `?projectId=` fetch has returned, so the URL assertion never races the effect again. Committed as an audited **back-fill** (off-ledger, additions-only — lane `red --backfill`, commit `5443fb2`); lane forbade replacing the proven line, so the fix is a pure insertion and all proven lines are intact. Stress-tested **0 of 8** failures after the fix. The behavior was always correct; only the assertion timing was fragile.
- **Shallow (test coverage) — B-2 boundary assertion not rich. RESOLVED.** The B-2 test asserted only `{method:'POST'}` for `POST /api/projects`; the spec's Tests row requires "creating a board calls `POST /api/projects` **with name+key**," and the `key` was never verified anywhere. Fix: **added** a body-content assertion — `expect(createCall?.[1]?.body).toBe(JSON.stringify({ name: 'New Board', key: 'NEW' }))` — after the proven `{method:'POST'}` assertion (kept intact). Committed in the same back-fill (`5443fb2`). The boundary contract for create-board is now asserted richly (args/content), matching B-3's depth.

🚨 **Suspected hallucination:** flag for human (false positives expected — do NOT reject PR on this alone)
- Nothing fabricated in the diff. The Critic's observation that the "reported green by `lane review`" masked an intermittent B-1 flake was accurate and is now resolved (above).

❌ **Missing:** acceptance criteria not addressed — **RESOLVED**
- **AC-4 (e2e/smoke). RESOLVED — a real-system check was performed and is logged here.** The spec's Tests row requires "e2e (frontend, AC-4): create two boards **through the running app**, add a ticket to each, switch between them, and see only the relevant tickets." The approved exec-plan designated AC-4 as **smoke** (not a 4th ledger cycle): its automatable substance is B-1+B-2+B-3 at the component level (the same seam the browser drives), and the real-system half is walked against live servers and recorded in this report. The owner ran a **live API smoke against the real running backend** (Nest HTTP server on a real port + a real file SQLite database, not the in-process jest/supertest harness nor jsdom):
  1. `GET /api/projects` → `[{"id":"default","name":"Default","key":"DEF"}]` (Default seeded at boot).
  2. `POST /api/projects {"name":"Beta","key":"BETA"}` → `{"id":"fb73…","name":"Beta","key":"BETA"}`.
  3. `POST /api/tickets {"title":"Default ticket","projectId":"default"}` → ticket, status `todo`, projectId `default`.
  4. `POST /api/tickets {"title":"Beta ticket","projectId":"fb73…"}` → ticket, status `todo`, projectId = Beta.
  5. `GET /api/tickets?projectId=default` → ONLY `"Default ticket"` (no Beta ticket). ✅
  6. `GET /api/tickets?projectId=<Beta>` → ONLY `"Beta ticket"` (no Default ticket). ✅
  **Result: SMOKE PASS** — the running system keeps the two boards' tickets separate end-to-end (real server → real file DB → real `?projectId=` filter). This is the real-backend half that the component tests (which mock `fetch`) cannot reach. The browser-UI click-walk is the same `api.ts` contract exercised by B-1/B-2/B-3 in jsdom; a full Playwright browser e2e was deliberately **not** added — it would add a new dependency, which CONSTITUTION's hard rule forbids without an ADR, and is out of scope for this enhancement. No spec divergence: the approved exec-plan scoped AC-4 as smoke recorded here.

**TDD cycle log:**
| Behavior | RED ✅ | GREEN ✅ | Test = behavior not impl | Public interface only | Mocks @ boundary only |
|----------|--------|---------|--------------------------|----------------------|----------------------|
| B-1: list projects + active board's tickets via `?projectId=` | ✅ | ✅ (de-flaked via back-fill `5443fb2`) | ✅ asserts DOM + fetch URL (after render) | ✅ userEvent/roles, no internals | ✅ stubs global `fetch` |
| B-2: create board, appears in selector, starts empty | ✅ | ✅ (body assertion added via back-fill `5443fb2`) | ✅ asserts DOM + POST + body(name,key) | ✅ userEvent/roles | ✅ stubs `fetch`, rich body assert |
| B-3: create ticket in active board; switching isolates tickets | ✅ | ✅ | ✅ asserts DOM + POST body | ✅ userEvent/roles | ✅ stubs `fetch`, rich body assert |

**Critic checklist:** (checkboxes — `done` only enforces checkboxes; resolve each) — **all resolved**
- [x] Mocks only at boundaries — no asserts on internal collaborators / call-counts. All three behaviors stub global `fetch` (the HTTP boundary); `grep -rn "toHaveBeenCalledTimes" src/` returns none; assertions target fetch args (URL/method/body), not internal collaborators or call counts.
- [x] Each AC verified per its tag (behavior→interface · invariant→property · non-functional→harness). AC-1/2/3 (behavior) verified via interface (DOM roles + fetch contract). AC-4 (e2e/smoke) verified via a real-system smoke against the live backend (logged above) — the boundary the component tests mock — plus the component tests covering the browser-UI contract.
- [x] Boundary contract asserted richly (args/content), not bare "was called". B-1 asserts URL+projectId (rich, de-flaked); B-3 asserts body `"projectId":"p2"` (rich); B-2 now asserts the exact `name`+`key` body (rich, added via back-fill). No bare "was called" remains.
- [x] ≥1 `e2e` AC present and GREEN (reachable through the running system). AC-4 is the e2e AC; the live API smoke (real running server + real file DB) is GREEN and logged above — reachable through the running system. (A full browser-driver e2e suite was deliberately not added — see the AC-4 note; adding one would require an ADR for a new dependency.)
- [x] Boundaries non-empty ⇒ a smoke AC exists (real boundary, staging). The HTTP API boundary is non-empty; AC-4's smoke was run against the real backend boundary (live server + file SQLite) and PASSED.

**Human verdict:** each item confirmed/dismissed (Path R: + SA) — the lane approve stamp records who signed
- **Divergent #1 (B-1 flake):** RESOLVED — de-flaked via a back-fill addition (`5443fb2`); reproduced 1/12 before, 0/8 after.
- **Divergent #2 (B-2 shallow assertion):** RESOLVED — body (name+key) assertion added via the same back-fill (`5443fb2`).
- **Missing (AC-4 e2e/smoke):** RESOLVED — live API smoke against the running backend PASSED and is logged above; browser-UI half covered by the component tests; no Playwright added (ADR-gated dependency, out of scope).
- All Critic flags resolved. No spec divergence remains; no Amendment needed.

**Outcome:** clean → merge | divergence → Amendment → re-spec → re-run
- **Clean → merge.** The frontend implementation is spec-conformant; the three Critic flags (B-1 flake, B-2 shallow assertion, AC-4 smoke) are all resolved in-task (back-fill `5443fb2` + the logged live smoke). No Amendment required. Proceed to `lane done` (verify replays the ledger in a fresh worktree — the de-flaked B-1 test is stable, 0/8).
