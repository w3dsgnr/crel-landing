"use client";

// Seller terminal: телефон принимает платёж. Прогон: сумма ticker-ом,
// press-feedback кнопки (scale .98), статус paid. Один прогон.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { mockups } from "@/content/platform";
import { useMockupStage } from "./MockupStage";
import { CountUp } from "@/components/vendor/CountUp";
import { ensureEases } from "@/lib/easing";
import { chipToneClass } from "@/lib/chipTone";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"];

export function SellerTerminal() {
  const { stage, complete } = useMockupStage();
  const btnRef = useRef<HTMLDivElement>(null);
  const paidRef = useRef<HTMLSpanElement>(null);
  const m = mockups.terminal;

  useEffect(() => {
    if (stage !== "play") return;
    ensureEases();
    const tl = gsap.timeline({ onComplete: complete });
    tl.set(paidRef.current, { autoAlpha: 0 })
      // сумма набирается CountUp-ом (0.8s), затем «нажатие» и paid
      .to(btnRef.current, { scale: 0.98, duration: 0.075, yoyo: true, repeat: 1 }, 0.9)
      .to(paidRef.current, { autoAlpha: 1, duration: 0.2, ease: "crelOut" }, 1.15);
    return () => {
      tl.kill();
    };
  }, [stage, complete]);

  return (
    <div className="p-5">
      <div className="mx-auto w-[172px] rounded-(--radius-xl) border border-line bg-bg p-3">
        <div className="flex items-baseline justify-between">
          <CountUp to={parseFloat(m.amount)} play={stage === "play"} className="text-[1.25rem] font-medium" />
          <span className="text-[0.75rem] text-ink-soft">{m.currency}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1">
          {KEYS.map((k) => (
            <span
              key={k}
              className="rounded-(--radius-s) bg-bg-alt py-1 text-center text-[0.75rem] tabular-nums text-ink-soft"
            >
              {k}
            </span>
          ))}
        </div>
        <div
          ref={btnRef}
          className="mt-2 flex items-center justify-center gap-2 rounded-(--radius-m) bg-ink py-2 text-[0.8125rem] text-ink-invert"
        >
          {m.button}
          <span
            ref={paidRef}
            className={`rounded-(--radius-s) border px-1.5 text-[0.6875rem] lowercase ${chipToneClass(m.paidStatus, true)}`}
          >
            {m.paidStatus}
          </span>
        </div>
      </div>
      <p className="mt-3 text-center text-label text-ink-soft">{m.tag}</p>
    </div>
  );
}
