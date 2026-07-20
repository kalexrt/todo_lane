---
description: Activate LANE — AI-native SDLC workflow for this project
---

Run these commands now, in order. Read every line of output before proceeding.

```
lane philosophy
lane status
lane ready
lane
lane map
lane fold status
```

**What each gives you:**
- `lane philosophy` — WHY the rules exist. Read this before anything else and internalize it. This is not optional orientation — it is the mental model that makes every other command meaningful. Read it as a binding constraint on how you interpret every subsequent `lane` output, not something to skim.
- `lane playbook` — WHAT the rules are: CLI reference, phases, artifacts, gates. **Do not load the whole manual now.** It is reference, not orientation — pull it on demand. Run `lane playbook sections` to list the slices, then read only the one you need (`lane playbook flow` when planning, `lane playbook tdd` before writing tests, `lane playbook cli` to look up a command). The `lane` commands print your next step as you go, so you rarely need the full manual. Read all of it (`lane playbook`) only the first time you work in a LANE repo, or when a framework term is unfamiliar.
- `lane status` — every task and its current status (cross-project view, not context-scoped).
- `lane ready` — tasks that are queued and whose upstream work is complete on this branch — these are the ones you can start right now.
- `lane` — current state + your next concrete action. This is the oracle for what to do next.
- `lane map` — visual pipeline diagram showing exactly where you are and what is left.
- `lane fold status` — whether the architecture snapshot doc is stale. If stale: run `lane fold`, apply its output in a standalone PR before touching any feature work.

---

Then output **exactly** this block — no preamble, no LANE acronyms without a plain-English gloss the first time, no symbols (★, §):

**Where you are:** [One sentence. What is active (feature name, task name), what step, what phase. Plain English.]

**What to do next:**

[List only the commands valid right now. For each: the exact command, two spaces, an em dash, one plain-English sentence on what it does. If `lane` showed a gate box, include the exact steps the human must complete before any command can run.]

---

## Session rules — binding for all work in this project until told otherwise

**The CLI is the oracle.**
Run `lane` after every command. Your next action is always what `lane` outputs — never what you infer from memory or context. If uncertain, run `lane`.

**Approval gates require human confirmation — you cannot close them silently.**
When `lane` shows a gate (a box labeled "human required" or a step named `approve-*`):
1. Tell the human the gate is ready and what artifact it covers.
2. Ask them to run `lane approve` in their own terminal — it shows a digest and asks y/N,
   then writes the approval stamp itself (name, date, content hash).
3. NEVER edit `approved_by`/`approved_at`/`approved_sha256` yourself — a hand-typed stamp
   does not validate (the hash check rejects it), and faking a terminal to answer the
   prompt is forbidden circumvention.
4. Then STOP and tell the human to reply `continue` once they have approved. When they do,
   your next turn picks up the now-unblocked step automatically.
Never auto-approve silently. The human's keypress is the gate.

**Completion is the merge — hand off at a done task.**
When `lane` reports a task is `done`, the work and its verification are complete; what
remains is the merge. By default, tell the human to merge the PR (or run `lane land <id>`)
and reply `continue` — then stop. (If `lane.config` sets `auto_land: true`, run `lane land
<id>` yourself instead.)

**Autonomy mode.**
Default is attended: when you are genuinely blocked or need a human decision, ask and stop —
the human is present. If `lane.config` sets `autonomy_mode: unattended`, never stop to ask:
pick the recommended option, note why, and proceed.

**If a `lane` hint names an assist, run it before drafting/approving.**
When the "Next:" output shows an `assist:` line, the operator has configured a project-tuned
prompt for this authoring step (PRD, TSD, breakdown, plan, briefing). Apply it before you finish
the artifact — it may tell you to invoke a skill or spawn a subagent. It is advisory, not a gate:
a `⚠ … not found` assist line is a skip, not a blocker, and the human approval stamp is still the
only thing that closes the gate. Never treat running an assist as approval.

**No code before the execution plan is approved.**
For every task: `lane plan <T-ID>` scaffolds the plan, then the human reviews and approves it (`lane approve <T-ID>`), then code begins. Producing implementation before `lane approve` succeeds violates the pipeline — nothing written before that point is trustworthy.

**TDD cycle: failing test first, always.**
For each behavior in the execution plan:
1. Write the failing test — commit it with `lane red <T-ID>`.
2. Implement until the test passes — commit with `lane green <T-ID>`.
3. Optionally clean up — commit with `lane refactor <T-ID>`.
Never write implementation before the failing test is committed. Never skip a behavior.

**Context docs are read-only during active feature work.**
`docs/context/PRODUCT.md`, `BLUEPRINT.md`, and `CONSTITUTION.md` describe the product and architecture. Never edit them mid-feature. If `lane fold status` reports stale, fold and update in a standalone PR — then resume the feature.

**Ground every spec in the context docs.**
Unless `lane fold status` reports `Context grounding: OFF`, the context docs are binding constraints on every spec you draft or edit (BRIEFING, PRD, TSD, cards, exec-plan). Read all three before drafting, and keep the draft consistent with them:
- `docs/context/CONSTITUTION.md` — stack + conventions. Match them; reuse the existing patterns and types, don't invent parallel ones.
- `docs/context/BLUEPRINT.md` — architecture, containers, boundary rules. Stay inside them.
- `docs/context/PRODUCT.md` — what the product is and is not. Stay in scope.
A doc that `lane fold status` marks `stub` or `absent` carries no constraints yet — that is NOT a licence to invent. Don't fabricate constraints from a scaffold. For PRD/Briefing, note it is worth filling and proceed (a greenfield repo's first PRD is what defines the product). For the **TSD it is a hard gate** (ADR-0020): `lane approve` refuses a TSD while any context doc is `stub`/`absent`, because a TSD invents architecture and must ground in real constraints. Run `lane hydrate` to draft the docs from the codebase, have a human review them, then approve. Any change that needs to break a stated convention or boundary is an open question for the human or a candidate ADR — never a silent divergence. When `lane fold status` reports grounding is OFF, the operator handles this (e.g. via assists) — follow those instead.
