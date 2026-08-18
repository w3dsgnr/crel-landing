# 001 — Cards: keep the hover reveal under `prefers-reduced-motion` (instant, not removed)

- **Status**: DONE (applied 2026-08-18 in the same session, together with removing the card angles)
- **Commit**: ea8353c (working tree with uncommitted motion edits of 2026-08-18)
- **Severity**: MEDIUM
- **Category**: 6. Accessibility
- **Estimated scope**: 1 CSS file (~6 lines) + 1 doc line

## Problem

The Cards cell in section «Everything a financial app needs to move money»
(`components/sections/shared/Capabilities.tsx`, cell with `data-hover-scene`)
has exactly one hover gesture, and it exists to REVEAL information: the plastic
card covers ~80 % of the virtual card, and on hover the stack spreads so the
`virtual` tag and the PAN tail of the back card come out from under the plastic.

Under `prefers-reduced-motion: reduce` the current CSS removes the hover state
entirely — not just its transition, the target transform too. Reduced-motion
users therefore never get to see the back card. That is «reduced motion = zero
feedback», which the standard explicitly rejects: reduced motion means dropping
movement, not dropping the state change.

```css
/* app/globals.css:952-973 — current: hover spread + its 200ms transition */
.wg-slot {
  transition: transform 0.2s ease;
}
@media (hover: hover) and (pointer: fine) {
  [data-hover-scene]:hover .wg-slot-back {
    transform: translate3d(12px, -10px, 0) rotate(3deg);
  }
  [data-hover-scene]:hover .wg-slot-front {
    transform: translate3d(-10px, 6px, 0) rotate(-2deg);
  }
}
```

```css
/* app/globals.css:1000-1006 — current: reduced-motion kills the state, not the motion */
  /* пространственный жест смягчить нечем — веер по наведению выключен */
  .wg-slot,
  [data-hover-scene]:hover .wg-slot-back,
  [data-hover-scene]:hover .wg-slot-front {
    transform: none;
    transition: none;
  }
```

The comment says «there is nothing to soften a spatial gesture with». There is:
an instant state change. With `transition: none` the spread becomes a discrete
switch (hover in → stack open, hover out → stack closed) with no interpolated
movement — which is exactly what reduced-motion asks for.

Note: `docs/motion-capabilities.md` §5 documents the current behaviour as a
decision. This plan changes that decision on purpose because its rationale is
factually wrong, so update the doc line too (step 2).

## Target

```css
/* app/globals.css — target: inside the existing
   @media (prefers-reduced-motion: reduce) { … } block of «Сцены приборов» */
  /* веер по наведению остаётся, но без хода: раскрытие — мгновенное
     переключение состояния. Hover здесь ОТКРЫВАЕТ заднюю карту, и при
     reduced-motion эта информация не должна пропадать — уходит движение,
     не состояние. */
  .wg-slot {
    transition: none;
  }
```

That is, the two `[data-hover-scene]:hover .wg-slot-*` selectors are removed
from the reduced-motion block so the hover transforms defined at lines 966-972
keep applying; only the transition is zeroed.

## Repo conventions to follow

- Motion vocabulary for these mockups lives in `app/globals.css` under the
  banner `/* ── Сцены приборов … */` (line ~811). Reduced-motion overrides for
  that vocabulary live in the `@media (prefers-reduced-motion: reduce)` block
  that starts at line ~975. Edit inside that block; do not create a second one.
- Exemplar of «gentler, not zero» in the same block, lines 980-983:
  ```css
  [data-play="off"] .wg-rise,
  [data-play="off"] .wg-pop {
    transform: none;   /* movement dropped, the opacity fade stays */
  }
  ```
- Comments in this file are Russian and explain *why*; keep that style.
- Hover gating stays where it is: `@media (hover: hover) and (pointer: fine)`
  at line 966 wraps the hover selectors already — do not duplicate it.

## Steps

1. In `app/globals.css`, inside the reduced-motion block of «Сцены приборов»
   (the block that contains `[data-play="off"] .wg-rise, [data-play="off"] .wg-pop { transform: none; }`),
   replace the rule

   ```css
     /* пространственный жест смягчить нечем — веер по наведению выключен */
     .wg-slot,
     [data-hover-scene]:hover .wg-slot-back,
     [data-hover-scene]:hover .wg-slot-front {
       transform: none;
       transition: none;
     }
   ```

   with

   ```css
     /* веер по наведению остаётся, но без хода: раскрытие — мгновенное
        переключение состояния. Hover здесь ОТКРЫВАЕТ заднюю карту, и при
        reduced-motion эта информация не должна пропадать — уходит движение,
        не состояние (правка 2026-08-18, план 001). */
     .wg-slot {
       transition: none;
     }
   ```

2. In `docs/motion-capabilities.md`, section «## 5. Reduced motion», change the
   sentence «…и полностью выключает веер по наведению (пространственный жест
   смягчить нечем)» to «…а веер по наведению оставляет как мгновенное
   переключение состояния без транзишена: hover в Cards открывает заднюю
   карту, и эта информация при reduced-motion не пропадает».

## Boundaries

- Do NOT touch `components/mockups/CardDuoGlass.tsx`, `lib/usePlayOnce.ts`
  or `components/sections/shared/Capabilities.tsx`.
- Do NOT change the hover transform values (`12px, -10px, 3deg` /
  `-10px, 6px, -2deg`) — they were measured against the card body edge on
  2026-08-17 (see the comment above `.wg-slot` in globals.css).
- Do NOT touch the other reduced-motion overrides in the block
  (`.wg-rise`, `.wg-pop`, `.wg-type`, `.wg-arc`, `.wg-fan`, `.wg-doc`).
- Do NOT add new dependencies.
- If the reduced-motion block does not contain the exact rule quoted in step 1
  (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit -p .` exits 0 (CSS-only change, but the
  project typechecks in CI); dev server (`npm run dev`) shows no CSS parse
  warning in the console.
- **Feel check**: open the page at ≥ 768 px width, scroll to «Everything a
  financial app needs to move money», Cards cell (2nd row, right).
  - Normal motion: hover the cell — the stack spreads over ~200 ms with `ease`,
    the `virtual` tag and `2210` tail of the back card come out from under the
    plastic; leave — it closes. Unchanged from before.
  - DevTools → Rendering → «Emulate CSS media feature prefers-reduced-motion:
    reduce», reload, hover the cell — the stack is open in the very next frame
    (no interpolated movement, no 200 ms glide) and the back card's `virtual`
    tag + `2210` are visible; leave — it closes instantly.
  - DevTools → Animations panel at 10 % playback with reduced-motion emulated:
    hovering the cell records NO transform animation on `.wg-slot-back` /
    `.wg-slot-front`.
  - Touch emulation (device toolbar, mobile preset): no spread on tap in either
    mode — the `(hover: hover) and (pointer: fine)` gate still applies.
- **Done when**: with reduced-motion emulated, hovering the Cards cell reveals
  the back card without any transition, and without emulation the 200 ms
  spread is unchanged.
