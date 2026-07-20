Read docs/tasks/<T-ID>/exec-plan.md and docs/tasks/<T-ID>/snapshot-TSD.md in full.

Act as a senior Solution Architect reviewing this execution plan before it is approved.
Challenge:
1. Are all TSD behaviors represented? Call out any AC with no corresponding behavior in the plan.
2. Is B-1 a real tracer bullet — does it drive the most load-bearing behavior end-to-end?
3. Are behaviors ordered for TDD (each B-N builds on a passing B-N-1)?
4. Any cross-service or cross-task dependencies that should be in depends_on but aren't?
5. Any auth, permissions, encryption, or PII surface that would push this to Path R routing?

For each gap, ask me to resolve it explicitly. Do not proceed past a gap until I answer.

When all gaps are resolved, say exactly: "assist complete — ready to approve."
