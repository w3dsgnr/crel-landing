"use client";

// Владелец состояния лендинга. И2: переключение — полная «Перепечатка»
// (useSwitchOrchestrator), popstate проигрывает тот же переход.
import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { SectionRenderer } from "./SectionRenderer";
import type { LandingState } from "@/content/types";
import { initLenis } from "@/lib/lenis";
import { useTypewriter } from "@/lib/useTypewriter";
import { useSwitchOrchestrator } from "@/lib/useSwitchOrchestrator";

const STATES: LandingState[] = ["services", "platform"];

function stateFromPath(pathname: string): LandingState | null {
  const seg = pathname.replaceAll("/", "");
  return (STATES as string[]).includes(seg) ? (seg as LandingState) : null;
}

export function Landing({ initial }: { initial: LandingState }) {
  const [state, setState] = useState<LandingState>(initial);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const argRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const subWrapRef = useRef<HTMLDivElement>(null);

  const typewriter = useTypewriter(argRef, cursorRef);

  const applyState = useCallback((next: LandingState) => setState(next), []);

  const { switchTo } = useSwitchOrchestrator({
    state,
    applyState,
    typewriter,
    caretRef,
    mainRef,
    subWrapRef,
  });

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

  // popstate: back/forward проигрывают тот же переход (без своего pushState)
  useEffect(() => {
    const onPop = () => {
      const next = stateFromPath(location.pathname) ?? initial;
      switchTo(next, { push: false });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [initial, switchTo]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="absolute top-0 h-px w-px" />
      <Header state={state} onSwitch={switchTo} scrolled={scrolled} caretRef={caretRef} />
      {/* aria-live анонс состояния для скринридеров */}
      <p aria-live="polite" className="sr-only">
        {state}
      </p>
      <main ref={mainRef} className="flex-1">
        <Hero state={state} argRef={argRef} cursorRef={cursorRef} subWrapRef={subWrapRef} />
        <SectionRenderer state={state} />
      </main>
    </>
  );
}
