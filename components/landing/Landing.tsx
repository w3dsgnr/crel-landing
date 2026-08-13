"use client";

// Каркас лендинга объединённой страницы: одна страница, один рельс —
// переключателя services/platform больше нет, все секции идут плоским потоком.
import { useEffect, useRef, useState } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { SectionRenderer } from "./SectionRenderer";
import { LogoBand } from "@/components/sections/shared/LogoBand";
import { FinalCta } from "@/components/sections/shared/FinalCta";
import { Footer } from "@/components/sections/shared/Footer";
import { ContactModalProvider } from "@/components/contact/ContactModalProvider";
import { LegalModalProvider } from "@/components/legal/LegalModalProvider";
import { initLenis } from "@/lib/lenis";
import { useTypewriter } from "@/lib/useTypewriter";
import { useHeroCycle } from "@/lib/useHeroCycle";
import { useReveal } from "@/lib/reveal";

export function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const argRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const subWrapRef = useRef<HTMLDivElement>(null);

  const typewriter = useTypewriter(argRef, cursorRef);

  // Авто-цикл заголовка hero: rel → platform → services, бессрочно
  useHeroCycle(typewriter, true);

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
    // Провайдер модалки контакта обёрнут вокруг всего каркаса: кнопки-триггеры
    // живут в трёх местах (шапка, hero, финальный CTA), а сама модалка уходит
    // порталом в <body> — общий предок нужен только ради контекста.
    // LegalModalProvider — тем же приёмом, вложен внутрь: триггеры (footer,
    // wave 3) и сама легал-модалка независимы от контактной, общий предок
    // здесь тоже только ради контекста, порядок вложенности значения не имеет.
    <ContactModalProvider>
      <LegalModalProvider>
        <div ref={sentinelRef} aria-hidden className="absolute top-0 h-px w-px" />
        <Header scrolled={scrolled} />
        <main ref={mainRef} className="flex-1">
          <Hero selected={null} argRef={argRef} cursorRef={cursorRef} subWrapRef={subWrapRef} />
          {/* общий каркас: лента логотипов под hero, CTA и футер — persistent */}
          <LogoBand />
          <SectionRenderer />
          <FinalCta />
        </main>
        <Footer />
      </LegalModalProvider>
    </ContactModalProvider>
  );
}
