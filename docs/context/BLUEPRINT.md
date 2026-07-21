---
adr-baseline: 2
version: 2
last-updated: 2026-07-21
---

# Architecture — Ticket Tracker

## System Context
```mermaid
graph TD
  user[User / Browser] --> frontend[frontend — React SPA]
  frontend -->|REST /api| backend[backend — NestJS API]
  backend --> db[(SQLite file)]
```

## Containers
- **backend/** — NestJS (TypeScript) REST API. Owns all domain state and rules. Serves everything under the `/api` prefix. State is persisted in a SQLite file, accessed only through the existing `TicketsService`/`ProjectsService` (ADR-0002) — no ORM, no repository layer beyond those services.
- **frontend/** — React + Vite (TypeScript) single-page app. Purely a client of the backend REST API; holds no domain rules, only view state.

The two containers are independent npm packages with separate lockfiles — no workspace tooling, no shared code package.

## Boundary Rules
- The frontend talks to the backend only via the `/api` REST endpoints (Vite dev proxy in development). It never embeds domain rules — a status change is always a request to the backend.
- Every ticket status change goes through the dedicated `PATCH /api/tickets/:id/status` endpoint backed by a single service method. This is the one designated seam where status-transition gating will later be added; no other code path may mutate a ticket's status.
- HTTP concerns (controllers, DTO validation) stay out of services; services own domain state and rules and know nothing about HTTP.
- SQLite is reached only from inside `TicketsService`/`ProjectsService` — no controller, DTO, or frontend code queries the database directly.

## Governing ADRs
- [ADR-0001 — Record architecture decisions](../adr/0001-record-architecture-decisions.md)
- [ADR-0002 — Add SQLite persistence for tickets and projects](../adr/0002-sqlite-persistence.md)
