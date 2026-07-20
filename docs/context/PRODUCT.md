# Product — Ticket Tracker

> Absolute truth of the current product. Update when the product meaningfully changes.
> Human-maintained — `lane fold` does not write to this file.

## What it is
A barebones Jira-style ticket tracker: a web app for creating tickets and moving them across a three-state workflow (todo → in progress → done). It exists as a minimal, honest substrate for later demonstrating status-transition gating — not as a production tracker.

## Who uses it
Developers running it locally (demo / internal experimentation). Single user at a time, no accounts, no roles.

## What it does
- Holds projects (id, name, key) with one default project seeded at boot.
- Holds tickets (title, description, status) belonging to a project.
- Lets a user create a ticket, view all tickets on a three-column board, and move a ticket between todo / in progress / done.
- Exposes all of this over a REST API so workflow rules can later be enforced server-side in one place.

## What it doesn't do
- No authentication, users, or permissions.
- No persistence — state is in-memory and resets on restart (acceptable by design).
- No ticket editing or deleting, no comments, no assignees, no search/filter UI.
- No multi-project UI (the API supports projects; the frontend uses the default one).
- No status-transition rules yet — any status may move to any other. Transition gating is the planned future change this codebase is shaped to receive.
