"use client";

// Контролируемая машина печати — ядро «Перепечатки» (implementation-plan Task 2.2).
// Работает напрямую с DOM-нодами (textContent), без React-state: ноль ре-рендеров
// на символ. TextType из React Bits не подходит: нет контролируемого режима.
import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

export type TypewriterPhase = "idle" | "erasing" | "typing";

export interface TypewriterHandle {
  /** Стереть текущий аргумент и напечатать next. По умолчанию 40ms/символ
   *  (--t-char-fast); charMs позволяет замедлить (авто-цикл hero). */
  retype: (next: string, charMs?: number) => void;
  /** Мгновенно установить финальную строку, снять все таймеры (скип). */
  skipTo: (final: string) => void;
  phase: () => TypewriterPhase;
}

const CHAR_MS = 40; // --t-char-fast

export function useTypewriter(
  argRef: RefObject<HTMLElement | null>,
  cursorRef: RefObject<HTMLElement | null>
): TypewriterHandle {
  const timers = useRef<number[]>([]);
  const phaseRef = useRef<TypewriterPhase>("idle");

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const setCursorBlinking = useCallback(
    (blinking: boolean) => {
      // грамматика курсора: горит при работе, мигает только в паузе
      cursorRef.current?.classList.toggle("cursor-blink", blinking);
    },
    [cursorRef]
  );

  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const retype = useCallback(
    (next: string, charMs: number = CHAR_MS) => {
      const el = argRef.current;
      if (!el) return;
      clearTimers();
      setCursorBlinking(false);
      phaseRef.current = "erasing";

      const from = el.textContent ?? "";
      // backspace: посимвольно, stepped
      for (let i = 1; i <= from.length; i++) {
        schedule(() => {
          el.textContent = from.slice(0, from.length - i);
        }, i * charMs);
      }
      const eraseDone = from.length * charMs;
      schedule(() => {
        phaseRef.current = "typing";
      }, eraseDone);
      // набор нового аргумента
      for (let i = 1; i <= next.length; i++) {
        schedule(() => {
          el.textContent = next.slice(0, i);
        }, eraseDone + i * charMs);
      }
      schedule(() => {
        phaseRef.current = "idle";
        setCursorBlinking(true); // один цикл blink и далее постоянное мигание
      }, eraseDone + next.length * charMs);
    },
    [argRef, clearTimers, schedule, setCursorBlinking]
  );

  const skipTo = useCallback(
    (final: string) => {
      clearTimers();
      if (argRef.current) argRef.current.textContent = final;
      phaseRef.current = "idle";
      setCursorBlinking(true);
    },
    [argRef, clearTimers, setCursorBlinking]
  );

  useEffect(() => clearTimers, [clearTimers]);

  return { retype, skipTo, phase: () => phaseRef.current };
}
