# Animation plans

Written by the `improve-animations` skill (audit of 2026-08-18, section
«Everything a financial app needs to move money» — `components/sections/shared/Capabilities.tsx`,
the six `components/mockups/*Glass.tsx` scenes, `lib/usePlayOnce.ts`,
`app/globals.css` § «Сцены приборов»). Plans are self-contained: any agent can
execute one with zero context from the audit.

| # | Title | Severity | Category | Status |
| --- | --- | --- | --- | --- |
| 001 | Cards: keep the hover reveal under `prefers-reduced-motion` (instant, not removed) | MEDIUM | Accessibility | DONE (2026-08-18) |

## Execution order

1. `001-cards-hover-reduced-motion.md` — standalone, no dependencies.

## Audit result for the rest of the section

Everything else in the section was vetted at its file:line and is either
correct against the bar or a documented, deliberate trade-off
(`docs/motion-capabilities.md`), which the audit respects rather than
re-litigates:

- Purpose & frequency — one semantic gesture per instrument, no ambient loops,
  replay only after a 160 ms hover dwell (fixed 2026-08-18).
- Easing & duration — `--ease-out-expo` on entrances, `ease` on colour/opacity
  confirmations and the hover spread, `.wg-type` capped at 300 ms; 420–500 ms
  entries are explanatory/marketing motion, allowed.
- Physicality — `.wg-pop` from `scale(0.8)` is a measured, documented deviation
  from 0.9–0.97 for a 28–32 px ring; `.wg-rise` from 8 px / 4 px / −6 px.
- Interruptibility — CSS transitions throughout, no keyframes; replay is a
  deliberate hard-cut rewind, guarded during a running scene.
- Performance — `transform`/`opacity`/`clip-path` only; two documented
  exceptions (`stroke-dashoffset` on a 2.5 px SVG contour, `translateY` on the
  blur panel of WidgetApi).
- Accessibility — static state without `data-play` under reduced motion plus a
  CSS safety block; hover and replay gated by `(hover: hover) and (pointer: fine)`.
  The one gap is plan 001.
- Cohesion & tokens — one check-ring morpheme (KYC/Ramp), one `Contactless`
  glyph (Cards/Terminal), staggers 55–80 ms.
- Missed opportunities — none worth a plan; the section's discipline («one
  gesture per instrument») is the point, and adding motion would work against it.
