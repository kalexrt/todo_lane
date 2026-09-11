# Behavior Spec — T-light-mode-theme-1n8w9z: Selectable light mode theme
> Source: task card ACs + docs/features/0003-patch-light-mode-theme/tasks/T-light-mode-theme-1n8w9z/snapshot-TSD.md
> One test at a time. B-1 = tracer bullet. Never write B-N+1 before B-N is GREEN.
> Fill a behavior's Given/When/Then JUST BEFORE you `lane red` it — `lane red` checks
> only the behavior it's about to prove, so later B-N may stay stubs until their turn.
> B-N below seed from the card's drivable ACs (behavior / e2e) — a starting point, not
> final. One AC may be several behaviors (split it); the Critic may surface more (add
> them). B-numbering is the Coordinator's, not fixed by AC count. Invariant /
> non-functional ACs are not RED→GREEN cycles — any are listed in their own section.

## B-1 (tracer bullet): AC-1 [behavior]: With nothing stored under the `theme` key, the app resolves the
- Given: no value stored under `localStorage['theme']`
- When: the app mounts, once with `matchMedia('(prefers-color-scheme: dark)')` matching, once with it not matching
- Then: `document.documentElement` carries `data-theme="dark"` (matching case) or `data-theme="light"` (non-matching case), and the rendered toggle control's accessible name identifies the OPPOSITE theme it would switch to

## B-2: AC-2 [behavior]: Activating the theme control flips the active theme, updating
- Given: the app has mounted and resolved an initial theme (OS prefers dark, so `data-theme="dark"` and the control reads "Switch to light")
- When: the toggle control is clicked once, then clicked again
- Then: after the first click, `document.documentElement` carries `data-theme="light"` and the control's accessible name reads "Switch to dark"; after the second click, it returns to `data-theme="dark"` and "Switch to light"

## B-3: AC-3 [behavior]: Activating the control writes the newly selected theme to
- Given: the app has mounted with no stored preference and the OS prefers dark (`data-theme="dark"`)
- When: the toggle control is clicked once (flipping to light), then a fresh `App` instance mounts (simulating reload) while the OS still prefers dark
- Then: after the click, `localStorage['theme']` is `'light'`; on the fresh mount, `data-theme` resolves to `'light'` (the stored value, not the OS preference) and the control reads "Switch to dark"

## Invariants & non-functional ACs (NOT RED→GREEN cycles)
> Not standalone behaviors to drive. An invariant usually holds as a property of a
> behavior above (state which) or is locked by a guard test recorded off-ledger with
> `lane red --regression`. Non-functional ACs are validated out-of-band (load test, etc.).
- AC-4 [invariant]: `:root` carries the light tokens with no media query or attribute — coverage:

