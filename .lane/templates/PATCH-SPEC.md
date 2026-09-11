---
approved_by: ""
approved_at: ""
---
# Patch <FEAT> — <short title>
> A `patch` iteration — the TWO-STAMP ceremony for small, known-scope work (a bug fix, a
> tweak, one behavior, one PR). This ONE document is the ticket + TSD + task card + exec
> plan: your single `lane approve` stamp covers all of it (stamp 1 of 2; stamp 2 is the
> verification report at the end). The TDD ledger, Critic snapshot, and verify replay are
> unchanged — a patch removes redundant signatures, never proof.
> Too big for a patch? More than one story, more than ~3 behaviors, or more than one task
> → use `lane new fix` / `lane new enhancement` instead (agents: CALL THIS OUT when
> drafting; the human decides at the stamp).

**Severity:** <blocker | major | minor>
**Source:** <where this came from — bug report, monitoring, review feedback>   ← audit chain

**Current behavior:** <what happens now — the scenario that triggers it, not just the error message>
**Expected behavior:** <what should happen instead>
**Must NOT change:** <behavior/contracts that stay intact — guards against regression>

## TSD S-<FEAT>.01 — <title>
> Behavior + contracts ONLY — never the library/method/pattern. The Critic anchors to THIS
> section (snapshot frozen at `lane start`), exactly as it would to a TSD.md section.

| Aspect | Spec |
|--------|------|
| Interfaces | <contracts touched — endpoint, CLI flag, function/SDK signature> |
| Data / State | <state it touches — empty if none> |
| Behavior | <the observable behavior after the patch> |
| Boundaries | <external deps we DON'T own, faked in tests — empty if none> |
| Tests | <unit/integration — what proves the fix> |

## Task <T-ID> — <short title>
**Slice:** a complete observable behavior end-to-end + tests (full vertical)
**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
- [ ] AC-1 [behavior]: <observable outcome through an interface that proves the fix>
**Tests:** AC-1  ← ordered; first = tracer bullet
<!-- exception: Tests: N/A — reason: config | scaffolding | spike | refactor | tooling — the opt-out is part of what you stamp -->

## Execution Plan
> Approved BY the spec stamp: `lane start` copies this section verbatim into the worktree's
> exec-plan.md and carries your stamp onto it — no separate plan gate. Keep it last in this file.

**Approach:** <high-level how — NOT implementation prescription>
**Boundaries & mocks:** <what's FAKED vs REAL — empty if none>
**Behaviors (TDD order):**
- B-1: <the failing test that proves the bug/behavior, then the change that fixes it>
**Open questions:** <MUST be resolved (or say "none") before the stamp>
