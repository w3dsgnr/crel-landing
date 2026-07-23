"use client";

// QASIS KYC: статусная лента проверки. Прогон: чипы включаются каскадом 300ms.
// Разметка по умолчанию = конечное состояние (SSR/static показывают финал).
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { mockups } from "@/content/platform";
import { useMockupStage } from "./MockupStage";
import { ensureEases } from "@/lib/easing";

export function KycFlow() {
  const { stage, complete } = useMockupStage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== "play" || !rootRef.current) return;
    ensureEases();
    const chips = rootRef.current.querySelectorAll(".kyc-chip");
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
    };
  }, [stage, complete]);

  return (
    <div ref={rootRef} className="p-5">
      <p className="text-label text-ink-soft">{mockups.kyc.header}</p>
      <div className="mt-3">
        {mockups.kyc.steps.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between py-2.5 text-[0.8125rem] lowercase not-last:border-b not-last:border-line"
          >
            <span className="text-ink-soft">{s.label}</span>
            <span className="kyc-chip rounded-(--radius-s) border border-line px-2 py-0.5 text-[0.75rem]">
              {s.chip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
