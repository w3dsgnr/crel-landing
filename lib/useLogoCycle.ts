"use client";

// Авто-цикл «text type» для лого в шапке — поверх машины печати useTypewriter,
// без новых зависимостей (тот же приём, что useHeroCycle для hero-заголовка).
// Последовательность: 5000мс выдержка → стереть → 600мс пауза (курсор мигает)
// → напечатать то же слово → 5000мс выдержка → … по кругу. Пауза между
// стиранием и печатью — два вызова retype: retype("") + retype(word); машина
// сама держит грамматику курсора (горит при работе, мигает в паузах).
// Цикл гаснет, пока вкладка скрыта (document.hidden), и перезапускается с полной
// выдержки при возврате; на unmount все таймеры снимаются.
import { useEffect, useRef } from "react";
import type { TypewriterHandle } from "./useTypewriter";

const HOLD_MS = 5000; // выдержка до первого запуска и между итерациями
const GAP_MS = 600; // пауза между стиранием и печатью
// Длительность символа машины печати — дубликат CHAR_MS из lib/useTypewriter.ts
// (там константа не экспортируется; при изменении держать в синхроне).
const CHAR_MS = 40;

export function useLogoCycle(typewriter: TypewriterHandle, word: string): void {
  // машина печати через ref: цикл не перезапускается от смены её identity
  const typewriterRef = useRef(typewriter);
  typewriterRef.current = typewriter;

  useEffect(() => {
    // reduced-motion: печать не запускаем вовсе — статичное лого, курсор
    // по глобальному правилу .cursor-blink тоже не мигает
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };
    const clear = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };

    // шаг цикла: выдержать HOLD_MS → стереть (word.length*CHAR_MS) → GAP_MS →
    // напечатать (word.length*CHAR_MS) → снова шаг
    const step = () => {
      schedule(() => {
        typewriterRef.current.retype("");
        schedule(() => {
          typewriterRef.current.retype(word);
          schedule(step, word.length * CHAR_MS);
        }, word.length * CHAR_MS + GAP_MS);
      }, HOLD_MS);
    };

    const start = () => {
      clear();
      step();
    };
    // скрытая вкладка: снять таймеры и вернуть полное слово (если поймали
    // на середине печати); при возврате — заново с полной выдержки
    const onVisibility = () => {
      if (document.hidden) {
        clear();
        typewriterRef.current.skipTo(word);
      } else {
        start();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    if (!document.hidden) start();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clear();
    };
  }, [word]);
}
