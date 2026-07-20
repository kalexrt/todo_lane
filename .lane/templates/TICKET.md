---
approved_by: ""
approved_at: ""
---
# Bug Ticket <FEAT> — <short title>
> A `fix` iteration (LANE §8 path C). No PRD — the problem is known; the question is only how
> to fix it. Defines what should change AND what must NOT. Paired with TSD.md in this folder;
> the Critic anchors to the TSD, the TSD's story IDs are S-<FEAT>.nn.

**Parent:** <NNNN of the feature/master this fixes, if it rolls up to one — optional, prose only>
**Severity:** <blocker | major | minor>
**Source:** <where reported — real-usage feedback, monitoring, QA>   ← audit chain (§4)

---

## Story S-<FEAT>.01 — fix <short title>

**Current behavior:** <what happens now — the detailed scenario that triggers it, not just the error message>
**Expected behavior:** <what should happen instead>
**Reproduction:** <steps to reproduce>
**Must NOT change:** <behavior/contracts that must stay intact — guards against regression>

**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
- [ ] AC-1 [behavior] — <observable outcome that proves the fix, through an interface>
- [ ] AC-2 [e2e] — <user-reachable end-to-end>   ← every story needs ≥1 `e2e` AC

**Architectural?** If the fix needs a design change, write an ADR first (docs/adr/), then the TSD.
