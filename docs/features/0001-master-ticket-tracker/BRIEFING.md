---
approved_by: "Kalash Shrestha"
approved_at: "2026-07-20"
approved_sha256: "e2092e8a8023baebf2bc4f1390e781bd0b1cc1962249b8435bc95c28c6698b82"
---
# Briefing 0001 — Barebones Jira-style Ticket Tracker
> Scratch pad — flesh the idea out before committing to a PRD.
> ★ Gate: stakeholder (PM / SA / client) approves before any PRD work begins.
> Approve by running `lane approve` — lane writes the stamp after your y/N confirm.
> Do NOT edit the frontmatter fields by hand; a hand-typed stamp does not count.

## Why
We need a minimal, working ticket tracker as a demo substrate for a later feature: server-side status-transition gating (rules like "a ticket can't jump from todo to done"). Nothing exists yet — this feature builds the tracker itself, deliberately barebones, so the future gating change lands in exactly one well-defined seam instead of being retrofitted into a tangle. Audience: developers running it locally.

## Hypothesis
A two-package app: a NestJS REST API (projects + tickets with title/description/status, in-memory storage) and a React single-page board (list tickets in three status columns, create a ticket, move it between todo / in progress / done). All status changes flow through one dedicated endpoint so gating can later be added in a single place.

## Mocks / references
- Prior art: any Jira/Trello board — three columns (To Do / In Progress / Done), cards with a title, buttons instead of drag-and-drop.
- Grounding: docs/context/PRODUCT.md, BLUEPRINT.md, CONSTITUTION.md (drafted alongside this briefing).

## Scope hints
**Probably in:**
- REST API: list/create projects, list/create tickets, change a ticket's status via a dedicated endpoint (400 on invalid status, 404 on unknown ticket).
- One default project seeded at boot; tickets belong to it.
- React board: three columns by status, create form (title + description), per-card move buttons.
- Monorepo scaffold: `backend/` (NestJS + Jest/supertest), `frontend/` (Vite + Vitest/RTL), independent packages.

**Probably out:**
- Auth, users, roles. Persistence/DB (in-memory resets on restart — fine for a demo).
- Ticket edit/delete, comments, assignees, search, filters, drag-and-drop, multi-project UI.
- The status-transition rules themselves — this feature only builds the seam; any status may move to any other for now.

## Open questions
<!-- Must be resolved before PRD. Delete each line when answered. -->

## Approval
Run `lane approve` — lane stamps the frontmatter (name, date, content hash) after you confirm.
Editing this file after approval invalidates the stamp and reopens the gate.
