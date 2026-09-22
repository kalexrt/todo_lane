---
approved_by: "Kalash Shrestha"
approved_at: "2026-09-22"
approved_sha256: "9179aa31690a42d340b420cbe547a9c670f8a96f875930275c6ea1be8a225785"
---
# Patch 0006 — User-chosen board background (colour or image)
> A `patch` iteration — the TWO-STAMP ceremony for small, known-scope work (a bug fix, a
> tweak, one behavior, one PR). This ONE document is the ticket + TSD + task card + exec
> plan: your single `lane approve` stamp covers all of it (stamp 1 of 2; stamp 2 is the
> verification report at the end). The TDD ledger, Critic snapshot, and verify replay are
> unchanged — a patch removes redundant signatures, never proof.
> Too big for a patch? More than one story, more than ~3 behaviors, or more than one task
> → use `lane new fix` / `lane new enhancement` instead (agents: CALL THIS OUT when
> drafting; the human decides at the stamp).

**Scope check (agent assessment):** fits `patch` — one story, one task, three behaviors, one
PR, frontend-only. It rides the same seam patch 0003 (theme toggle) opened: a client-only
view preference in `localStorage`, surfaced as a control in the existing page header. No
backend, API, DB, or domain-rule surface is touched. Called out honestly: the request names
two capabilities (colour *and* picture). They collapse to ONE preference here — the
background is either a colour or an image, never both — which is what keeps this on the
patch rung. If the reviewer wants them as independent, layerable settings, that is a second
story and belongs in `lane new enhancement`.

**Severity:** minor
**Source:** direct user request — "change background color to user preference or add a
picture as background" (session 2026-09-22)   ← audit chain

**Current behavior:** The page background comes entirely from the theme tokens. `:root` in
`frontend/src/index.css` sets `background: var(--bg)`, and `--bg` takes one of exactly two
values — `#fff` under the light palette, `#16171d` under `:root[data-theme='dark']` — chosen
by the theme toggle added in patch 0003. A user who wants any other background, or a picture
behind the board, has no way to ask for one: there is no background control in the UI and no
stored background preference.

**Expected behavior:** The app exposes a background control alongside the existing theme
toggle. From it a user can set the page background to a colour of their choosing, or to an
image given by its URL, or clear the choice and fall back to the theme's own background. The
choice survives a page reload.

**Must NOT change:**
- The theme feature (patch 0003): the toggle, its accessible name, the `data-theme`
  attribute, the `theme` `localStorage` key, and both palettes' token values all stay as
  they are. With no background preference set, the page renders exactly as it does today —
  the theme's `--bg` — so this patch is additive, never a re-theme.
- Ticket board behavior: create, list, and the three-column move flow (`App.test.tsx`,
  `App.create.test.tsx`, `App.move.test.tsx`, `theme.test.tsx` stay green untouched).
- Text/foreground tokens: `--text`, `--text-h`, `--accent`, `--border` keep their values.
  This patch changes what sits *behind* the board, not the palette.
- Backend: no file under `backend/` changes. No new HTTP endpoint, no persisted domain
  state, no SQLite column.
- Dependencies: nothing added to `frontend/package.json` (CONSTITUTION hard rule) — no
  colour-picker or image-upload library.

## TSD S-0006.01 — Persisted user background preference, colour or image
> Behavior + contracts ONLY — never the library/method/pattern. The Critic anchors to THIS
> section (snapshot frozen at `lane start`), exactly as it would to a TSD.md section.

| Aspect | Spec |
|--------|------|
| Interfaces | UI only. Controls in the existing app header, next to the theme toggle: a colour input, a URL text input for an image address, and a reset control. Each is reachable by an accessible name that says what it sets (`background colour`, `background image URL`, `Use theme background`). No REST contract is added or changed — the `/api` boundary is untouched. |
| Data / State | Client view state only: the background preference, which is exactly one of — absent (use the theme), a colour, or an image URL. Exposed to the page as a CSS custom property on the document root element plus a marker attribute identifying which kind is active. Persisted in `localStorage` under a single key, alongside (never replacing) the existing `theme` key. No backend state, no SQLite column. |
| Behavior | (a) With no stored background preference, the page background is the theme's own `--bg` and the reset control is inert — the app renders exactly as it does before this patch, under either theme. (b) Setting a colour makes the page background that colour immediately, under either theme. (c) Setting an image URL makes the page background that image immediately, covering the viewport. (d) The preference is single-valued: setting a colour clears any image, setting an image clears any colour — only one is ever active. (e) Activating the reset control clears the preference and the background returns to the theme's `--bg`. (f) The active preference is written to `localStorage` and restored on the next mount, so it survives a reload; a value that is not a recognised preference is ignored and treated as absent rather than applied. (g) An image URL is applied as given and is not validated for reachability — a URL that fails to load leaves the theme background showing through, which is the same visual outcome as no preference. |
| Boundaries | `window.localStorage` is a browser API the app does not own — cleared/seeded per test. `window.matchMedia` stays stubbed as patch 0003 already requires (jsdom provides neither). The image URL points at a remote resource that is never fetched in tests: jsdom does not load CSS background images, so no network is involved and none is faked. The backend `/api` is already faked in the existing frontend tests via `fetch`; unchanged here. |
| Tests | Vitest + React Testing Library, colocated in `frontend/src/`. Unit/component level: render the app with seeded/cleared `localStorage`, drive the controls through their accessible names, and assert the observable interface — the custom property and marker attribute on the document root, and what was written to `localStorage`. No visual/snapshot assertions and no assertions on computed colours (jsdom does not resolve custom properties through the stylesheet). |

## Task T-custom-background-ln5aox — User-chosen board background (colour or image)
**Slice:** a complete observable behavior end-to-end + tests (full vertical)
**Acceptance criteria:** (tag each: `behavior` | `invariant` | `non-functional` | `e2e`)
- [ ] AC-1 [behavior]: With nothing stored under the background key, the app renders no
  background override on the document root — the theme's `--bg` governs — and renders the
  colour control, the image-URL control, and the reset control, each with an accessible name
  identifying what it sets.
- [ ] AC-2 [behavior]: Choosing a colour sets the background override on the document root
  to that colour in the same render, and marks the active preference kind as a colour.
- [ ] AC-3 [behavior]: Supplying an image URL sets the background override on the document
  root to that image in the same render, marks the active preference kind as an image, and
  clears any colour that was previously active — and choosing a colour afterwards likewise
  clears the image, so at most one kind is ever active.
- [ ] AC-4 [behavior]: Setting a colour or an image writes the preference to `localStorage`,
  and a subsequent mount restores it — including under the opposite theme, since the
  background preference and the theme are independent keys.
- [ ] AC-5 [behavior]: Activating the reset control removes the preference from
  `localStorage` and removes the override from the document root, returning the page to the
  theme's `--bg`.
- [ ] AC-6 [invariant]: The theme feature is untouched — the toggle's accessible name, the
  `data-theme` attribute, and the `theme` storage key behave exactly as before under every
  background preference, and a stored background value that is not a recognised preference
  is ignored rather than applied.
**Tests:** AC-1, AC-2, AC-3, AC-4, AC-5, AC-6  ← ordered; first = tracer bullet

## Execution Plan
> Approved BY the spec stamp: `lane start` copies this section verbatim into the worktree's
> exec-plan.md and carries your stamp onto it — no separate plan gate. Keep it last in this file.

**Approach:** Mirror the shape patch 0003 already established, so the two preferences read as
one system rather than two inventions. A small background module in `frontend/src/` sits
beside `theme.ts` and owns the preference type (a discriminated value that is either a colour
or an image URL), its `localStorage` read/write, and the parse that rejects anything
unrecognised. `App.tsx` holds it in `useState` (CONSTITUTION convention 3 — `useState`/
`useEffect`, no state library) and syncs it onto `document.documentElement` in an effect
exactly as it already syncs `data-theme`: a custom property carrying the CSS background value
plus a marker attribute naming the active kind, both removed when the preference is absent.
`index.css` makes `:root`'s existing `background: var(--bg)` fall back through that custom
property, so absent preference means today's rendering byte-for-byte and the theme tokens stay
the single source of the default. The controls render in the existing `.page-header` row next
to the theme toggle, using native inputs — `input[type=color]` and `input[type=url]`, no
picker or upload dependency — styled in `App.css` off the existing `--border`/`--text` tokens.
Frontend only — nothing under `backend/`, no dependency added.

**Boundaries & mocks:** FAKED — `window.localStorage` (cleared/seeded per test) and
`window.matchMedia` (already stubbed for the theme; jsdom provides neither). REAL — React
rendering, the background module, `App.tsx`'s effect, and the real `index.css`/`App.css`
rules as far as jsdom evaluates them. Assertions target the custom property and marker
attribute on `document.documentElement` and the contents of `localStorage` — never computed
colours, which jsdom does not resolve through custom properties. The image URL is never
fetched: jsdom does not load CSS background images, so there is no network surface to fake.
The backend stays faked through the existing `fetch` stubs.

**Behaviors (TDD order):**
- B-1: On mount with nothing stored, no background override is present on the document root
  and all three controls render with their accessible names. Covers AC-1 — the tracer bullet:
  it wires the module, the state, the effect, and the header controls while asserting that
  the default path is unchanged.
- B-2: Choosing a colour applies it (override + colour marker on the document root) and
  supplying an image URL applies that instead, each clearing the other so exactly one kind is
  ever active. Covers AC-2 and AC-3.
- B-3: The choice persists and is reversible — a set preference is written to `localStorage`,
  a fresh mount restores it (including under the opposite theme, with the theme's own
  attribute and key intact), reset clears both the storage entry and the override, and a
  stored value that is not a recognised preference is ignored. Covers AC-4, AC-5 and AC-6.

**Open questions:** none. Two were resolved with the requester before drafting and are
recorded as stamped assumptions 3 and 4 below.

**Stamped assumptions** (call-outs the stamp ratifies):
1. `localStorage` for a UI preference is NOT the "second persistence mechanism" the
   CONSTITUTION hard rule guards against — that rule protects *domain* state, which stays in
   SQLite behind the Nest services. This patch persists no ticket or project data. Patch 0003
   set this precedent for `theme`; this patch extends it, it does not re-open it. If the
   reviewer disagrees, this needs an ADR before the stamp.
2. `PRODUCT.md` lists no background customisation today (nor theming — see patch 0003's
   assumption 2). It is human-owned and read-only during feature work, so this patch does not
   touch it; adding a "background preference" line there afterwards is the human's call.
3. **Image by URL, not by upload** (requester's choice, 2026-09-22). A file picker would have
   to base64 the image into `localStorage`, whose ~5MB quota a normal photo exceeds — that
   needs downscaling and quota-failure handling, which is a second story, not a patch. A
   backend-stored upload would need a new persistence mechanism and almost certainly a new
   dependency, i.e. an ADR. A URL string stores and restores exactly like the colour string,
   which is what keeps colour and image one symmetric preference.
4. **One background at a time** (requester's choice, 2026-09-22). The preference is
   single-valued rather than an image layered over a colour backdrop. A user who sets an
   image whose URL fails to load therefore sees the theme background, not a previously chosen
   colour — AC-3 and TSD behavior (g) say so explicitly so the Critic can hold the diff to it.
