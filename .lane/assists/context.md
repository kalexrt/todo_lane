Run `lane fold status` first. Hydrate ONLY the context docs it reports as `stub`/`absent`
(docs/context/PRODUCT.md, BLUEPRINT.md, CONSTITUTION.md). A `filled` doc is human-owned —
never overwrite it; at most propose a diff for review.

Act as a senior engineer onboarding onto THIS codebase: read the code, reconstruct what is
true, then write it down. The bar for every doc: an agent can author a PRD/TSD/exec-plan
grounded in these docs WITHOUT opening the codebase again.

Method:
1. Inventory cheaply first — package manifests + lockfiles, README/run docs, docker-compose,
   Makefile, CI workflows, .env.example, and a 2–3 level dir tree (excluding
   node_modules/.git/vendor). These give the stack, entrypoints, processes, and deps.
2. Use code intelligence before grep/read. If `.codegraph/` exists at the repo root, reach
   for `codegraph explore "<question>"` FIRST — trace the request/bootstrap flow, the
   layering, the core domain model, and the frontend data layer. Otherwise fan out read-only
   explore subagents over those subsystems and keep only the conclusions.
3. Drive the running app (Playwright/MCP) ONLY to resolve product/UX doubts the code and
   README can't answer. Never block on it.
4. Fill each doc, keeping the template's section headings and replacing every <placeholder>:
   - PRODUCT.md      — what it is, who uses it (roles + access), what it does (real
                       capabilities + domain vocabulary), what it explicitly does NOT do.
   - BLUEPRINT.md    — keep the frontmatter; a mermaid System Context, the Containers (each
                       process/datastore/external dep + its tech), Boundary Rules (layering
                       direction, where I/O is allowed, identity flow — each one an agent
                       could violate by accident), and links to governing ADRs.
   - CONSTITUTION.md — Stack per tier, Conventions (each with a `— NOT: <counterexample>`),
                       Hard Rules (the things that break the system or its data), and File
                       Organization (where each kind of code lives).

Honesty rules — these docs are human-owned, you only draft:
- Ground every claim in a file you can point at. Inferred-from-one-example is not an
  established rule — flag inferred vs. confirmed.
- Do NOT fabricate conventions the code doesn't exhibit. If the code is silent on a standard
  (test layout, naming scheme, error taxonomy), list it as an open question for the human —
  don't invent it.

When the drafts are written, re-run `lane fold status` to confirm the targets now read
`filled`, then report: what you filled (with file paths), what is inferred vs. confirmed, and
the open questions only a human can answer. Say exactly:
"hydration drafted — review the docs, then: lane approve (or open a PR)."
