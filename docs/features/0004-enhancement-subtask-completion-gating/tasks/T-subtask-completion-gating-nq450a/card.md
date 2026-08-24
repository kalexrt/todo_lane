---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-24"
approved_sha256: "92505041f88254ff918bda4cb51917c4521a724193e20ee9c2d56ef2d4e50bbf"
---
## Task T-subtask-completion-gating-nq450a — A parent cannot reach done until its subtasks are done
**Parent:** story S-0004.02 · feature 0004-enhancement-subtask-completion-gating (docs/features/0004-enhancement-subtask-completion-gating-*/ — its PRD + TSD)
**Slice:** a complete observable behavior end-to-end + tests (full vertical — a disconnected layer = smell)
**Acceptance criteria:** (tag each `behavior`/`invariant`/`non-functional`/`e2e`; behavior ACs = observable outcome through an interface — NO "calls X / saves to table Y / uses lib Z")
- [ ] AC-1 [behavior]: `PATCH /api/tickets/:id/status` moving a parent ticket to `done` returns 400 when at least one of its subtasks is not `done`, and the parent's status is unchanged.
- [ ] AC-2 [invariant]: A rejected move-to-`done` persists nothing — the parent's status is unchanged and no subtask is modified.
- [ ] AC-3 [behavior]: Once every subtask of a parent is `done`, moving that parent to `done` returns 200 and the parent becomes `done`.
- [ ] AC-4 [behavior]: A ticket with no subtasks moves to `done` exactly as before — no regression for parent-less tickets.
- [ ] AC-5 [behavior]: Moving a parent to `todo` or `in_progress` is never gated, even when it has open subtasks.
- [ ] AC-6 [e2e]: In the running app a user creates a parent with a subtask, is blocked from moving the parent to Done, moves the subtask to Done, then moves the parent to Done successfully.
**End-to-end AC:** AC-6 [e2e] — reachable through the running app (required: green component/unit ≠ reachable)
**Tests:** AC-1 ← ordered; first = tracer bullet — then AC-2, AC-3, AC-4, AC-5 (backend), then AC-6 (frontend + smoke). AC-1 is the tracer bullet: a parent with an open subtask is rejected from `done` and stays unchanged. Depends on T-subtask-completion-gating-l9qjli (subtasks must exist before gating can be exercised).
<!-- exception: Tests: N/A — reason: config | scaffolding | spike | refactor | tooling | integration -->
**Test scope:** tests/T-subtask-completion-gating-nq450a/   ← documentation: where this task's OWN tests live. Scope is NOT configured — red/green scope to the changed test files and `verify` derives it from the RED commits (ADR-0002); `review` runs the FULL suite. This line is a human pointer only.
<!-- approval: written by `lane approve` as frontmatter (approved_by/at/sha256) after a human confirms — never hand-edit -->
**Done =** reviewable PR, all tests pass, links to chain. One PR per task (default).
