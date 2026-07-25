"use client";

// Фрагмент мобильного приложения (Mobile apps). Прогон — микросценарий
// «входящий платёж»: уведомление въезжает сверху, баланс досчитывается тикером.
// Прямая рифма со стеком payment-нотификаций Cash App, в нашей грамматике
// (translate+fade, crelOut, статусный зелёный только в значении платежа).
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MockupStage, useMockupStage } from "./MockupStage";
import { CountUp } from "@/components/vendor/CountUp";
import { ensureEases } from "@/lib/easing";

const COPY = {
  notifLabel: "payment received",
  notifValue: "+250.00",
  balanceLabel: "balance",
  balance: 1480,
  actions: ["send", "receive"] as const,
};

function Body() {
  const { stage, complete } = useMockupStage();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== "play" || !notifRef.current) return;
    ensureEases();
    const tl = gsap.timeline({ onComplete: complete });
    tl.from(notifRef.current, { autoAlpha: 0, y: -6, duration: 0.3, ease: "crelOut" })
      // тикер баланса (delay 0.35 в CountUp) досчитывается к 1.05s
      .to({}, { duration: 0.9 });
    return () => {
      tl.kill();
      // срыв прогона (вкладка ушла в фон) — уведомление не остаётся полускрытым
      if (notifRef.current) gsap.set(notifRef.current, { clearProps: "opacity,visibility,transform" });
    };
  }, [stage, complete]);

  return (
    <div className="p-4">
      <div
        ref={notifRef}
        className="flex items-center justify-between rounded-(--radius-m) bg-bg-alt px-3 py-2 text-[0.75rem] lowercase"
      >
        <span className="text-ink-soft">{COPY.notifLabel}</span>
        <span className="tabular-nums text-accent-deep">{COPY.notifValue}</span>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-[0.75rem] lowercase text-ink-soft">{COPY.balanceLabel}</span>
        <CountUp
          to={COPY.balance}
          play={stage === "play"}
          delay={0.35}
          className="text-[1.25rem] font-medium"
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-(--radius-m) bg-ink px-3 py-2 text-center text-[0.75rem] lowercase text-ink-invert">
          {COPY.actions[0]}
        </div>
        <div className="rounded-(--radius-m) border border-line px-3 py-2 text-center text-[0.75rem] lowercase">
          {COPY.actions[1]}
        </div>
      </div>
    </div>
  );
}

export function WalletFragment({ className = "" }: { className?: string }) {
  return (
    <MockupStage className={className}>
      <Body />
    </MockupStage>
  );
}
