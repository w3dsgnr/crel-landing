"use client";

// Virtual accounts / IBANs. Прогон: IBAN «выдаётся» stepped-группами по 4 символа
// (120ms/группа) — единственный родственник typewriter вне hero, мотивирован смыслом
// (генерация счёта). IBANы — тестовые образцы, не реальные счета.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { mockups } from "@/content/platform";
import { useMockupStage } from "./MockupStage";
import { ensureEases } from "@/lib/easing";
import { chipToneClass } from "@/lib/chipTone";

const GROUP_MS = 120;

export function IbanAccount() {
  const { stage, complete } = useMockupStage();
  const ibanRef = useRef<HTMLSpanElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const timers = useRef<number[]>([]);
  const m = mockups.iban;

  useEffect(() => {
    if (stage !== "play") return;
    ensureEases();
    const el = ibanRef.current;
    if (!el) return;
    const groups = m.rows[0].iban.split(" ");
    el.textContent = "";
    gsap.set(chipRef.current, { autoAlpha: 0 });
    groups.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          el.textContent = groups.slice(0, i + 1).join(" ");
        }, (i + 1) * GROUP_MS)
      );
    });
    const done = (groups.length + 1) * GROUP_MS;
    timers.current.push(
      window.setTimeout(() => {
        gsap.to(chipRef.current, { autoAlpha: 1, duration: 0.2, ease: "crelOut", onComplete: complete });
      }, done)
    );
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [stage, complete, m.rows]);

  return (
    <div className="p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-label text-ink-soft">{m.header}</p>
      </div>
      <p className="mt-1 text-[0.6875rem] lowercase text-ink-soft">{m.sub}</p>
      <div className="mt-3">
        {m.rows.map((row, i) => (
          <div
            key={row.name}
            className={`py-2.5 not-last:border-b not-last:border-line ${"dimmed" in row && row.dimmed ? "opacity-50" : ""}`}
          >
            <div className="flex items-center justify-between text-[0.8125rem]">
              <span>{row.name}</span>
              <span
                ref={i === 0 ? chipRef : undefined}
                className={`rounded-(--radius-s) border px-1.5 py-0.5 text-[0.6875rem] lowercase ${chipToneClass(row.chip)}`}
              >
                {row.chip}
              </span>
            </div>
            <p className="mt-1 text-[0.75rem] tabular-nums tracking-[0.04em] text-ink-soft">
              <span ref={i === 0 ? ibanRef : undefined}>{row.iban}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
