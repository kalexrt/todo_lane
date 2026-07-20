## Verification — Task T-003 — 2026-07-20
> Critic anchored to TSD (external spec), NOT to the code. ★GATE: owner confirms/dismisses every flag.
> Critic: fresh-context subagent given only the card, TSD snapshot, behavior spec, and `git diff main...T-003`. Initial verdict: FLAGS (2). Both resolved before this report; suite re-run green after fixes.

✅ **Conformant:** items matching spec
- AC-1: `POST /api/tickets` — 201, server-assigned id, status `todo`, projectId defaults to the default project, visible in subsequent `GET`. Verified with real Nest app + supertest.
- AC-2: missing/empty/whitespace title → 400 nothing created (via DTO `@Transform` trim + `@IsNotEmpty`); unknown projectId → 400 nothing created.
- AC-3: `POST /api/projects` — 201 happy path with name+key; 400 when either missing; nothing created on failure.
- AC-4: create form → `createTicket()` → parent refetches (`loadTickets()`, no local optimistic insert, consistent with T-002's no-local-seed-data precedent) → ticket appears in To Do; form clears on success. Verified by RTL test (fetch faked) and by a live browser smoke: both dev servers up, real vite proxy, curl'd the create endpoints directly and confirmed 201/400/400 responses end-to-end.
- Circular-dependency fix (moving `DEFAULT_PROJECT_ID` from tickets/tickets.service.ts to projects/project.entity.ts, re-exported from tickets.service.ts for backward compat): Critic confirmed the module graph is now one-directional — TicketsModule imports ProjectsModule, no back-reference — no cycle at file or Nest-DI level.
- TDD ledger: 4 planned behaviors = 4 RED→GREEN cycles (B-4 needed one honest re-RED after a bug in my own test's fetch mock — a stateless stub that could never reflect the POST — per LANE philosophy §2, "fixing your own wrong test with a re-RED is honest work"), plus 2 refactor passes, plus 1 backfilled regression test. Full suite green at review (jest 18/18, vitest 5/5), backend `npm run build` clean.

⚠️ **Divergent:** deviation + severity (shallow/deep) — both raised by the Critic, both fixed before this report
- (deep, FIXED) **Initial flag:** the unknown-`projectId` referential-integrity check first landed in `TicketsController.create()`, not a service — violating CONSTITUTION conv. 2 ("logic in controllers" is a NOT) and BLUEPRINT's boundary rule (services own domain rules), and diverging from the approved exec-plan's stated approach ("`TicketsService.create` gains a projectId-existence check") without updating the plan. **Fix:** added `ProjectsService.exists(id)` and a new `TicketsService.createValidated()` that checks existence via that domain query before delegating to the existing `create()`. The controller now only calls `tickets.createValidated(dto)` — no domain logic in the controller. `TicketsService.create()` itself stays exactly as T-002 left it (the raw, unprotected domain seam T-002's test seeds through directly) — zero risk to that already-landed behavior. Verified: full suite still green, build clean, no test file touched by this fix.
- (shallow, FIXED) **Initial flag:** TSD explicitly calls for coverage of "201 happy path (default + explicit project)" but only the default-project path was tested. **Fix:** added `tickets.controller.create-explicit-project.spec.ts` covering POST with an explicit, existing (non-default) projectId. Since the passing behavior already existed from B-1/B-3's implementation, this was committed honestly via `lane red --backfill` (not claimed as a fresh RED→GREEN cycle) — it is a non-ledger regression guard, not part of the 4-behavior TDD count above.
- (shallow, pre-existing from T-001/T-002, unaddressed here) Backend Hello World controller/service/specs and the generator's `test/app.e2e-spec.ts` remain — untouched by this task's tests, so lane's refactor audit would still refuse removing them here. Still deferred to a dedicated cleanup task.
- (shallow, discovered here) `npm run build` in backend/ failed on TS1272 (decorator-metadata reflection can't preserve erased interface types on decorated method return types) once the new `@Post` handlers were added. Fixed by importing `Ticket`/`Project` as `import type` in the two controllers — a build-only fix, no behavior change, tests unaffected.

🚨 **Suspected hallucination:** flag for human (false positives expected — do NOT reject PR on this alone)
- none

❌ **Missing:** acceptance criteria not addressed
- none (the one coverage gap the Critic found — explicit projectId — is now closed per above)

**TDD cycle log:**
| Behavior | RED ✅ | GREEN ✅ | Test = behavior not impl | Public interface only | Mocks @ boundary only |
|----------|--------|---------|--------------------------|----------------------|----------------------|
| B-1: POST /api/tickets happy path (+ backfilled explicit-project coverage) | ✅ | ✅ | ✅ | ✅ HTTP | ✅ none |
| B-2: POST /api/tickets validation (title, projectId) | ✅ | ✅ | ✅ | ✅ HTTP | ✅ none |
| B-3: POST /api/projects (happy path + validation) | ✅ | ✅ | ✅ | ✅ HTTP | ✅ none |
| B-4: create form → board update, no manual reload | ✅ (re-RED once, own test bug) | ✅ | ✅ | ✅ rendered DOM | ✅ fetch only |

**Critic checklist:** (checkboxes — `done` only enforces checkboxes; resolve each)
- [x] Mocks only at boundaries — frontend `fetch` stub only; backend mocks nothing (real AppModule + supertest)
- [x] Each AC verified per its tag (behavior→HTTP/DOM interface; e2e→live smoke + faked-fetch unit test)
- [x] Boundary contract asserted richly — fetch stub pinned to real endpoint paths and methods (GET vs POST distinguished), payload shapes match the real API
- [x] ≥1 `e2e` AC present and GREEN — AC-4: live servers, real proxy, curl'd create/validation end-to-end
- [x] Boundaries non-empty ⇒ smoke AC exists — AC-4 hits the real HTTP boundary via the real vite proxy

**Human verdict:** each item confirmed/dismissed (Path L) — the lane approve stamp records who signed
**Outcome:** clean → merge (both Critic flags resolved by refactor + backfill, not by amendment — no spec change was needed, only an implementation correction)
