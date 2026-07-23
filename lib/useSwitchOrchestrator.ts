"use client";

// Оркестратор «Перепечатки» — покадровый таймлайн landing-concept §1.1.
// Бюджет ≤900ms до полной читабельности. Правила:
//  - «последний клик побеждает»: никакой очереди, kill всего активного;
//  - reduced-motion: мгновенная замена + crossfade <main> 150ms;
//  - скролл-сброс instant только если ушли глубже первого вьюпорта.
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LandingState } from "@/content/types";
import type { TypewriterHandle } from "./useTypewriter";
import { ensureEases } from "./easing";
import { scrollToTopInstant } from "./lenis";
import { meta } from "@/content/meta";

// Таймлайн (ms) — зеркалит таблицу landing-concept §1.1
const ERASE_DELAY = 80;
const STATE_SWAP_AT = 200; // React-замена секций под покровом exit-каскада
const ENTER_AT = 280;
const EXIT_DUR = 0.12;
const EXIT_STAGGER = 0.04;
const ENTER_DUR = 0.4;
const ENTER_STAGGER = 0.06;
const CARET_DUR = 0.4;
const HERO_SWAP_DUR = 0.2;
const ENTER_VISIBLE_COUNT = 3; // анимируются только первые видимые секции

interface OrchestratorArgs {
  state: LandingState;
  applyState: (next: LandingState) => void;
  typewriter: TypewriterHandle;
  caretRef: RefObject<HTMLDivElement | null>;
  mainRef: RefObject<HTMLElement | null>;
  subWrapRef: RefObject<HTMLDivElement | null>;
}

export function useSwitchOrchestrator({
  state,
  applyState,
  typewriter,
  caretRef,
  mainRef,
  subWrapRef,
}: OrchestratorArgs) {
  const animating = useRef(false);
  const pendingEnter = useRef(false);
  const timeouts = useRef<number[]>([]);
  const tweens = useRef<gsap.core.Tween[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

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

  const sections = useCallback((): HTMLElement[] => {
    return Array.from(mainRef.current?.querySelectorAll<HTMLElement>("[data-section-index]") ?? []);
  }, [mainRef]);

  const visibleSections = useCallback((): HTMLElement[] => {
    const vh = window.innerHeight;
    return sections().filter((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < vh;
    });
  }, [sections]);

  const finishInstantly = useCallback(
    (target: LandingState) => {
      clearAll();
      typewriter.skipTo(target);
      gsap.set([...sections(), subWrapRef.current].filter(Boolean), {
        clearProps: "all",
      });
      if (caretRef.current) gsap.set(caretRef.current, { autoAlpha: 0 });
      pendingEnter.current = false;
      animating.current = false;
      applyState(target);
      requestAnimationFrame(() => {
        // после мгновенного монтажа — сбросить возможные inline-стили новых секций
        gsap.set(sections(), { clearProps: "all" });
        ScrollTrigger.refresh();
      });
    },
    [applyState, caretRef, clearAll, sections, subWrapRef, typewriter]
  );

  const switchTo = useCallback(
    (next: LandingState, opts: { push?: boolean } = {}) => {
      const { push = true } = opts;
      if (next === stateRef.current && !animating.current) return;

      if (push) history.pushState({ crel: next }, "", `/${next}`);
      document.title = meta[next].title;

      // Скип: «последний клик побеждает» — мгновенно в конечное состояние цели
      if (animating.current) {
        finishInstantly(next);
        return;
      }

      // Reduced-motion ветка: без печати/каскадов/каретки
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        typewriter.skipTo(next);
        if (window.scrollY > window.innerHeight) scrollToTopInstant();
        applyState(next);
        if (mainRef.current) {
          gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.15 });
        }
        return;
      }

      ensureEases();
      animating.current = true;

      // t=0: скролл-сброс (мгновенный, до каскадов)
      if (window.scrollY > window.innerHeight) scrollToTopInstant();

      // t=0: каретка 140×2px под шапкой
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
              },
            }
          )
        );
      }

      // t=0: exit-каскад видимых секций (сверху вниз) + hero-обёртка
      const exiting = visibleSections();
      if (exiting.length) {
        track(
          gsap.to(exiting, {
            y: 12,
            autoAlpha: 0,
            duration: EXIT_DUR,
            stagger: EXIT_STAGGER,
            ease: "crelSwap",
          })
        );
      }
      if (subWrapRef.current) {
        track(gsap.to(subWrapRef.current, { autoAlpha: 0, duration: EXIT_DUR, ease: "crelSwap" }));
      }

      // t=80: backspace → набор нового аргумента (320+320ms при 8 символах)
      later(() => typewriter.retype(next), ERASE_DELAY);

      // t=200: React-замена секций; enter-каскад запустит layout-эффект
      later(() => {
        pendingEnter.current = true;
        applyState(next);
      }, STATE_SWAP_AT);
    },
    [applyState, caretRef, finishInstantly, later, mainRef, subWrapRef, track, typewriter, visibleSections]
  );

  // Enter-стадия: после монтажа секций нового состояния (t=280 от клика)
  useLayoutEffect(() => {
    if (!pendingEnter.current) return;
    pendingEnter.current = false;

    const all = sections();
    const vh = window.innerHeight;
    const entering = all
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < vh;
      })
      .slice(0, ENTER_VISIBLE_COUNT);

    // ниже фолда — мгновенно, без анимации
    gsap.set(all.filter((el) => !entering.includes(el)), { clearProps: "all" });

    if (entering.length) {
      gsap.set(entering, { y: -16, autoAlpha: 0 });
    }
    if (subWrapRef.current) gsap.set(subWrapRef.current, { autoAlpha: 0, y: -8 });

    const startDelay = (ENTER_AT - STATE_SWAP_AT) / 1000;
    if (entering.length) {
      track(
        gsap.to(entering, {
          y: 0,
          autoAlpha: 1,
          duration: ENTER_DUR,
          stagger: ENTER_STAGGER,
          delay: startDelay,
          ease: "crelOut",
          clearProps: "all",
          onComplete: () => {
            animating.current = false;
            ScrollTrigger.refresh();
          },
        })
      );
    } else {
      animating.current = false;
    }
    if (subWrapRef.current) {
      track(
        gsap.to(subWrapRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: HERO_SWAP_DUR,
          delay: startDelay,
          ease: "crelOut",
          clearProps: "all",
        })
      );
    }
  }, [state, sections, subWrapRef, track]);

  useEffect(() => clearAll, [clearAll]);

  return { switchTo };
}
