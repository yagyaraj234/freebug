# 001 — Unify the interaction transition system

- **Status**: DONE
- **Commit**: 7b6fe17
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens / Easing & duration
- **Estimated scope**: 7 files (1 CSS rule rewrite, ~15 classname cleanups)

## Problem

Two transition systems compete. `frontend/src/styles.css:249-256` sets transitions on every `button` and `a` **outside any `@layer`**:

```css
/* frontend/src/styles.css:249-256 — current */
button,
.island-shell,
a {
  transition: background-color var(--duration-base) var(--ease-spring),
    color var(--duration-base) var(--ease-spring),
    border-color var(--duration-base) var(--ease-spring),
    transform var(--duration-base) var(--ease-spring);
}
```

Unlayered author CSS beats Tailwind's `@layer utilities`, so every Tailwind `transition` / `transition-colors` class on an `<a>` or `<button>` in the codebase is **inert** — dead weight that misleads readers. The global rule wins everywhere.

Effect on feel: hover **color/background** changes run at 250ms with a strong ease-out curve. Hover color changes are hit tens of times per day and should use `ease` at ~150ms; only `transform` (press scale, CTA lift) deserves the 250ms spring curve.

Inert `transition*` classnames on `a`/`button` elements (all overridden by the global rule):

- `frontend/src/components/Header.tsx:17,20,23,26,34,40`
- `frontend/src/components/Footer.tsx:54,63,81`
- `frontend/src/components/auth/AuthCard.tsx:28`
- `frontend/src/components/landing/sections.tsx:165,580`
- `frontend/src/routes/login.tsx:47,61`
- `frontend/src/routes/signup.tsx:59,73`
- `frontend/src/routes/waitlist.tsx:121`

## Target

One system: the global rule, with per-property timing. Colors fast with `ease`, transform on the spring token:

```css
/* frontend/src/styles.css — target */
button,
.island-shell,
a {
  transition: background-color var(--duration-fast) ease,
    color var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    filter var(--duration-fast) ease,
    transform var(--duration-base) var(--ease-spring);
}
```

(`filter` added because CTAs use `hover:brightness-95` — currently that property is not transitioned at all and snaps.)

All `transition`, `transition-colors` (and any other `transition-*`) Tailwind classnames removed from `<a>` and `<button>` elements at the locations listed above. Do NOT remove them from non-`a`/`button` elements (e.g. `div`s in `frontend/src/routes/demo/convex.tsx` — out of scope here anyway).

Keep `frontend/src/styles.css:258-262` (`button:active, .fb-press:active`) exactly as is — press feedback at 150ms/scale(0.97) already matches the target values (100–160ms, scale 0.95–0.98).

## Repo conventions to follow

- Motion tokens live in the `@theme inline` block at `frontend/src/styles.css:119-123`: `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)`, `--duration-fast: 150ms`, `--duration-base: 250ms`. Use these tokens; do not hand-type values.
- Exemplar of correct token use: the same global rule at `frontend/src/styles.css:252` already references `var(--duration-base) var(--ease-spring)`.

## Steps

1. `frontend/src/styles.css` — replace the `transition:` declaration inside the `button, .island-shell, a` rule (lines 249-256) with the target block above. Selector list unchanged.
2. `frontend/src/components/Header.tsx` — remove the word `transition` from the className strings on lines 17, 20, 23, 26, 34, 40. Nothing else in those strings changes.
3. `frontend/src/components/Footer.tsx` — same removal on lines 54, 63, 81.
4. `frontend/src/components/auth/AuthCard.tsx` — same removal on line 28.
5. `frontend/src/components/landing/sections.tsx` — same removal on lines 165 and 580.
6. `frontend/src/routes/login.tsx` (lines 47, 61) and `frontend/src/routes/signup.tsx` (lines 59, 73) — same removal.
7. `frontend/src/routes/waitlist.tsx` — same removal on line 121.

## Boundaries

- Do NOT touch `frontend/src/routes/demo/**` — separate plan (003).
- Do NOT change any markup, colors, spacing, or other classnames — only remove the `transition` token from class strings and edit the one CSS rule.
- Do NOT add new dependencies or new tokens.
- If a listed line no longer contains `transition` (drift since commit 7b6fe17), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd frontend && npx tsc --noEmit` passes; `grep -rn 'transition' src/components src/routes --include='*.tsx' | grep -v demo | grep -v routeTree.gen` returns no `<a>`/`<button>` classname hits.
- **Feel check**: run `npm run dev` in `frontend/`, open `/`:
  - Hover a header nav link: color change is quick (~150ms), not languid.
  - Hover the "Request Access" CTA: the lift (`-translate-y-0.5`) is smooth and springy; the brightness change no longer snaps.
  - Press and hold any button: it scales down subtly; release: it springs back. In DevTools → Animations panel at 10% speed, confirm color transitions finish visibly before the transform settles.
- **Done when**: all listed classnames cleaned, one global rule owns link/button transitions, hover colors ~150ms, transforms 250ms spring.
