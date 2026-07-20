## Verification — Task T-002 — 2026-07-20
> Critic anchored to TSD (external spec), NOT to the code. ★GATE: owner confirms/dismisses every flag.
> Critic: fresh-context subagent given only the card, TSD snapshot, behavior spec, and `git diff main...T-002`. Verdict: PASS, zero flags, GREEN tripwire cleared.

✅ **Conformant:** items matching spec
- AC-1: supertest against the real in-process AppModule — 200, `[]` at boot, exact five-key ticket shape, status `todo` on creation, `?projectId=` filtering with negative assertions. Real array-filter implementation, no canned data.
- AC-2: default project (`{id, name, key}`, exactly those keys) present at boot with no setup call; its id cross-checked against the `projectId` a ticket receives by default.
- AC-3: RTL with only `fetch` stubbed (the declared boundary) — three named column regions, per-status placement with negative assertions, empty board from empty payload, initial state `[]` (no local seed data).
- AC-4 (e2e smoke, run by coordinator): both dev servers booted; real API returned the seeded project and `[]` tickets; vite proxy routed `/api/tickets`; board page served with the three-column markup. (Board visually empty — no HTTP create surface exists until T-003, by design.)
- TDD ledger: 3 planned behaviors = 3 RED→GREEN cycles + 1 refactor; full suite green at review (jest 7/7, vitest 4/4).
- GREEN-tripwire (B-3 touched files its test imports): cleared — `App.test.tsx` unmodified since its RED; `api.ts` does a real fetch with `!res.ok` throw; no test-input special-casing.

⚠️ **Divergent:** deviation + severity (shallow/deep)
- (shallow) Exec plan promised removing the T-001 Hello World cruft (backend app controller/service + specs + generator e2e spec) in the refactor pass. lane's coverage audit correctly refuses test-file deletions in a refactor commit, so only non-test cruft (unused frontend template assets) was removed. The backend Hello World stack stays; removal deferred to a task whose RED→GREEN cycle replaces it (T-003 can absorb the app.controller.spec deletions if its cycles touch them, else a later cleanup card).
- (shallow, advisory from Critic) `ProjectsService` imports `DEFAULT_PROJECT_ID` from the tickets service — inverted dependency direction; move to a shared constants module when T-003 adds writes.
- (shallow, advisory from Critic) backend specs set the `/api` prefix themselves rather than sharing a bootstrap helper with `main.ts`; `TicketsService.findAll()` returns the live array reference — copy it when mutation surfaces arrive (T-004).

🚨 **Suspected hallucination:** flag for human (false positives expected — do NOT reject PR on this alone)
- none

❌ **Missing:** acceptance criteria not addressed
- none

**TDD cycle log:**
| Behavior | RED ✅ | GREEN ✅ | Test = behavior not impl | Public interface only | Mocks @ boundary only |
|----------|--------|---------|--------------------------|----------------------|----------------------|
| B-1: GET /api/tickets (shape, filter) | ✅ | ✅ | ✅ | ✅ HTTP | ✅ none |
| B-2: GET /api/projects (seeded default) | ✅ | ✅ | ✅ | ✅ HTTP | ✅ none |
| B-3: three-column board sorts fetched tickets | ✅ | ✅ | ✅ | ✅ rendered DOM | ✅ fetch only |

**Critic checklist:** (checkboxes — `done` only enforces checkboxes; resolve each)
- [x] Mocks only at boundaries — frontend `fetch` stub only; backend mocks nothing (real AppModule + supertest)
- [x] Each AC verified per its tag (behavior→HTTP/DOM interface; e2e→live smoke)
- [x] Boundary contract asserted richly — stubbed fetch pinned to the real endpoint path (`toHaveBeenCalledWith('/api/tickets')`), payload shape = real API shape
- [x] ≥1 `e2e` AC present and GREEN — AC-4 smoke: live servers, real proxy, seeded data end-to-end
- [x] Boundaries non-empty ⇒ smoke AC exists — AC-4 hits the real HTTP boundary via the real vite proxy

**Human verdict:** each item confirmed/dismissed (Path L) — the lane approve stamp records who signed
**Outcome:** clean → merge
