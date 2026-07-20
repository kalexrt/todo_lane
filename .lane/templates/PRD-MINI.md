---
approved_by: ""
approved_at: ""
---
# Mini PRD <FEAT> — <enhancement title>
> An `enhancement` iteration (LANE §8) — a small, scoped improvement on top of what already
> ships. Lighter than a full feature PRD: usually one story, no full success-metrics apparatus.
> Paired with TSD.md in this folder. If it grows past a couple of stories, it's a `feature` —
> create one instead.

**Parent:** <NNNN of the feature/master this builds on, if it rolls up to one — optional, prose only>
**Source:** roadmap milestone <M> | real-usage feedback   ← why this exists (audit chain, §4; trace ↑ to docs/ROADMAP.md)

---

## Story S-<FEAT>.01 — <title>
As a <user> I want <capability> so that <value>.

**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
> `behavior` = observable outcome through an interface. `e2e` = reachable by a real user through the running system.
- [ ] AC-1 [behavior] — <observable outcome through interface>
- [ ] AC-2 [e2e] — <user-reachable end-to-end>   ← every story needs ≥1 `e2e` AC

**Success metric:** <how we know it worked — one line is fine for an enhancement>
