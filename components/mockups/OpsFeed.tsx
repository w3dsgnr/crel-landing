"use client";

// Статус-лента сопровождения. Прогон: reconciliation досчитывается тикером,
// остальные значения подтверждаются каскадом; "live" несёт статусный акцент
// (зелёный живёт только внутри мокапов — правило «Цвет v2»).
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MockupStage, useMockupStage } from "./MockupStage";
import { CountUp } from "@/components/vendor/CountUp";
import { ensureEases } from "@/lib/easing";

export type FeedRow = { label: string; value: string };

// "2 431 / 2 431" → тикер левой части + статичный хвост
const TICK_RE = /^([\d\s]+?)\s*\/\s*(.+)$/;

function FeedValue({ value, tick, play }: { value: string; tick: boolean; play: boolean }) {
  const m = tick ? value.match(TICK_RE) : null;
  if (m) {
    return (
      <span className="tabular-nums">
        <CountUp to={parseInt(m[1].replace(/\s/g, ""), 10)} play={play} decimals={0} /> / {m[2]}
      </span>
    );
  }
  return (
    <span className={`feed-in tabular-nums ${value === "live" ? "text-accent-deep" : ""}`}>
      {value}
    </span>
  );
}

function Body({ rows }: { rows: FeedRow[] }) {
  const { stage, complete } = useMockupStage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== "play" || !rootRef.current) return;
    ensureEases();
    const vals = rootRef.current.querySelectorAll(".feed-in");
    const tween = gsap.from(vals, {
      autoAlpha: 0,
      y: 4,
      duration: 0.25,
      stagger: 0.3,
      delay: 0.5, // тикер сверки успевает досчитаться первым
      ease: "crelOut",
      onComplete: complete,
    });
    return () => {
      tween.kill();
      // срыв прогона (вкладка ушла в фон) — не оставляем значения полускрытыми
      gsap.set(vals, { clearProps: "opacity,visibility,transform" });
    };
  }, [stage, complete]);

  return (
    <div ref={rootRef} className="p-4">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className="flex items-center justify-between py-2 text-[0.8125rem] lowercase not-last:border-b not-last:border-line"
        >
          <span className="text-ink-soft">{r.label}</span>
          <FeedValue value={r.value} tick={i === 0} play={stage === "play"} />
        </div>
      ))}
    </div>
  );
}

export function OpsFeed({ rows, className = "" }: { rows: FeedRow[]; className?: string }) {
  return (
    <MockupStage className={className}>
      <Body rows={rows} />
    </MockupStage>
  );
}
