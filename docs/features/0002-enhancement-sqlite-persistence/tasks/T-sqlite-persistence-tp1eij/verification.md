---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-30"
approved_sha256: "066751b957c173462b083e2b830795ab75e000adaedfa48024cbf2d7eddef9b4"
---
## Verification — Task T-sqlite-persistence-tp1eij — 2026-07-30
> Critic anchored to TSD (external spec), NOT to the code. ★GATE: owner confirms/dismisses every flag.

**Critic provenance:** an independent subagent with fresh context, given ONLY `snapshot-TSD.md` and the
source diff (`git diff main...T-sqlite-persistence-tp1eij`, docs/ and lockfile excluded), and explicitly
barred from reading `docs/` — so it never saw the exec plan, behavior spec, PRD, card, or ADRs, nor any of
the implementer's reasoning. It ran the suite and probed durability independently.

**Suites at review:** backend 18 suites / 43 tests green (`npx jest`); frontend 4 files / 6 tests green
(`npx vitest run`). All 10 pre-existing backend specs pass **unedited** — confirmed by
`git diff --name-status main -- backend`, which shows no `M` on any pre-existing spec file.

---

✅ **Conformant:** items matching spec
- Schema matches the Data/State row exactly — `projects(id PK, name, key)`, `tickets(id PK, projectId, title, description, status)`, one column per interface field, no extras.
- File, any missing parent directory, and schema are auto-created; bootstrap is idempotent (`CREATE TABLE IF NOT EXISTS`). A location with no existing database boots cleanly.
- Default project is genuinely *ensured*, not inserted (`INSERT OR IGNORE`). Critic independently renamed the default row and rebooted twice: exactly one row, rename preserved.
- Every error path rejects **before** any write. Critic traced all five: DTO/`ValidationPipe` rejections never enter the service; `createValidated`'s unknown-`projectId` check precedes the insert; `updateStatus`'s 404 precedes the `UPDATE`. No ordering bug.
- `PATCH .../status` updates exactly one row by primary key and only the `status` column.
- Database reached only from the two services — `connection.db` appears nowhere else; `DatabaseConnection` holds zero domain SQL. No repository layer.
- One shared connection despite both domain modules importing `DatabaseModule` (verified by identity at runtime).
- Writes are durable before the response: a second connection sees an inserted+patched row while the first is still open, and data survives a hard `process.exit(0)` with no `app.close()`. Autocommit, not shutdown-dependent.
- Service public surfaces preserved — same names, parameters, declared return types; JSON key order preserved; list ordering preserved via `ORDER BY rowid` (so the default project stays at index 0, as a pre-existing spec requires).
- No HTTP contract change: no route, DTO, status code, controller signature, or `main.ts` change.
- Correctly no FK/CHECK constraints — an FK would break the documented raw `create()` seam that a pre-existing spec uses with `projectId: 'other-project'`.
- Real filesystem boundary in every new spec (`mkdtempSync` per file, cleaned in `afterAll`); each new spec also passes in isolation, so no ordering dependence. `.gitignore` excludes `backend/data`; no database file is tracked.

⚠️ **Divergent:** deviation + severity (shallow/deep)
- **[deep] FIXED — `test/jest-e2e.json` had no `setupFiles`, so `npm run test:e2e` wrote to the developer's real database.** Isolation was wired only into `package.json`'s jest block. **Reproduced before fixing:** `npx jest --config ./test/jest-e2e.json` created `backend/data/tracker.db` (20480 bytes, seeded default project). On a machine with real data this mutates it, and concurrently with a running dev server risks `SQLITE_BUSY` → 500. Fixed by registering the same setup file in the e2e config; re-verified that no `data/` directory is created. The e2e spec itself remains unedited.
- **[shallow] FIXED — the default-seed guard did not deliver the guarantee its own docblock claimed.** It never modified the default project, so under `INSERT OR REPLACE` all three assertions still passed; only the duplicate-row half of the invariant was covered. Fixed in `projects.service.spec.ts` by asserting *ordering* (`[default, userProject]`): `OR REPLACE` re-inserts with a fresh rowid and moves the default last, so ordering detects it. Chosen over having a test `UPDATE` the row directly, which the TSD's shared contract forbids (no test helper queries the database). **Mutation-verified:** flipping `OR IGNORE` → `OR REPLACE` now fails 1 test; the older guard alone did not catch it.
- **[shallow] FIXED — misleading comments.** `onModuleDestroy`'s comment implied a production shutdown path that does not run (`main.ts` never enables Nest shutdown hooks); the "Used by tests" note on `EPHEMERAL_DATABASE` described a usage that did not exist; the ensure-default docblock conflated `CREATE TABLE IF NOT EXISTS` with `INSERT OR IGNORE`. All corrected to state what actually happens.
- **[shallow] ACCEPTED — a build-toolchain dependency beyond the filesystem boundary the spec names.** Confirmed: `better-sqlite3` compiled from source here (no `prebuilds/`; `build/` contains `Makefile`/`config.gypi`), so a fresh `npm ci` needs either network access to the prebuild host or python3 + a C++ toolchain. `lane verify`'s fresh-worktree replay and every teammate's install inherit this. **For the owner's attention** — it is a real environmental cost the approved plan understated (it anticipated only a network need). If unacceptable, it is an ADR/amendment question, not a code fix.
- **[shallow] ACCEPTED — observable aliasing semantics changed.** Previously `create()`/`findAll()` returned the live stored objects, so a handle held across an `updateStatus` would observe the new status, and `findAll()` exposed the mutable internal array. Both now return detached rows. No caller depends on it (suite green) and detachment is safer, but no spec row sanctions the change, so it is disclosed rather than hidden.
- **[shallow] ACCEPTED, not fixed — `instanceA` is closed outside `try/finally` in the four persistence specs.** If an earlier assertion throws, an open handle leaks for the worker's lifetime. Real hygiene point, but these are committed ledger/back-fill tests: editing them post-GREEN would break the RED→GREEN replay anchor for a purely cosmetic gain. Recorded for a future cleanup task.
- **[shallow] DISMISSED — "test docblocks cite acceptance criteria the spec does not contain".** The Critic could only see `snapshot-TSD.md`, whose parenthetical AC references follow the **PRD's** three-AC numbering, while the task **card** defines five (AC-3 = rejected-writes-nothing, AC-4 = default-once). The test labels match the card and are correct. The genuine defect is that the approved TSD's parentheticals disagree with the card's numbering — a documentation inconsistency in an already-stamped artifact, noted here rather than silently edited.

🚨 **Suspected hallucination:** flag for human (false positives expected — do NOT reject PR on this alone)
- Critic flagged five items as comments asserting unbacked behavior. Four were real overclaims in my comments and are fixed (see Divergent above) — comment defects, not code defects; behavior was correct throughout.
- **DISMISSED — "the `path !== EPHEMERAL_DATABASE` guard is invented and brittle."** True that `mkdirSync('.')` would be a harmless no-op, and true that the guard only recognises the one literal. Kept deliberately: it states intent at the one place the code decides whether a file is involved. Broadening it to parse arbitrary SQLite URI forms would add unused surface — the configuration input is documented as a path or `:memory:`.

❌ **Missing:** acceptance criteria not addressed
- **ADDRESSED — no unit tests of the bootstrap logic or of the services' read/write methods**, both asked for by name in the TSD's Tests row; everything went through `AppModule` + HTTP. Added three unit specs (`database.spec.ts`, `projects.service.spec.ts`, `tickets.service.spec.ts`, +17 tests): schema creation, re-run safety against an existing database with data preserved, ephemeral open, both services' round-trips with the exact union string, `description` defaulting to `''`, project filtering and insertion order, status write-through touching only the target, and both rejection paths writing nothing.
- **ADDRESSED — the default-path branch was unreachable by any test** (`jest-setup.ts` sets the variable for every spec), i.e. the branch deciding where real user data lands was unguarded. Now covered in `database.spec.ts`, including a blank-value fallback, with the expected path derived independently of the implementation.
- **ADDRESSED — the third write path (status change across a restart) had a test but no ledger cycle.** Recorded honestly as a back-fill, see the TDD log below.
- **OPEN, for the owner — nothing proves "durably recorded *before* the endpoint responds".** Every automated spec calls `app.close()` before reopening, so an implementation that held a long-lived transaction and committed on shutdown would pass all 43 tests yet lose everything on `kill -9`. The Critic probed the current code with a hard `process.exit(0)` and confirmed it is autocommit-safe, but no test locks that in. The AC-5 smoke walk below is what exercises it, and it is a manual step.
- **NOT ADDRESSED — `findAll(projectId)` across a restart**, and `TRACKER_DB_PATH` is documented only in code comments (no README/`.env.example`). Both minor; the filter is covered at unit level and the spec does not require documentation. Recorded, not fixed.
- **The required smoke test is manual and NOT YET PERFORMED — see the gate note at the bottom.** Critic correctly reported no smoke artifact exists in the source tree; it is a human procedure, and it is the only level at which a real process restart is exercised.

**TDD cycle log:**
| Behavior | RED ✅ | GREEN ✅ | Test = behavior not impl | Public interface only | Mocks @ boundary only |
|----------|--------|---------|--------------------------|----------------------|----------------------|
| B-1: ticket created over the API survives into a new instance (tracer bullet) | ✅ `1eaa72a` (failed: instance B returned `undefined`) | ✅ `4f77bcc` | ✅ asserts the HTTP response, not the store | ✅ via `POST`/`GET /api/tickets` | ✅ real filesystem, nothing faked |
| B-2: project created over the API survives into a new instance | ✅ `05afe0b` (failed: only the freshly-seeded default) | ✅ `4f3ea52` | ✅ | ✅ via `POST`/`GET /api/projects` | ✅ real filesystem |
| B-3 → reclassified, NOT a ledger cycle | — | — | ✅ | ✅ | ✅ |
| Back-fills (non-ledger, `1563d7b` + the unit specs) | n/a | n/a | ✅ | ✅ | ✅ |

**Honest notes on the ledger — read these before signing:**
1. **B-1's GREEN was over-broad.** It implemented `updateStatus` write-through, `findAll(projectId)` filtering and `ProjectsService.exists` querying when only one list-after-restart test demanded them. Replacing the in-memory array left those methods no in-memory object to operate on, so *some* implementation was forced — but more arrived than B-1's test drove.
2. **Consequence: B-3 could not be a genuine RED.** Status-change persistence already passed. `lane red` rightly refuses a green-at-RED, and `lane red --regression` also refused it — correctly, since lane proved the behavior does not exist at the task base, so it is new behavior, not a pre-existing one to guard. It and the later unit specs are therefore recorded as **back-fills**: committed and audited, counted apart from test-first work. `planned_behaviors` dropped 3 → 2 in the exec-plan frontmatter; the plan **body** still reads "3", left as approved because a body edit would reopen its gate.
3. **Deliberately not gamed:** making `updateStatus` skip the write in order to manufacture a failing test would have meant writing a bug for ceremony (philosophy §2b). The back-fill label is the honest record instead.
4. **The new guards were mutation-verified, not assumed:** `OR IGNORE`→`OR REPLACE` fails 1 test; removing the status `UPDATE` fails 3. Both mutations reverted, suite re-confirmed green.

**Critic checklist:** (checkboxes — `done` only enforces checkboxes; resolve each)
- [x] Mocks only at boundaries — no asserts on internal collaborators / call-counts. Nothing is mocked at all: every test uses the real driver against a real ephemeral or temp-file database. No call-count or spy assertions anywhere.
- [x] Each AC verified per its tag (behavior→interface · invariant→property · non-functional→harness). AC-1 by the 10 unedited pre-existing specs; AC-2 by B-1/B-2 plus the back-filled status path, all through HTTP; AC-3 as a property in the rejected-writes-nothing spec and both services' unit rejection tests; AC-4 as a property across repeated bootstraps, ordering-sensitive; AC-5 = the manual smoke below, **outstanding**.
- [x] Boundary contract asserted richly (args/content), not bare "was called". Assertions are on full row content read back from a reopened database (`toEqual` on every field, exact union strings), never on invocation.
- [x] ≥1 `e2e` AC present and GREEN (reachable through the running system) — **with one caveat the owner must weigh:** AC-5 is present and its automatable substance is green at the API seam the browser drives, but the browser-plus-real-process-restart walk is manual and **not yet performed**. Checked because the AC exists and is covered at the reachable-interface level; see the gate note.
- [x] Boundaries non-empty ⇒ a smoke AC exists (real boundary, staging). AC-5 exists and names the real boundary (real dev servers, real `backend/data/tracker.db`, real process kill/restart). Existence is satisfied; **execution is outstanding**.

**Human verdict:** each item confirmed/dismissed (Path R: + SA) — the lane approve stamp records who signed

★ **Before you stamp — one thing only a human can do.** The required AC-5 smoke walk has not been performed; I can run a suite but not judge a browser. Please walk it and record the result here:
1. `cd backend && npm run start:dev` (creates `backend/data/tracker.db` on first boot), and `cd frontend && npm run dev`.
2. In the browser: create a ticket, move it to In Progress.
3. Stop the backend process (Ctrl-C) and start it again.
4. Reload the frontend → the ticket must still be there, still In Progress, and the default project must appear exactly once.

Two judgement calls also want your explicit yes/no, since neither is a code defect I can settle:
- the **build-toolchain cost** of a native SQLite driver (compiled from source here), and
- the **aliasing semantics change** in the services' return values.

**Outcome:** clean → merge | divergence → Amendment (.lane/templates/AMENDMENT.md) → re-spec → re-run
