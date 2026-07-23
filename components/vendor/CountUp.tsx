"use client";

// Number ticker. Адаптация идеи React Bits CountUp, переписан на GSAP:
// проект держит один анимационный движок (у React Bits — Motion-спрингс с
// овершутом; здесь — crelOut без овершута, по Global Constraints плана).
// Всегда tabular-nums, формат "1 000.00" (пробел-разделитель тысяч).
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ensureEases } from "@/lib/easing";

function format(v: number, decimals: number): string {
  const [int, dec] = v.toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${grouped}.${dec}` : grouped;
}

export function CountUp({
  to,
  play,
  duration = 0.7,
  decimals = 2,
  className = "",
}: {
  to: number;
  play: boolean;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!play || started.current) return;
    started.current = true;
    ensureEases();
    const proxy = { v: 0 };
    const tween = gsap.to(proxy, {
      v: to,
      duration,
      ease: "crelOut",
      onUpdate() {
        if (ref.current) ref.current.textContent = format(proxy.v, decimals);
      },
    });
    return () => {
      tween.kill();
    };
  }, [play, to, duration, decimals]);

  // SSR/статика: сразу конечное значение (прогон перепишет с нуля)
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {format(to, decimals)}
    </span>
  );
}
