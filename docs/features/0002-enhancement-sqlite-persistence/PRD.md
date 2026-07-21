---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-21"
approved_sha256: "35819d38d05ff9f7615d75bb019d28c9dc213e35d007a9d4662e973d1d0aa823"
---
# Mini PRD 0002 — Persist tickets and projects in SQLite
> An `enhancement` iteration (LANE §8) — a small, scoped improvement on top of what already
> ships. Lighter than a full feature PRD: usually one story, no full success-metrics apparatus.
> Paired with TSD.md in this folder. If it grows past a couple of stories, it's a `feature` —
> create one instead.

**Parent:** 0001 (master feature) — this enhancement replaces that feature's in-memory storage with SQLite; no other behavior changes.
**Source:** user request — the tracker currently loses all data on every backend restart, which is no longer acceptable now that the basic tracker works; see ADR-0002.

---

## Story S-0002.01 — Tickets and projects survive a backend restart
As a developer running the tracker locally I want my tickets and projects to still be there after I restart the backend so that I don't lose my board every time I stop the server.

**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
> `behavior` = observable outcome through an interface. `e2e` = reachable by a real user through the running system.
- [ ] AC-1 [behavior] — Every existing API behavior (list/create projects, list/create/filter tickets, change a ticket's status, and every validation/error case: 400 on empty title, 400 on unknown projectId, 400 on invalid status, 404 on unknown ticket id) continues to work exactly as before — this enhancement changes storage, not behavior or API shape.
- [ ] AC-2 [invariant] — The default project seeded at boot exists exactly once no matter how many times the backend restarts against the same database file (it is not re-inserted on every boot).
- [ ] AC-3 [e2e] — Create a ticket and move it to `in_progress` through the running app, restart the backend process, and reload the frontend: the ticket is still there, still `in_progress`.

**Success metric:** Stopping and restarting the backend no longer loses any ticket or project data; a fresh checkout with no existing database file still boots cleanly (the file/schema is created automatically).
