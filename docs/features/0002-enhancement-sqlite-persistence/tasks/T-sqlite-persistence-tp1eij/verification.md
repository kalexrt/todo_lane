## Verification — Task <T-ID> — <date>
> Critic anchored to TSD (external spec), NOT to the code. ★GATE: owner confirms/dismisses every flag.

✅ **Conformant:** items matching spec
-
⚠️ **Divergent:** deviation + severity (shallow/deep)
-
🚨 **Suspected hallucination:** flag for human (false positives expected — do NOT reject PR on this alone)
-
❌ **Missing:** acceptance criteria not addressed
-

**TDD cycle log:**
| Behavior | RED ✅ | GREEN ✅ | Test = behavior not impl | Public interface only | Mocks @ boundary only |
|----------|--------|---------|--------------------------|----------------------|----------------------|
| B-1: ... | | | | | |

**Critic checklist:** (checkboxes — `done` only enforces checkboxes; resolve each)
- [ ] Mocks only at boundaries — no asserts on internal collaborators / call-counts
- [ ] Each AC verified per its tag (behavior→interface · invariant→property · non-functional→harness)
- [ ] Boundary contract asserted richly (args/content), not bare "was called"
- [ ] ≥1 `e2e` AC present and GREEN (reachable through the running system)
- [ ] Boundaries non-empty ⇒ a smoke AC exists (real boundary, staging)

**Human verdict:** each item confirmed/dismissed (Path R: + SA) — the lane approve stamp records who signed
**Outcome:** clean → merge | divergence → Amendment (.lane/templates/AMENDMENT.md) → re-spec → re-run
