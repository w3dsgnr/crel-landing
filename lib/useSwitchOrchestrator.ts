"use client";

// Оркестратор выбора ветки. После слияния (спека §5) он больше не меняет состав
// секций и не трогает историю: адрес один, title один. Осталось три действия —
// перепечатка аргумента команды, проезд каретки и доводка скролла к развилке.
//  - «последний клик побеждает»: повторный клик мгновенно доводит до цели;
//  - reduced-motion: без печати и каретки, мгновенная доводка.
import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";
import type { LandingState } from "@/content/types";
import type { TypewriterHandle } from "./useTypewriter";
import { ensureEases } from "./easing";
import { scrollToBranch } from "./scrollToBranch";

const ERASE_DELAY = 80; // пауза перед началом перепечатки
const CARET_DUR = 0.4;

interface OrchestratorArgs {
  selected: LandingState | null;
  applySelected: (next: LandingState) => void;
  typewriter: TypewriterHandle;
  caretRef: RefObject<HTMLDivElement | null>;
}

export function useSwitchOrchestrator({
  selected,
  applySelected,
  typewriter,
  caretRef,
}: OrchestratorArgs) {
  const animating = useRef(false);
  const timeouts = useRef<number[]>([]);
  const tweens = useRef<gsap.core.Tween[]>([]);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const clearAll = useCallback(() => {
    timeouts.current.forEach((t) => window.clearTimeout(t));
    timeouts.current = [];
    tweens.current.forEach((t) => t.kill());
    tweens.current = [];
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timeouts.current.push(window.setTimeout(fn, ms));
  }, []);

  const track = useCallback((t: gsap.core.Tween) => {
    tweens.current.push(t);
    return t;
  }, []);

  // скип: мгновенно в конечное состояние цели (никогда не блокируем клик)
  const finishInstantly = useCallback(
    (target: LandingState) => {
      clearAll();
      typewriter.skipTo(target);
      if (caretRef.current) gsap.set(caretRef.current, { autoAlpha: 0 });
      animating.current = false;
      applySelected(target);
      scrollToBranch(target, { instant: true });
    },
    [applySelected, caretRef, clearAll, typewriter]
  );

  const switchTo = useCallback(
    (next: LandingState) => {
      if (next === selectedRef.current && !animating.current) {
        // ветка уже выбрана — повторный клик просто возвращает к развилке
        scrollToBranch(next);
        return;
      }

      if (animating.current) {
        finishInstantly(next);
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        typewriter.skipTo(next);
        applySelected(next);
        scrollToBranch(next, { instant: true });
        return;
      }

      ensureEases();
      animating.current = true;
      applySelected(next);

      // каретка 140×2px проезжает по вьюпорту — маркер перехода
      if (caretRef.current) {
        track(
          gsap.fromTo(
            caretRef.current,
            { x: -140, autoAlpha: 1 },
            {
              x: window.innerWidth + 140,
              duration: CARET_DUR,
              ease: "crelSwap",
              onComplete: () => {
                if (caretRef.current) gsap.set(caretRef.current, { autoAlpha: 0 });
                animating.current = false;
              },
            }
          )
        );
      } else {
        animating.current = false;
      }

      later(() => typewriter.retype(next), ERASE_DELAY);
      scrollToBranch(next);
    },
    [applySelected, caretRef, finishInstantly, later, track, typewriter]
  );

  useEffect(() => clearAll, [clearAll]);

  return { switchTo };
}
