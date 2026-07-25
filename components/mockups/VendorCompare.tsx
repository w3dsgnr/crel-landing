"use client";

// Сравнение провайдеров (рифма smart-routing карточки OnRamper). Прогон:
// подсветка сканирует котировки сверху вниз дискретными шагами (терминальный
// step, не глайд), останавливается на лучшей, чип selected вспыхивает.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MockupStage, useMockupStage } from "./MockupStage";
import { ensureEases } from "@/lib/easing";
import { chipToneClass } from "@/lib/chipTone";

export type CompareRow = { name: string; fee: string; selected: boolean };

const STEP_S = 0.24;

function Body({ rows }: { rows: CompareRow[] }) {
  const { stage, complete } = useMockupStage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== "play" || !rootRef.current) return;
    ensureEases();
    const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>("[data-row]"));
    const chip = rootRef.current.querySelector<HTMLElement>(".compare-chip");
    const selectedIdx = Math.max(0, rows.findIndex((r) => r.selected));
    const highlight = (on: number) =>
      items.forEach((el, i) => el.classList.toggle("bg-bg-deep", i === on));

    const tl = gsap.timeline({ onComplete: complete });
    if (chip) tl.set(chip, { autoAlpha: 0 }, 0);
    items.forEach((_, i) => tl.call(() => highlight(i), undefined, i * STEP_S));
    tl.call(() => highlight(selectedIdx), undefined, items.length * STEP_S + 0.18);
    if (chip) tl.to(chip, { autoAlpha: 1, duration: 0.2, ease: "crelOut" }, items.length * STEP_S + 0.3);
    return () => {
      tl.kill();
      // срыв прогона — мгновенно конечное состояние
      highlight(selectedIdx);
      if (chip) gsap.set(chip, { clearProps: "opacity,visibility" });
    };
  }, [stage, complete, rows]);

  return (
    <div ref={rootRef} className="p-4">
      {rows.map((r) => (
        <div
          key={r.name}
          data-row
          className={`flex items-center justify-between rounded-(--radius-m) px-2 py-2 text-[0.8125rem] lowercase ${
            r.selected ? "bg-bg-deep" : "text-ink-soft"
          }`}
        >
          <span>{r.name}</span>
          <span className="flex items-center gap-2">
            <span className="tabular-nums">{r.fee}</span>
            {r.selected && (
              <span className={`compare-chip rounded-(--radius-s) border px-1.5 py-0.5 text-[0.6875rem] ${chipToneClass("selected")}`}>
                selected
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

export function VendorCompare({ rows, className = "" }: { rows: CompareRow[]; className?: string }) {
  return (
    <MockupStage className={className}>
      <Body rows={rows} />
    </MockupStage>
  );
}
