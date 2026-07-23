"use client";

// Ramp-виджет: обмен fiat↔crypto. Прогон: ticker суммы получения + fade строки курса.
import { useEffect } from "react";
import { gsap } from "gsap";
import { mockups } from "@/content/platform";
import { useMockupStage } from "./MockupStage";
import { CountUp } from "@/components/vendor/CountUp";

function Field({
  label,
  value,
  chip,
  ticker,
}: {
  label: string;
  value: string;
  chip: string;
  ticker?: boolean;
}) {
  const { stage } = useMockupStage();
  const num = parseFloat(value.replace(/\s/g, ""));
  return (
    <div className="rounded-(--radius-m) bg-bg-alt p-3">
      <p className="text-[0.6875rem] text-ink-soft">{label}</p>
      <div className="mt-1 flex items-center justify-between">
        {ticker ? (
          <CountUp to={num} play={stage === "play"} className="text-[1.25rem] font-medium" />
        ) : (
          <span className="text-[1.25rem] font-medium tabular-nums">{value}</span>
        )}
        <span className="rounded-(--radius-s) border border-line px-2 py-0.5 text-[0.75rem]">
          {chip}
        </span>
      </div>
    </div>
  );
}

export function RampWidget() {
  const { stage, complete } = useMockupStage();
  const m = mockups.ramp;

  useEffect(() => {
    if (stage !== "play") return;
    const call = gsap.delayedCall(1.1, complete);
    return () => {
      call.kill();
    };
  }, [stage, complete]);

  return (
    <div className="flex flex-col gap-2 p-5">
      <Field label={m.sendLabel} value={m.sendValue} chip={m.sendChip} />
      <Field label={m.receiveLabel} value={m.receiveValue} chip={m.receiveChip} ticker />
      <p className="mt-1 text-[0.75rem] text-ink-soft">{m.rate}</p>
      <div className="mt-2 rounded-(--radius-m) bg-ink py-2.5 text-center text-[0.8125rem] text-ink-invert">
        {m.button}
      </div>
      <p className="mt-1 text-center text-[0.6875rem] lowercase text-ink-soft">{m.footnote}</p>
    </div>
  );
}
