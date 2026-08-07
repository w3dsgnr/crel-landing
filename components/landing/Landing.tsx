"use client";

// Владелец состояния лендинга. Переключение — «Перепечатка» через
// useSwitchOrchestrator; один адрес, история не трогается.
import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { SectionRenderer } from "./SectionRenderer";
import { LogoBand } from "@/components/sections/shared/LogoBand";
import { FinalCta } from "@/components/sections/shared/FinalCta";
import { Footer } from "@/components/sections/shared/Footer";
import type { LandingState } from "@/content/types";
import { initLenis } from "@/lib/lenis";
import { useTypewriter } from "@/lib/useTypewriter";
import { useSwitchOrchestrator } from "@/lib/useSwitchOrchestrator";
import { useReveal } from "@/lib/reveal";

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
    selected: state,
    applySelected: applyState,
    typewriter,
    caretRef,
  });

  useEffect(() => {
    initLenis();
  }, []);

  // Единая reveal-грамматика; инициализация один раз на монтирование
  useReveal(mainRef);

  // Фон шапки: прозрачный → --bg с хайрлайном. Без scroll-листенера — IO-сентинел.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
        {/* общий каркас: лента логотипов под hero, CTA и футер — persistent */}
        <LogoBand />
        <SectionRenderer />
        <FinalCta state={state} />
      </main>
      <Footer />
    </>
  );
}
