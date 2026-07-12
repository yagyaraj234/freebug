# 004 — Animate the waitlist success card in

- **Status**: DONE
- **Commit**: 7b6fe17
- **Severity**: LOW (additive — missed opportunity)
- **Category**: Missed opportunities / Physicality
- **Estimated scope**: 2 files, ~15 lines

## Problem

Joining the waitlist is the highest-emotion moment on the site, and it teleports. `frontend/src/routes/waitlist.tsx:75-92` swaps the form for the success card instantly when `done` flips:

```tsx
{/* frontend/src/routes/waitlist.tsx:75-79 — current */}
{done ? (
  <div
    className="mt-8 flex items-start gap-3 rounded-2xl bg-white p-5 shadow-[0_12px_28px_rgba(19,27,77,0.1)]"
    role="status"
  >
```

A rare, celebratory state change gets none of the delight budget it's allowed. The card should physically arrive — from slightly small and low, never from `scale(0)`.

## Target

A one-shot CSS entrance on the success card. Keyframes are acceptable here (the element mounts once on a conditional render — no interruption path):

```css
/* frontend/src/styles.css — target, add after the .fb-blink block */
.fb-pop-in {
  animation: fb-pop-in 350ms var(--ease-spring) both;
}
@keyframes fb-pop-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

```tsx
{/* frontend/src/routes/waitlist.tsx — target */}
<div
  className="fb-pop-in mt-8 flex items-start gap-3 rounded-2xl bg-white p-5 shadow-[0_12px_28px_rgba(19,27,77,0.1)]"
  role="status"
>
```

Exact values, non-negotiable: 350ms, `var(--ease-spring)` (`cubic-bezier(0.16, 1, 0.3, 1)`, defined at `frontend/src/styles.css:121`), `translateY(8px)`, `scale(0.98)`, `opacity: 0 → 1`, fill mode `both`. No delay.

Reduced motion: no extra work — the global `@media (prefers-reduced-motion: reduce)` block in `styles.css` collapses animation durations, so the card appears instantly there. Correct behavior.

## Repo conventions to follow

- Keyframes + a single-purpose class in `frontend/src/styles.css`, `fb-`-prefixed, kebab-case — exemplar: `.fb-blink` / `@keyframes fb-blink` at `frontend/src/styles.css:399-411`.
- Use the `--ease-spring` token, never a hand-typed cubic-bezier.

## Steps

1. `frontend/src/styles.css` — add the `.fb-pop-in` class and `@keyframes fb-pop-in` block (target CSS above) directly after the `@keyframes fb-blink` block.
2. `frontend/src/routes/waitlist.tsx:77` — prepend `fb-pop-in ` to the success card's className (the `div` with `role="status"` inside the `done ? (...)` branch).

## Boundaries

- Do NOT animate the form → success *exit* (no crossfade, no exit animation) — the form unmounts instantly; only the incoming card animates.
- Do NOT animate the validation error or the "Joining…" button state.
- Do NOT touch the left visual panel or any other route.
- Do NOT add a library.
- If the `done` branch structure has drifted from the excerpt above, STOP and report.

## Verification

- **Mechanical**: `cd frontend && npx tsc --noEmit` passes.
- **Feel check**: run `npm run dev`, open `/waitlist`, submit a valid email (Convex dev backend must be running; otherwise temporarily set `const done = true` locally to preview — revert before finishing):
  - The success card fades in while rising ~8px and settling from 98% scale — it should read as "arriving", not "popping from nothing".
  - In DevTools → Animations panel at 10% speed: movement and opacity finish together; no overshoot artifacts.
  - Emulate `prefers-reduced-motion: reduce` (Rendering panel): the card appears instantly, fully opaque.
- **Done when**: submitting the form produces a smooth single entrance; reduced motion shows it instantly.
