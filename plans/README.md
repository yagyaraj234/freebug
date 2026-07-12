# Animation Improvement Plans

Written by `improve-animations` at commit `7b6fe17` (2026-07-12). Execute with any agent: `improve-animations execute <plan>` or hand the file to an executor — each plan is self-contained.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Unify the interaction transition system](001-unified-transition-system.md) | MEDIUM | DONE |
| 002 | [Reduced motion: drop movement, keep feedback](002-reduced-motion-keep-feedback.md) | MEDIUM | DONE |
| 003 | [Delete dead motion CSS, consolidate easings](003-delete-dead-motion-css.md) | LOW | DONE |
| 004 | [Animate the waitlist success card in](004-waitlist-success-entrance.md) | LOW | DONE |

## Recommended order

1. **001** — biggest sitewide feel change; establishes the single transition system the others assume.
2. **003** — pure deletion; do before 002 so the reduced-motion block doesn't need to cover soon-dead rules.
3. **002** — rewrites the reduced-motion block; its notes reference the post-001 selector list.
4. **004** — additive; independent, but its reduced-motion behavior relies on the block shape from 002 (works with the old block too).

## Dependencies

- 002 references the `button, .island-shell, a` rule as reshaped by 001 (works either way, but line numbers assume 001 done first).
- 003 step 4 (`.rise-in` deletion) must check that no later work adopted `.rise-in` for a hero entrance — grep first, as the plan says.
- 004 is independent of all others.

All plans stamped at `7b6fe17`; if the touched files have drifted, executors stop and report per each plan's Boundaries section.
