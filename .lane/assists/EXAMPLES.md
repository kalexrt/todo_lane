# Draft assist examples — REFERENCE ONLY

> **lane never loads this file.** It is a catalog of ideas so you can see how each assist
> can be leveraged. To USE one: copy an idea into a real assist file (e.g. `.lane/assists/tsd.md`)
> or set the value inline, then point the matching key in `.lane/lane.config` at it — and make
> sure its `_enabled` flag is `true`. To pause an assist later, flip `_enabled` to `false`
> (no need to delete anything).

An assist value is either an **inline prompt** or a **file path** (starting with `.` or `/`).
The session applies it WHILE drafting the artifact; it may invoke skills or subagents.
Assists are advisory — the human approval stamp is still the only gate.

---

## assist_briefing — sharpen the discovery brief
```
# inline example
assist_briefing: "Act as a demanding stakeholder. Challenge the hypothesis: is it falsifiable?
Are the mocks concrete enough to write a PRD from? Ask me each gap; tighten BRIEFING.md in place."
```

## assist_prd — tune product requirements to the domain
```
# file example
assist_prd: ".lane/assists/prd.md"
# idea: ensure every story is a real user outcome with testable ACs and falsifiable metrics;
# for this domain, require auth/PII/audit/rate-limit needs to be stated per story.
```

## assist_tsd — harden the technical spec (skills + subagents)
```
assist_tsd: ".lane/assists/tsd.md"
# idea: for every story, demand interfaces/data/behavior/access/boundaries + tests; for any
# money-movement or PII story, require idempotency, reconciliation, audit-log shape, the
# regulatory boundary. You MAY spawn a subagent to red-team each story.
```

## assist_breakdown — tune how stories slice into task cards
```
assist_breakdown: ".lane/assists/breakdown.md"
# idea: enforce full vertical slices (reject horizontal layers), require each card to cite its
# TSD story + PRD AC, and add domain-required ACs (idempotency, audit) before scaffolding.
```

## assist_plan — challenge the execution plan (skill invocation)
```
# inline example invoking a skill
assist_plan: "Run /grill-me on the exec plan as a senior SA. Are all TSD behaviors covered?
Is B-1 a real tracer bullet? Are behaviors TDD-ordered? Resolve each gap with me before approve."
```
