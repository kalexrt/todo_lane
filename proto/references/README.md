# proto/references — visual ground truth (committed)

Drop images here that show what the prototype should **look like**:

- **Real-app screenshots** — captures of the actual product screens this
  prototype mirrors. The single best fidelity input.
- **Mockups / designs** — Figma exports, wireframes, anything you're building toward.
- **Vertical patterns** — dashboards, data tables, forms/wizards, settings,
  detail pages — reference layouts that guide future flows.

Organize however helps — flat, or one folder per vertical or per flow
(`dashboard/`, `checkout/`). Name files so the subject is obvious.

## Why this exists

This is **source**, not throwaway. Unlike `proto/.screenshots/` (git-ignored
diff aids the agent captures while verifying), `references/` is **committed** —
it's the durable guiding light every future prototype is judged against.

It's also the **fallback when the live app can't be seen.** proto-setup normally
asks to run the app + screenshot it (via Playwright) for visual ground truth. If
you can't — no Playwright, can't run the app, no access — drop screenshots of the
real screens here instead. The prototyping agent reads them and matches them, the
same way it would a live capture.
