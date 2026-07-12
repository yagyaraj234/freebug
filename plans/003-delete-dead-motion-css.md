# 003 — Delete dead motion CSS, consolidate easings

- **Status**: DONE
- **Commit**: 7b6fe17
- **Severity**: LOW
- **Category**: Cohesion & tokens / Performance
- **Estimated scope**: 3 files + 1 dependency removal, net ~-55 lines

## Problem

Dead and duplicated motion code in `frontend/src/styles.css` and the demo route.

**Unused rules** (zero references in any `.tsx`; verified at commit 7b6fe17 with `grep -rn 'rise-in\|nav-link\|feature-card' frontend/src --include='*.tsx'`):

```css
/* frontend/src/styles.css:236-247 — .feature-card + :hover, unused */
/* frontend/src/styles.css:272-299 — .nav-link + animated underline, unused */
/* frontend/src/styles.css:301-314 — .rise-in + @keyframes rise-in, unused */
```

**Unused dependency**: `tw-animate-css` imported at `frontend/src/styles.css:4` and listed in `frontend/package.json` dependencies. No tsx uses its classes — the only `animate-*` class in the repo is `animate-spin` (`frontend/src/routes/demo/convex.tsx:93`), which is Tailwind core.

**Duplicate hand-typed easing**: `frontend/src/styles.css:390`:

```css
/* current */
.fb-bento-card {
  border-radius: 22px;
  transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
}
```

`cubic-bezier(0.23, 1, 0.32, 1)` is a near-duplicate of the existing token `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)` (`frontend/src/styles.css:121`).

**Demo route debris** (`frontend/src/routes/demo/convex.tsx`):

- Line 113: `animationDelay: \`${index * 50}ms\`` inline style with no animation attached — dead.
- Lines 118, 128: `transition-all duration-200` — `transition: all` animates unintended properties off-GPU; only colors/text styles change here.

## Target

- The three unused CSS blocks deleted.
- `tw-animate-css` import line deleted and the package removed from `frontend/package.json`.
- Bento card on the shared token:

```css
/* target */
.fb-bento-card {
  border-radius: 22px;
  transition: transform 200ms var(--ease-spring);
}
```

- `demo/convex.tsx`: `animationDelay` style prop deleted; `transition-all duration-200` → `transition-colors duration-200` on both lines.

## Repo conventions to follow

- Easing/duration tokens live in the `@theme inline` block at `frontend/src/styles.css:119-123`. Exemplar of correct use: `frontend/src/styles.css:288` (`transition: transform var(--duration-base) var(--ease-spring)`).
- Keep the 200ms duration on the bento card — it's an intentional, slightly faster hover than `--duration-base`.

## Steps

1. `frontend/src/styles.css` — delete line 4 (`@import 'tw-animate-css';`).
2. `frontend/src/styles.css` — delete the `.feature-card` and `.feature-card:hover` rules (lines 236-247). **Caution**: if plan 001 already ran, `.island-shell` in the `button, .island-shell, a` selector list stays — it is used in `frontend/src/routes/about.tsx:10`.
3. `frontend/src/styles.css` — delete `.nav-link`, `.nav-link::after`, `.nav-link:hover, .nav-link.is-active`, and `.nav-link:hover::after, .nav-link.is-active::after` (lines 272-299).
4. `frontend/src/styles.css` — delete `.rise-in` and `@keyframes rise-in` (lines 301-314). **Skip this step if plan 004's hero-stagger option was executed and uses `.rise-in`** — check first with `grep -rn 'rise-in' frontend/src --include='*.tsx'`; delete only if still unreferenced.
5. `frontend/src/styles.css:390` — replace `cubic-bezier(0.23, 1, 0.32, 1)` with `var(--ease-spring)`.
6. `frontend/src/routes/demo/convex.tsx` — remove the `animationDelay` entry from the inline `style` object (line 113; delete the whole `style` prop if it becomes empty).
7. `frontend/src/routes/demo/convex.tsx` — change `transition-all duration-200` to `transition-colors duration-200` on lines 118 and 128.
8. `frontend/package.json` — remove the `"tw-animate-css"` dependency line. Do NOT run `npm install` (plan is read-only on the lockfile; note in the PR that a lockfile refresh is needed).

## Boundaries

- Do NOT delete `.island-shell` or `.island-kicker` — used in `about.tsx` and `demo/*.tsx`.
- Do NOT delete `.fb-blink` — used at `frontend/src/components/landing/sections.tsx:628` (terminal caret).
- Do NOT touch any other file.
- If grep shows any of the "unused" classes now referenced (drift since 7b6fe17), STOP and report.

## Verification

- **Mechanical**: `grep -rn 'rise-in\|nav-link\|feature-card\|tw-animate' frontend/src frontend/package.json` returns nothing (except possibly `rise-in` if plan 004 claimed it). `cd frontend && npm run build` succeeds.
- **Feel check**: open `/` and hover a bento card — the lift feels unchanged (the two curves are visually near-identical; if it reads as different, something else changed).
- **Done when**: grep is clean, build passes, bento hover unchanged to the eye.
