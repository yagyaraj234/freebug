# 002 — Reduced motion: drop movement, keep feedback

- **Status**: DONE
- **Commit**: 7b6fe17
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file, ~15 lines

## Problem

`frontend/src/styles.css:413-422` nukes every animation and transition for reduced-motion users:

```css
/* frontend/src/styles.css:413-422 — current */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Reduced motion means fewer and gentler animations, **not zero**. This kills harmless, comprehension-aiding feedback (hover color fades, brightness changes) along with the movement it should target. Color and opacity transitions do not trigger vestibular issues; transform movement and infinite animations do.

Motion inventory this must gate (all in `frontend/src/styles.css`):

- `button:active, .fb-press:active` scale press (line 258-262)
- `.fb-bento-card:hover` translateY (line 393-397)
- CTA `hover:-translate-y-0.5` (Tailwind utility, `sections.tsx:165,580`)
- `.fb-blink` infinite caret blink (line 399-411)
- `.feature-card:hover` / `.nav-link::after` (may already be deleted by plan 003)

## Target

Replace the block with a targeted one — zero out `transform` motion and stop infinite animations, leave color/opacity/filter transitions alone:

```css
/* frontend/src/styles.css — target */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
  button,
  .island-shell,
  a,
  .fb-bento-card {
    transition-property: background-color, color, border-color, filter !important;
  }
  button:active,
  .fb-press:active,
  .fb-bento-card:hover {
    transform: none !important;
  }
}
```

Notes on why this shape: limiting `transition-property` (rather than duration) means color feedback keeps its timing while transform is simply never transitioned; `transform: none` on the press/hover states removes the movement itself, not just its smoothing. The `animation-*` lines still stop `.fb-blink` and any keyframe entrances (including the waitlist success entrance added by plan 004 — its opacity fade collapses to instant, which is acceptable; the element still appears).

Tailwind's `hover:-translate-y-0.5` on the two landing CTAs is transform movement too. It is covered by adding this rule inside the same media query:

```css
  .fb-press:hover {
    transform: none !important;
  }
```

Both landing CTAs carry `fb-press` (`frontend/src/components/landing/sections.tsx:165,580`), so this catches them without touching markup.

## Repo conventions to follow

- All motion CSS lives in `frontend/src/styles.css`; keep the media query in its current position (after the `.fb-blink` block).
- Tokens `--duration-fast`/`--duration-base` are defined at `frontend/src/styles.css:122-123` — no new tokens needed here.

## Steps

1. `frontend/src/styles.css` — replace the entire `@media (prefers-reduced-motion: reduce)` block (lines 413-422 at commit 7b6fe17) with the target block above, including the `.fb-press:hover { transform: none !important; }` rule.

## Boundaries

- Do NOT touch any other rule in `styles.css`.
- Do NOT edit any `.tsx` file.
- Do NOT add a JS `useReducedMotion` hook — CSS-only.
- If plan 003 already deleted `.nav-link`/`.feature-card`, nothing extra is needed; if they still exist, they are element-selector-covered (`a`) or transform-only decorations already neutralized by the rules above. If the block at 413-422 has drifted, STOP and report.

## Verification

- **Mechanical**: `cd frontend && npm run build` succeeds.
- **Feel check**: DevTools → Rendering panel → emulate `prefers-reduced-motion: reduce`, open `/`:
  - Terminal caret (`▍` in the Test generation section) does not blink.
  - Hovering the CTA changes brightness but does not lift; pressing does not scale.
  - Hovering a nav link still fades its color (feedback preserved — this is the point).
  - Bento cards do not lift on hover.
  - Turn emulation off: all motion returns.
- **Done when**: with reduced motion on, nothing on the page moves or loops, but color/brightness hover feedback still transitions.
