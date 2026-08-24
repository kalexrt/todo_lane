---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-24"
approved_sha256: "a6a779dc91e430e3403ae7e9fb104296cb2708b1795f034b5f0b6a398c169ff3"
---
# Mini PRD 0004 — Subtasks with completion gating
> An `enhancement` iteration (LANE §8) — a small, scoped improvement on top of what already
> ships. Lighter than a full feature PRD: usually one story, no full success-metrics apparatus.
> Paired with TSD.md in this folder. If it grows past a couple of stories, it's a `feature` —
> create one instead.

**Parent:** 0001 (master ticket tracker) — this enhancement adds a parent/child subtask relation and the first status-transition gating rule on top of the persistent tracker from 0002; it changes no existing behavior or API shape for tickets that have no subtasks.
**Source:** product intent + real-usage feedback — PRODUCT.md flags status-transition gating as "the planned future change this codebase is shaped to receive," and BLUEPRINT designates `PATCH /api/tickets/:id/status` as the one seam where it lands; users want to break a ticket into smaller children and have the board reflect completion honestly. (ROADMAP.md is not yet numbered — this realizes its planned transition-gating milestone; trace ↑ to docs/ROADMAP.md.)

---

## Story S-0004.01 — A ticket can have subtasks
As a developer using the tracker locally I want to break a ticket into smaller subtasks so that a piece of work can be tracked at a finer grain beneath its parent.

**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
> `behavior` = observable outcome through an interface. `e2e` = reachable by a real user through the running system.
- [ ] AC-1 [behavior] — A new ticket can be created as a subtask of an existing ticket (its parent); the created subtask is itself a ticket, with its own title, description, and status (`todo` | `in_progress` | `done`), belonging to the same project as its parent.
- [ ] AC-2 [behavior] — The list of tickets exposes each subtask's parent relationship, so a client can tell which tickets are subtasks of which parent (and which tickets have no parent).
- [ ] AC-3 [invariant] — Subtasks nest exactly one level deep: a ticket that is already a subtask cannot be made a parent. Creating a subtask whose named parent is itself a subtask is rejected with an error and nothing is persisted.
- [ ] AC-4 [invariant] — Creating a subtask whose named parent does not exist is rejected with an error and nothing is persisted.
- [ ] AC-5 [behavior] — A subtask's status is changed through the same ticket status endpoint as any ticket; there is no separate subtask-only status path.
- [ ] AC-6 [e2e] — In the running app, create a ticket, add a subtask to it, and see the subtask shown nested beneath its parent on the board (a subtask is not shown as a standalone top-level card; the top-level board shows only parent-less tickets).

**Success metric:** A user can decompose any ticket into one level of subtasks, and the board renders those subtasks nested under their parent rather than as loose top-level cards.

## Story S-0004.02 — A parent cannot reach `done` until its subtasks are done
As a developer I want a parent ticket to be blocked from `done` while any of its subtasks is not `done` so that the board cannot mark a ticket complete with open children.

**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
> `behavior` = observable outcome through an interface. `e2e` = reachable by a real user through the running system.
- [ ] AC-1 [behavior] — Moving a parent ticket to `done` is rejected when at least one of its subtasks is not `done`; the error response indicates that incomplete subtasks are blocking the transition.
- [ ] AC-2 [invariant] — A rejected move persists nothing — the parent's status is unchanged and no subtask is modified.
- [ ] AC-3 [behavior] — Once every subtask of a parent is `done`, moving that parent to `done` succeeds.
- [ ] AC-4 [behavior] — A ticket that has no subtasks is unaffected: it may move to `done` exactly as before (no regression to existing behavior or API shape for parent-less tickets).
- [ ] AC-5 [e2e] — In the running app, create a parent ticket with a subtask, attempt to move the parent to Done (it is blocked), move the subtask to Done, then move the parent to Done (it now succeeds).

**Success metric:** A parent ticket can reach `done` only when all its subtasks are `done`; a parent-less ticket behaves exactly as before.

---

**Out of scope (v1):** multi-level nesting (subtasks of subtasks); auto-progressing or auto-reopening a parent when its subtasks change; blocking the creation of a subtask under a parent that is already `done` (a parent already at `done` may still gain a subtask — the gating rule is checked only at the parent's `done` transition). These are noted, not built; the human approval gate may revise scope.
