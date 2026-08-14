"use client";

// Привод внутренних сцен мокапов: один прогон при въезде в вьюпорт.
// Грамматика (спека анимации карточек 01, 2026-08-13):
//   phase "static" — атрибута data-play нет → элементы в КОНЕЧНОМ состоянии.
//                    Это же состояние получают SSR, no-JS и prefers-reduced-motion.
//   phase "off"    — data-play="off": стартовая поза, выставляется из JS после
//                    монтирования (как autoAlpha в lib/reveal.ts — разметка
//                    никогда не остаётся скрытой, если скрипт не отработал).
//                    Транзишены в этом состоянии не объявлены вовсе, поза
//                    применяется мгновенно: transition-delay действует в обе
//                    стороны, и с ним «сброс» сам стал бы видимой анимацией.
//   phase "on"     — data-play="on": CSS-транзишены доигрывают до конечного.
// Дальше сцена не переигрывается: карточка — не бесконечная витрина
// (очередь MockupStage с idle-циклом снята в редизайне 2026-08-12).
import { useEffect, useRef, useState } from "react";

export type PlayPhase = "static" | "off" | "on";

export function usePlayOnce<T extends HTMLElement>({
  enabled = true,
  threshold = 0.4,
}: { enabled?: boolean; threshold?: number } = {}) {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<PlayPhase>("static");

  useEffect(() => {
    // enabled=false — прибор переиспользован там, где сцена не нужна
    // (RampWidgetGlass живёт ещё в Hero и в Integration compact)
    if (!enabled) return;
    // reduced-motion остаётся в static: движения нет, содержимое сразу читаемо
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    let armed = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!armed) {
          armed = true;
          // прибор уже хоть сколько-то на экране (перезагрузка с
          // восстановленным скроллом, переход по якорю) — не отматываем
          // назад то, что человек уже увидел: остаёмся в static
          if (entry.intersectionRatio > 0) {
            io.disconnect();
            return;
          }
          setPhase("off");
          return;
        }
        if (!entry.isIntersecting) return;
        setPhase("on");
        io.disconnect();
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, threshold]);

  // data-play отсутствует в static — стартовые позы к разметке не применяются
  return { ref, phase, playAttr: phase === "static" ? undefined : phase };
}
