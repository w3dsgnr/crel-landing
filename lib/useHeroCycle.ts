"use client";

// Авто-цикл перепечатки аргумента hero-заголовка — в духе TextType из React Bits,
// но поверх нашей машины печати (useTypewriter), без новых зависимостей.
// Последовательность: c:rel → HOLD_MS → c:services → HOLD_MS → c:platform → … по кругу.
// Живёт только до первого выбора направления (selected === null). Гасится двумя
// путями: реактивно (active → false) и немедленно через возвращаемый stop() —
// Landing вызывает его синхронно ДО switchTo, чтобы цикл не воевал с оркестратором
// за argRef (остановка по selected опоздала бы: applySelected идёт после retype).
import { useCallback, useEffect, useRef } from "react";
import type { TypewriterHandle } from "./useTypewriter";

// Слова аргумента; префикс "c:" статичен в разметке Hero. SSG отдаёт "rel",
// поэтому цикл стартует не с перепечатки, а с выдержки на нём (LCP/CLS).
const WORDS = ["rel", "services", "platform"] as const;
const HOLD_MS = 2800; // выдержка напечатанного слова перед стиранием
// Скорость авто-цикла — медленнее дефолтных 40ms/символ машины печати:
// перепечатка по клику остаётся быстрой, цикл на загрузке — размеренный.
const CHAR_MS = 75;

export function useHeroCycle(typewriter: TypewriterHandle, active: boolean): () => void {
  const timers = useRef<number[]>([]);
  const stoppedRef = useRef(false);
  // машина печати через ref: цикл не перезапускается от смены её identity
  const typewriterRef = useRef(typewriter);
  typewriterRef.current = typewriter;

  // немедленная остановка: снять таймеры и запретить уже запланированные шаги
  const stop = useCallback(() => {
    stoppedRef.current = true;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => {
    if (!active) return;
    // reduced-motion: цикл не запускаем вовсе — остаётся статичное "rel",
    // как и остальная анимация проекта
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    stoppedRef.current = false;
    const schedule = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    // шаг цикла: выдержать HOLD_MS на слове index, перепечатать на следующее,
    // дождаться конца перепечатки (длина считается из строк и CHAR_MS) — и снова
    const step = (index: number) => {
      schedule(() => {
        if (stoppedRef.current) return;
        const from = WORDS[index];
        const nextIndex = (index + 1) % WORDS.length;
        const next = WORDS[nextIndex];
        typewriterRef.current.retype(next, CHAR_MS);
        // retype = стирание from (from.length*CHAR_MS) + печать next (next.length*CHAR_MS)
        const retypeMs = (from.length + next.length) * CHAR_MS;
        schedule(() => step(nextIndex), retypeMs);
      }, HOLD_MS);
    };

    step(0); // на загрузке ничего не перепечатываем — только пауза на "rel"

    return stop;
  }, [active, stop]);

  return stop;
}
