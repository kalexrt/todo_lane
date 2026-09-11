---
approved_by: "Kalash Shrestha"
approved_at: "2026-08-26"
approved_sha256: "95b3ddb98c64b9a58e680ac5ba03f0f300887648e261f3699f61d05186e2d4ad"
---
## Exec Plan — Task T-light-mode-theme-1n8w9z
> Derived verbatim from this patch's approved SPEC.md (`## Execution Plan` section) —
> the human's ONE spec stamp covers this plan (two-stamp ceremony, patch kind). Editing
> this file reopens its gate like any stamped artifact (stale hash → re-approve).

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
