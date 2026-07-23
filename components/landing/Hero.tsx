"use client";

// Hero-каркас (общий для состояний): слева команда-display + смысловой h1 + CTA,
// справа — слот состояния (И4: RampWidget для platform). SSG отдаёт полный текст
// команды — на загрузке ничего не перепечатывается (LCP, CLS=0).
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";
import { hero } from "@/content/shared";
import type { LandingState } from "@/content/types";
import { ensureEases } from "@/lib/easing";
import { MockupStage } from "@/components/mockups/MockupStage";
import { RampWidget } from "@/components/mockups/RampWidget";

interface HeroProps {
  state: LandingState;
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
      className={`group inline-flex items-baseline rounded-(--radius-m) px-6 py-3 text-[0.8125rem] lowercase tracking-[0.08em] transition-colors duration-(--d-quick) ${
        primary
          ? "bg-ink text-ink-invert hover:bg-ink/90"
          : "border border-ink text-ink hover:bg-ink hover:text-ink-invert"
      }`}
    >
      {text}
      {hasCursor && (
        <span aria-hidden className="opacity-0 transition-opacity duration-(--d-quick) group-hover:opacity-100">
          _
        </span>
      )}
    </a>
  );
}

export function Hero({ state, argRef, cursorRef, subWrapRef }: HeroProps) {
  const content = hero[state];
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
    <section className="mx-auto w-full max-w-[1200px] px-5 pt-20 pb-16 md:px-12 md:pt-28 md:pb-24">
      {/* командная строка на линейке: терминальный ввод, прочитанный по-швейцарски.
          Линия полноширинная — организует весь первый экран; курсор стоит на ней. */}
      <div aria-hidden className="text-display select-none border-b border-line pb-5 md:pb-7">
        c:
        <span ref={argRef}>{content.commandArg}</span>
        <span ref={cursorRef} className="cursor-blink">
          _
        </span>
      </div>
      <div className="mt-8 grid grid-cols-12 items-start gap-6 md:mt-10">
        <div ref={subWrapRef} className="col-span-12 md:col-span-7">
          {/* смысл несёт h1; команда выше — декоративная */}
          <h1 className="max-w-[44ch] text-[1.125rem] leading-relaxed font-normal text-ink-soft md:text-[1.1875rem]">
            {content.subtitle}
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Cta label={content.ctaPrimary} primary />
            {content.ctaSecondary && <Cta label={content.ctaSecondary} primary={false} />}
          </div>
        </div>
        {/* слот состояния: services — воздух; platform — живой RampWidget */}
        <div className="col-span-12 md:col-span-5" data-hero-slot={state}>
          {state === "platform" && (
            <div className="mx-auto mt-8 w-full max-w-[380px] md:mt-0 md:ml-auto">
              <MockupStage key="hero-ramp">
                <RampWidget />
              </MockupStage>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
