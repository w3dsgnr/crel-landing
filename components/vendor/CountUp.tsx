"use client";

// Number ticker. Адаптация идеи React Bits CountUp, переписан на GSAP:
// проект держит один анимационный движок (у React Bits — Motion-спрингс с
// овершутом; здесь — crelOut без овершута, по Global Constraints плана).
// Всегда tabular-nums, формат "1 000.00" (пробел-разделитель тысяч).
// Ревизия «живые карточки»: play может переключаться много раз (idle-цикл
// MockupStage) — каждый true-фронт запускает тик заново.
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
  delay = 0,
  decimals = 2,
  className = "",
}: {
  to: number;
  play: boolean;
  duration?: number;
  delay?: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!play) return;
    ensureEases();
    const proxy = { v: 0 };
    const tween = gsap.to(proxy, {
      v: to,
      duration,
      delay,
      ease: "crelOut",
      onUpdate() {
        if (ref.current) ref.current.textContent = format(proxy.v, decimals);
      },
    });
    return () => {
      tween.kill();
      // срыв прогона (анмаунт/скип) — фиксируем конечное значение
      if (ref.current) ref.current.textContent = format(to, decimals);
    };
  }, [play, to, duration, delay, decimals]);

  // SSR/статика: сразу конечное значение (прогон перепишет с нуля)
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {format(to, decimals)}
    </span>
  );
}
