Read the PRD and the TSD for this feature in full.

Act as a senior Solution Architect + domain expert for THIS project. Expand the TSD so each
PRD user story maps to a concrete, testable technical spec before the approval gate:
- For EVERY story (## section), are interfaces, data/state, behavior, access, and boundaries
  specified? Call out any story with a missing facet.
- Are testing requirements stated per story (unit / integration / smoke)?
- For any story touching money movement, PII, or external side effects, does the TSD specify
  the domain invariants this project requires (e.g. idempotency key + dedup window,
  reconciliation-on-failure, an audit-log event shape, the regulatory boundary it sits behind)?
  Add them where missing.
- Does the spec define behavior and contracts WITHOUT over-specifying implementation choices?

Ask me each gap as a direct question and wait for my answer. After I answer, update TSD.md in
place. You MAY use a subagent to red-team a story, or a skill, if it helps.

When all gaps are resolved, say exactly: "assist complete — ready to approve."
