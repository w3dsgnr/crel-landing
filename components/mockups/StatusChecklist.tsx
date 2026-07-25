"use client";

// Чек-лист статусов (deploy-модули, лицензионные треки). Прогон: чипы
// включаются каскадом — родня KycFlow, но данные приходят пропсами.
// Живёт в services-карточках, самодостаточен: сам оборачивается в MockupStage.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MockupStage, useMockupStage } from "./MockupStage";
import { ensureEases } from "@/lib/easing";
import { chipToneClass } from "@/lib/chipTone";

export type ChecklistRow = { label: string; chip: string };

function Body({ rows }: { rows: ChecklistRow[] }) {
  const { stage, complete } = useMockupStage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== "play" || !rootRef.current) return;
    ensureEases();
    const chips = rootRef.current.querySelectorAll(".check-chip");
    const tween = gsap.from(chips, {
      autoAlpha: 0,
      y: 4,
      duration: 0.3,
      stagger: 0.3,
      ease: "crelOut",
      onComplete: complete,
    });
    return () => {
      tween.kill();
      // срыв прогона (вкладка ушла в фон) — не оставляем чипы полускрытыми
      gsap.set(chips, { clearProps: "opacity,visibility,transform" });
    };
  }, [stage, complete]);

  return (
    <div ref={rootRef} className="p-4">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between py-2 text-[0.8125rem] lowercase not-last:border-b not-last:border-line"
        >
          <span className="text-ink-soft">{r.label}</span>
          <span className={`check-chip rounded-(--radius-s) border px-2 py-0.5 text-[0.75rem] ${chipToneClass(r.chip)}`}>
            {r.chip}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StatusChecklist({ rows, className = "" }: { rows: ChecklistRow[]; className?: string }) {
  return (
    <MockupStage className={className}>
      <Body rows={rows} />
    </MockupStage>
  );
}
