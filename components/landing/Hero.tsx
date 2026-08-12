"use client";

// Hero-каркас (общий для состояний): слева команда-display + смысловой h1 + CTA,
// справа — слот состояния (RampWidget, всегда). SSG отдаёт полный текст
// команды — на загрузке ничего не перепечатывается (LCP, CLS=0).
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";
import { hero } from "@/content/shared";
import type { LandingState } from "@/content/types";
import { ensureEases } from "@/lib/easing";
import { MockupStage } from "@/components/mockups/MockupStage";
import { RampWidget } from "@/components/mockups/RampWidget";
import { CursorGrid } from "@/components/vendor/CursorGrid";

interface HeroProps {
  selected: LandingState | null;
  argRef: RefObject<HTMLSpanElement | null>;
  cursorRef: RefObject<HTMLSpanElement | null>;
  /** обёртка h1+CTA — crossfade при переключении (оркестратор) */
  subWrapRef: RefObject<HTMLDivElement | null>;
}

function Cta({ label, primary }: { label: string; primary: boolean }) {
  const text = label.endsWith("_") ? label.slice(0, -1) : label;
  const hasCursor = label.endsWith("_");
  return (
    <a
      href="#contact"
      className={`group inline-flex items-baseline rounded-(--radius-pill) px-7 py-3.5 text-[0.8125rem] lowercase tracking-[0.08em] transition-[background-color,box-shadow,transform,color] duration-(--d-quick) hover:-translate-y-px ${
        primary
          ? "bg-ink text-ink-invert hover:bg-ink/90 hover:shadow-(--glow-m)"
          : "bg-ink/[0.05] text-ink hover:bg-ink/[0.09]"
      }`}
    >
      {text}
      {hasCursor && (
        <span
          aria-hidden
          className={`opacity-0 transition-opacity duration-(--d-quick) group-hover:opacity-100 ${
            primary ? "text-accent-bright" : "text-accent"
          }`}
        >
          _
        </span>
      )}
    </a>
  );
}

export function Hero({ selected, argRef, cursorRef, subWrapRef }: HeroProps) {
  const entered = useRef(false);

  // Вход при загрузке: только подзаголовок и CTA (fade + rise), команда статична.
  useEffect(() => {
    if (entered.current) return;
    entered.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ensureEases();
    const items = subWrapRef.current?.children;
    if (!items) return;
    gsap.from(items, {
      y: 12,
      autoAlpha: 0,
      duration: 0.4,
      ease: "crelOut",
      stagger: 0.06,
      clearProps: "all",
    });
  }, [subWrapRef]);

  return (
    // 1а: контент прижат к верху (§4.7), воздух уходит вниз.
    // Фон обоих состояний — cursor-grid во всю ширину секции (серебро --grid).
    // Анатомия Krida: чёрная секция (layer-v4-invert) «лежит» поверх серой ленты
    // логотипов — z-10 над ней, нижние углы скруглены (--v4-radius-hero),
    // overflow режет cursor-grid по радиусу.
    <section className="layer-v4 layer-v4-invert relative isolate z-10 overflow-hidden rounded-b-(--v4-radius-hero) bg-bg">
      <CursorGrid />
      {/* pt считает клиренс плавающей стеклянной капсулы (fixed, ~76px) */}
      <div className="mx-auto grid min-h-[60dvh] w-full max-w-[1200px] grid-cols-12 items-start gap-6 px-5 pt-28 pb-12 md:px-12 md:pt-36 md:pb-16">
        <div className="col-span-12 md:col-span-7">
          {/* декоративная команда; смысл несёт h1 ниже; курсор — акцент «живого» */}
          <div aria-hidden className="text-display select-none">
            c:
            {/* Значение в JSX намеренно константно: после монтирования этим узлом владеет
                useTypewriter (пишет в textContent напрямую). Если подставить сюда selected,
                React перезапишет текст в момент applySelected — аргумент сменится мгновенно,
                а следом typewriter начнёт стирать и печатать его заново. */}
            <span ref={argRef} suppressHydrationWarning>
              {hero.restArg}
            </span>
            <span ref={cursorRef} className="cursor-blink text-accent">
              _
            </span>
          </div>
          <div ref={subWrapRef} className="mt-8">
            <h1 className="max-w-[52ch] text-[1.0625rem] leading-relaxed font-normal text-ink-soft">
              {hero.subtitle}
            </h1>
            <div className="mt-8 flex items-center gap-4">
              <Cta label={hero.ctaPrimary} primary />
            </div>
          </div>
        </div>
        {/* слот состояния: RampWidget показан всегда — баланс сетки 7/5 */}
        <div className="col-span-12 md:col-span-5">
          <div className="mx-auto mt-12 w-full max-w-[380px] md:mt-0 md:ml-auto">
            <MockupStage key="hero-ramp">
              <RampWidget />
            </MockupStage>
          </div>
        </div>
      </div>
    </section>
  );
}
