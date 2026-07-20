---
approved_by: ""
approved_at: ""
---
# TSD <FEAT> — <feature title>
> Behavior + contracts ONLY. Never name the library/method/pattern (over-spec = defeats spec-first).
> One section per PRD story. Critic anchors to this as the external executable spec.
> Story IDs are S-<FEAT>.nn — the <FEAT> prefix is what resolves this folder (docs/features/<FEAT>-*/),
> so the `## TSD S-<FEAT>.nn` header below must match the story ID exactly.

<!-- Domain-neutral default rows — tailor `.lane/templates/TSD.md` to your stack
     (web: DB / API / Frontend · pipeline: sources / transforms / sinks ·
      CLI: commands / flags / output · library: public API / invariants). -->
## TSD S-<FEAT>.01 — <title>  (PRD §S-<FEAT>.01)
| Aspect | Spec |
|--------|------|
| Interfaces | contracts this exposes/consumes — endpoints, CLI flags, function/SDK signatures, events, queues |
| Data / State | persistent or in-memory state it touches — schemas, files, formats (empty if none) |
| Behavior | the observable behavior delivered |
| Access | who/what may invoke it (empty if N/A) |
| Boundaries | external deps we DON'T own — network/external services, clock, randomness, filesystem. A *what* ("external mail provider"), not a library. Injected as ports; faked in unit/integration. (empty if none) |
| Tests | unit (what logic) / integration (which flows) / smoke (critical path — **required when Boundaries non-empty**: exercises the real boundary in a realistic environment) |
