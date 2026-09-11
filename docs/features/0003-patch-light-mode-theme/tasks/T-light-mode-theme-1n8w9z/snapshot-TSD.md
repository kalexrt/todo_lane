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
