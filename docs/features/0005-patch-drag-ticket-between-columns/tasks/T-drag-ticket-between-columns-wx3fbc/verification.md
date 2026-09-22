## Verification — Task T-drag-ticket-between-columns-wx3fbc — 2026-09-22
> Critic anchored to TSD (external spec), NOT to the code. ★GATE: owner confirms/dismisses every flag.

Reviewer: subagent Critic, fresh context, given ONLY snapshot-TSD.md + `git diff main...T-drag-ticket-between-columns-wx3fbc`.
(`critic_mode` is undeclared in lane.config — see Divergent D-4.)

✅ **Conformant:** items matching spec
- Interfaces — a drop calls the same `moveTicket` → `updateTicketStatus(id, status)` path the "Move to" buttons call (`App.tsx`). No new client function, no new endpoint, no direct `fetch` in the component. The `PATCH /api/tickets/:id/status` seam is respected (BLUEPRINT boundary rule).
- Data / State — only transient view state: the drag payload in `dataTransfer`, `dropTarget`, and a `dragDepth` ref for enter/leave pairing. Nothing persisted client-side; `loadTickets()` re-fetch after a drop matches the button path.
- Behavior — cross-column drop changes status and re-renders; own-column drop is a no-op; hover indication appears, survives crossing the column's own children, and clears on leave and on drag end.
- Boundaries — no drag-and-drop library added (`frontend/package.json` unchanged). Tests fake only `fetch`, mirroring `App.move.test.tsx`. No domain rule leaked to the frontend: the same-status short-circuit is mandated by the frozen spec's own Behavior row ("issues no status request"), not invented transition gating.
- Critic explicitly disproved the GREEN tripwire: both original GREEN commits are pure additions to `App.tsx`; nothing existing was removed or loosened, and the pre-existing specs pass unmodified.
- AC-3 invariant holds — `App.move.test.tsx` is untouched and green, so the button path (the keyboard/assistive route) still works.

⚠️ **Divergent:** deviation + severity (shallow/deep)
- D-1 (shallow, RESOLVED): tests were weaker than the spec. Critic mutation-tested the suite: deleting `onDragOver` (with its `preventDefault`), deleting the `draggable` attribute, or hard-coding the column `className` each left all 12 tests green while breaking the feature in a real browser. **Resolution:** added `frontend/src/App.drag.guards.test.tsx` — 4 guards that all fail under exactly those mutations (re-verified by re-running the mutation). Recorded via a plain test-only commit; see D-3 for why `lane red --regression` could not be used.
- D-2 (shallow, RESOLVED): the spec's hover-indication clause had zero test coverage, and the implementation cleared the highlight whenever `dragleave` bubbled from a column's own child — a visible flicker in a real browser over exactly the area the user is aiming at. **Resolution:** driven as behavior B-3 (RED → GREEN). Reimplemented with dragenter/dragleave depth counting rather than `relatedTarget` (which jsdom does not propagate and which is unreliable across browsers), and the B-3 test now models the real browser event order.
- D-3 (deep, NOT RESOLVED — needs a human): `setup_cmd` is empty in `.lane/lane.config`, and lane judges RED against the committed state inside the throwaway tree at `~/.cache/lane/scratch/todo_lane-7a77d8a3`, which has **no `node_modules`** (confirmed by inspection). Every frontend test therefore fails there for dependency reasons regardless of merit. Consequences: (a) lane reported "the code it imports doesn't exist" on all three REDs, which was false each time; (b) a genuinely-passing regression guard was misjudged as a real RED, so `lane red --regression` was refused; (c) `lane verify` replays in that same tree and is expected to fail until this is fixed. Each RED was therefore confirmed by hand in a provisioned worktree before being recorded — B-1 failed on the empty Done column, B-2 on a redundant `todo`→`todo` PATCH, B-3 on the cleared highlight class. **This weakens the automated RED proof for this task and needs fixing on `main` as its own commit before the next task.**
- D-4 (shallow, NOT RESOLVED — needs a human): `critic_mode` is undeclared in lane.config, so lane spawned nothing automatically and the reviewer choice was made ad hoc. Declare `critic_mode: human | subagent` once to retire the ambiguity.

🚨 **Suspected hallucination:** flag for human (false positives expected — do NOT reject PR on this alone)
- None. The Critic's mutation claims were independently reproduced before acting on them, and its tripwire hypothesis was checked and correctly disproved rather than assumed.

❌ **Missing:** acceptance criteria not addressed
- None. AC-1 covered by B-1, AC-2 by B-2, AC-3 by the untouched pre-existing `App.move.test.tsx`.
- Accepted and deliberately NOT fixed (out of the frozen spec's scope, recorded for the owner):
  - `effectAllowed` / `dropEffect` are never set, so the drag cursor is generic rather than a move cursor and a column advertises acceptance of any drag (files, external text). The `!id` / unknown-ticket guards make a foreign drop harmlessly ignored, so this is cosmetic, not a correctness defect.
  - `.column` has no `min-height`, so an empty column is a small drop target. A usability consequence of the feature, not a spec clause.
  - The hand-rolled `makeDataTransfer` reports `types: []` and permits `getData` in any phase, unlike a real `DataTransfer`. Nothing is masked today (the implementation reads `getData` only during `drop`, which is the one phase real browsers allow), but the stand-in would green-light an implementation that read it during `dragover`. Noted for whoever extends the file.

**TDD cycle log:**
| Behavior | RED ✅ | GREEN ✅ | Test = behavior not impl | Public interface only | Mocks @ boundary only |
|----------|--------|---------|--------------------------|----------------------|----------------------|
| B-1: drop on a different column changes status | ✅ (hand-confirmed, see D-3) | ✅ | ✅ asserts the PATCH issued + rendered position | ✅ via rendered board + HTTP boundary | ✅ only `fetch` faked |
| B-2: drop on own column is a no-op | ✅ (hand-confirmed: redundant `todo`→`todo` PATCH) | ✅ | ✅ asserts absence of any status call | ✅ | ✅ only `fetch` faked |
| B-3: highlight survives crossing a column child | ✅ (re-anchored after correcting the test) | ✅ | ✅ asserts the rendered drop-target class | ✅ | ✅ only `fetch` faked |
| Guards (off-ledger, plain commit): draggable source, dragover preventDefault, highlight set/clear | n/a — already passing | n/a | ✅ each fails under the mutation it guards | ✅ | ✅ only `fetch` faked |

**Critic checklist:** (checkboxes — `done` only enforces checkboxes; resolve each)
- [x] Mocks only at boundaries — no asserts on internal collaborators / call-counts. Only `fetch` is faked; assertions are on recorded HTTP status calls and on rendered DOM, never on component internals.
- [x] Each AC verified per its tag (behavior→interface · invariant→property · non-functional→harness). AC-1 behavior→drag through the rendered board; AC-2 invariant→property "no status call"; AC-3 invariant→held by the untouched pre-existing guard test.
- [x] Boundary contract asserted richly (args/content), not bare "was called". `statusCalls` is asserted by deep equality on `{ id, status }`, so a PATCH with the wrong id or status fails.
- [x] ≥1 `e2e` AC present and GREEN (reachable through the running system). Resolved as NOT APPLICABLE by scope, flagged for the owner: the card declares no `e2e` AC, this is a frontend-only patch, and the backend is unchanged. Reachability in a real browser is instead defended by the D-1 guards (dragover preventDefault, draggable attribute), which are the mechanics jsdom cannot see. No test drives a real browser — if the owner wants that, it is a separate task.
- [x] Boundaries non-empty ⇒ a smoke AC exists (real boundary, staging). Not applicable — the frozen spec's Boundaries row is "None owned externally"; no new external dependency was introduced.

**Human verdict:** each item confirmed/dismissed (Path R: + SA) — the lane approve stamp records who signed
- Owner: please confirm or dismiss D-3 and D-4, and the accepted-not-fixed items under Missing. D-3 is the one that affects more than this task.
**Outcome:** clean → merge | divergence → Amendment (.lane/templates/AMENDMENT.md) → re-spec → re-run
- Recommended: merge. No divergence from the frozen spec's contract remains; D-3/D-4 are lane configuration defects, not defects in this change, and are best fixed as their own commit on `main`.
