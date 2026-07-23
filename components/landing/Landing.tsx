"use client";

// Владелец состояния лендинга. И1: переключение мгновенное (без «Перепечатки»),
// pushState/popstate, title swap, скролл-сброс. И2 подключит useSwitchOrchestrator.
import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./Header";
import { SectionRenderer } from "./SectionRenderer";
import { hero } from "@/content/shared";
import { meta } from "@/content/meta";
import type { LandingState } from "@/content/types";
import { initLenis, scrollToTopInstant } from "@/lib/lenis";

const STATES: LandingState[] = ["services", "platform"];

function stateFromPath(pathname: string): LandingState | null {
  const seg = pathname.replaceAll("/", "");
  return (STATES as string[]).includes(seg) ? (seg as LandingState) : null;
}

export function Landing({ initial }: { initial: LandingState }) {
  const [state, setState] = useState<LandingState>(initial);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initLenis();
  }, []);

  // Фон шапки: прозрачный → --bg с хайрлайном. Без scroll-листенера — IO-сентинел.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const applyState = useCallback((next: LandingState) => {
    setState(next);
    document.title = meta[next].title;
  }, []);

  const switchTo = useCallback(
    (next: LandingState) => {
      if (next === state) return;
      history.pushState({ crel: next }, "", `/${next}`);
      // Правило скролла: сброс только если ушли глубже первого вьюпорта
      if (window.scrollY > window.innerHeight) scrollToTopInstant();
      applyState(next);
    },
    [state, applyState]
  );

  useEffect(() => {
    const onPop = () => {
      const next = stateFromPath(location.pathname) ?? initial;
      if (window.scrollY > window.innerHeight) scrollToTopInstant();
      applyState(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [initial, applyState]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="absolute top-0 h-px w-px" />
      <Header state={state} onSwitch={switchTo} scrolled={scrolled} />
      {/* aria-live анонс состояния для скринридеров */}
      <p aria-live="polite" className="sr-only">
        {state}
      </p>
      <main className="flex-1">
        {/* Временный hero-блок И1: только команда статикой. Полный Hero — И2 */}
        <section className="mx-auto flex min-h-[60dvh] max-w-[1200px] flex-col justify-center px-5 md:px-12">
          <h1 className="text-display">
            c:{hero[state].commandArg}
            <span className="cursor-blink">_</span>
          </h1>
          <p className="mt-8 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-soft">
            {hero[state].subtitle}
          </p>
        </section>
        <SectionRenderer state={state} />
      </main>
    </>
  );
}
