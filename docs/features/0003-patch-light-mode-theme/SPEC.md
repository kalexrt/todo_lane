---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-26"
approved_sha256: "fd74494a0715151f2a1656e5657361239773ae80aadf07ec88f0e3214182f24e"
---
# Patch 0003 — Selectable light mode theme

> A `patch` iteration — the TWO-STAMP ceremony for small, known-scope work (a bug fix, a
> tweak, one behavior, one PR). This ONE document is the ticket + TSD + task card + exec
> plan: your single `lane approve` stamp covers all of it (stamp 1 of 2; stamp 2 is the
> verification report at the end). The TDD ledger, Critic snapshot, and verify replay are
> unchanged — a patch removes redundant signatures, never proof.

**Scope check (agent assessment):** fits `patch` — one story, one task, three behaviors, one
PR, frontend-only. No backend, API, DB, or domain-rule surface is touched.

**Severity:** minor
**Source:** user request — "add light mode theme" (session 2026-08-26)   ← audit chain

**Current behavior:** `frontend/src/index.css` defines a light palette on `:root` and
overrides it inside `@media (prefers-color-scheme: dark)`. The app therefore renders in
whatever theme the operating system asks for, and a user on a dark-configured OS has no way
to use the light theme (and vice versa). There is no theme control in the UI and no stored
preference.

**Expected behavior:** the app exposes a theme toggle. Light is the base theme; dark is
applied only when explicitly selected or when the OS asks for it AND the user has made no
choice. A chosen theme survives a page reload.

**Must NOT change:**
- Existing light and dark colour values — the same design tokens (`--text`, `--bg`,
  `--accent`, …) keep their current values in both themes. This patch changes *when* a
  palette applies, not what it looks like.
- Ticket board behavior: create, list, and the three-column move flow (`App.test.tsx`,
  `App.create.test.tsx`, `App.move.test.tsx` stay green untouched).
- Backend: no file under `backend/` changes. No new HTTP endpoint, no persisted domain state.
- Dependencies: nothing added to `frontend/package.json` (CONSTITUTION stack rule).

## TSD S-0003.01 — Selectable light/dark theme with persisted preference

> Behavior + contracts ONLY — never the library/method/pattern. The Critic anchors to THIS
> section (snapshot frozen at `lane start`), exactly as it would to a TSD.md section.

| Aspect | Spec |
|--------|------|
| Interfaces | UI only. A single always-visible control in the app header, accessible as a `button` whose accessible name identifies the theme it switches to. No REST contract is added or changed — the `/api` boundary is untouched. |
| Data / State | Client view state only: the active theme, one of the string union `'light' \| 'dark'`. Exposed to CSS as a `data-theme` attribute on the document root element. Persisted under the `localStorage` key `theme`; the stored value is the same union. No backend state, no SQLite column. |
| Behavior | (a) With no stored preference, the active theme follows the OS `prefers-color-scheme` setting, defaulting to light when the OS expresses no dark preference. (b) Activating the control switches the active theme to the other value, immediately re-styling the app. (c) The chosen theme is written to `localStorage` and a stored value wins over the OS preference on the next load. (d) Light is the base palette: `:root` carries the light tokens unconditionally, so a stylesheet-less or attribute-less render is light, never unstyled. |
| Boundaries | `window.matchMedia` and `window.localStorage` are browser APIs the app does not own — faked/stubbed in tests (jsdom provides no `matchMedia`). The backend `/api` is already faked in the existing frontend tests via `fetch`; unchanged here. |
| Tests | Vitest + React Testing Library, colocated in `frontend/src/`. Unit/component level: render the app with a stubbed `matchMedia`/`localStorage` and assert the `data-theme` attribute on the document root plus the control's accessible name — the observable interface. No visual/snapshot assertions on colour values. |

## Task T-light-mode-theme-1n8w9z — Selectable light mode theme

**Slice:** a complete observable behavior end-to-end + tests (full vertical)
**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
- [ ] AC-1 [behavior]: With nothing stored under the `theme` key, the app resolves the
  active theme from the OS preference — `data-theme="dark"` when `prefers-color-scheme:
  dark` matches, `data-theme="light"` otherwise — and renders a theme control whose
  accessible name names the theme it would switch to.
- [ ] AC-2 [behavior]: Activating the theme control flips the active theme, updating
  `data-theme` on the document root and the control's accessible name in the same render.
- [ ] AC-3 [behavior]: Activating the control writes the newly selected theme to
  `localStorage` under `theme`, and a subsequent mount with that value stored resolves to
  the stored theme even when the OS preference is the opposite.
- [ ] AC-4 [invariant]: `:root` carries the light tokens with no media query or attribute
  required, and the dark palette applies only via `[data-theme='dark']` or via
  `prefers-color-scheme: dark` scoped so that an explicit `data-theme='light'` beats it.
**Tests:** AC-1, AC-2, AC-3, AC-4  ← ordered; first = tracer bullet

## Execution Plan

> Approved BY the spec stamp: `lane start` copies this section verbatim into the worktree's
> exec-plan.md and carries your stamp onto it — no separate plan gate. Keep it last in this
> file.

**Approach:** Keep the theme in React view state, consistent with CONSTITUTION convention 3
(`useState`/`useEffect`, no state library). A small theme module in `frontend/src/` reads the
initial theme (stored value first, OS preference second, light last) and writes the choice
back; `App.tsx` holds the state, syncs `data-theme` onto `document.documentElement` in an
effect, and renders the toggle button in the existing header row next to the `Ticket Tracker`
heading. `index.css` moves the dark token block from a bare `prefers-color-scheme` override
to an attribute-driven selector, with the media query retained only for the
no-explicit-choice case, so the existing colour values are preserved verbatim. Styling for
the button reuses the existing `--border` / `--text` tokens and lives in `App.css` alongside
the other component rules. Frontend only — nothing under `backend/`, no dependency added.

**Boundaries & mocks:** FAKED — `window.matchMedia` (absent in jsdom, stubbed per test to
assert both OS preferences) and `window.localStorage` (cleared/seeded per test). REAL —
React rendering, the theme module, the real `index.css`/`App.css` token selectors as far as
jsdom evaluates them (assertions target `data-theme` and accessible names, not computed
colours). The backend stays faked through the existing `fetch` stubs; no new network surface.

**Behaviors (TDD order):**
- B-1: On mount with no stored preference, the resolved theme comes from the OS —
  `data-theme` on the document root is `dark` under a matching `prefers-color-scheme: dark`
  and `light` otherwise — and the toggle renders naming the opposite theme. Covers AC-1 and
  the `:root`-is-light half of AC-4 (light needs no attribute to be correct).
- B-2: Activating the toggle flips the theme: `data-theme` and the control's accessible name
  both switch in one interaction, and flipping again returns to the start. Covers AC-2.
- B-3: The flip persists — the new theme is written to `localStorage` under `theme`, and a
  fresh mount with a stored value that contradicts the OS preference resolves to the stored
  one. Covers AC-3 and the explicit-choice-beats-media-query half of AC-4.

**Open questions:** none.

**Stamped assumptions** (call-outs the stamp ratifies):
1. `localStorage` for a UI preference is NOT the "second persistence mechanism" the
   CONSTITUTION hard rule guards against — that rule protects *domain* state, which stays in
   SQLite behind the Nest services. This patch persists no ticket or project data. If the
   reviewer disagrees, this needs an ADR before the stamp.
2. `PRODUCT.md` lists no theming today. It is human-owned and read-only during feature work,
   so this patch does not touch it; adding a "theme preference" line there afterwards is the
   human's call.
