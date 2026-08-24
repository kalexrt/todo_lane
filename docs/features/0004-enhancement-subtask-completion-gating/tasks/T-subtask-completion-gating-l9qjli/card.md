## Task T-subtask-completion-gating-l9qjli — A ticket can have subtasks
**Parent:** story S-0004.01 · feature 0004-enhancement-subtask-completion-gating (docs/features/0004-enhancement-subtask-completion-gating-*/ — its PRD + TSD)
**Slice:** a complete observable behavior end-to-end + tests (full vertical — a disconnected layer = smell)
**Acceptance criteria:** (tag each `behavior`/`invariant`/`non-functional`/`e2e`; behavior ACs = observable outcome through an interface — NO "calls X / saves to table Y / uses lib Z")
- [ ] AC-1 [behavior]: `POST /api/tickets` with a `parentId` creates a ticket whose `parentId` is the parent's id and whose `projectId` is the parent's `projectId`; the response carries `parentId`.
- [ ] AC-2 [behavior]: `GET /api/tickets` (with or without `?projectId=`) returns every ticket with a `parentId` field — `null` for a top-level ticket, the parent's `id` for a subtask.
- [ ] AC-3 [invariant]: `POST /api/tickets` with a `parentId` that names no existing ticket returns 400 and creates nothing.
- [ ] AC-4 [invariant]: `POST /api/tickets` with a `parentId` that names a ticket which is itself a subtask returns 400 and creates nothing (one level of nesting only).
- [ ] AC-5 [behavior]: A ticket created without a `parentId` has `parentId: null` — existing create behavior is preserved.
- [ ] AC-6 [e2e]: In the running app a user adds a subtask to a ticket and the subtask is shown nested beneath its parent on the board, not as a standalone top-level card.
**End-to-end AC:** AC-6 [e2e] — reachable through the running app (required: green component/unit ≠ reachable)
**Tests:** AC-1 ← ordered; first = tracer bullet — then AC-2, AC-3, AC-4, AC-5 (backend), then AC-6 (frontend + smoke). AC-1 is the tracer bullet: a created subtask round-trips with the correct `parentId` and inherited project.
<!-- exception: Tests: N/A — reason: config | scaffolding | spike | refactor | tooling | integration -->
**Test scope:** tests/T-subtask-completion-gating-l9qjli/   ← documentation: where this task's OWN tests live. Scope is NOT configured — red/green scope to the changed test files and `verify` derives it from the RED commits (ADR-0002); `review` runs the FULL suite. This line is a human pointer only.
<!-- approval: written by `lane approve` as frontmatter (approved_by/at/sha256) after a human confirms — never hand-edit -->
**Done =** reviewable PR, all tests pass, links to chain. One PR per task (default).
