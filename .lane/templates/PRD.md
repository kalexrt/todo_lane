---
approved_by: ""
approved_at: ""
---
# PRD <FEAT> — <feature title>
> User stories + acceptance criteria + success metrics. Signed off by PM + SA + DS.
> Feature-scoped (LANE §8): one PRD per feature/milestone, under docs/features/<FEAT>-<slug>/.

**Source:** roadmap milestone <M> | real-usage feedback | Briefing <FEAT>   ← why this feature exists (audit chain, §4; trace ↑ to BRIEFING.md)
**Parent:** <NNNN of the master/umbrella PRD this rolls up to, if any — optional, prose only>   ← for a `master` iteration leave blank; it IS the umbrella

---

## Story S-<FEAT>.01 — <title>
As a <user> I want <capability> so that <value>.

**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
> `behavior` = observable outcome through an interface (no "calls X / writes row Y"). `invariant` = no public surface (encrypted-at-rest, no-PII). `non-functional` = perf/accuracy/a11y. `e2e` = reachable by a real user through the running system.
- [ ] AC-1 [behavior] — <observable outcome through interface>
- [ ] AC-2 [e2e] — <user-reachable end-to-end>   ← every story needs ≥1 `e2e` AC

**Success metric:** <how we know it worked>
