"use client";

// 03: use cases — 5 табов аудиторий. Активный таб — underline-слайд (transform по
// измеренной позиции), панель — crossfade + translateY 8px, 250ms. Клавиатура: стрелки.
// Мокапы в панелях — статичные (конечное состояние), прогоны живут в capabilities.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useCases } from "@/content/platform";
import { MockupStage } from "@/components/mockups/MockupStage";
import { KycFlow } from "@/components/mockups/KycFlow";
import { RampWidget } from "@/components/mockups/RampWidget";
import { CardDuo } from "@/components/mockups/CardDuo";
import { SellerTerminal } from "@/components/mockups/SellerTerminal";
import { IbanAccount } from "@/components/mockups/IbanAccount";
import { ensureEases } from "@/lib/easing";

const MOCKUPS = {
  kyc: KycFlow,
  ramp: RampWidget,
  cards: CardDuo,
  terminal: SellerTerminal,
  iban: IbanAccount,
} as const;

export function UseCases() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mounted = useRef(false);

  // underline-слайд к активному табу (layout animation по измеренной позиции)
  useLayoutEffect(() => {
    const btn = tabRefs.current[active];
    const line = underlineRef.current;
    if (!btn || !line) return;
    ensureEases();
    const target = { x: btn.offsetLeft, width: btn.offsetWidth };
    if (!mounted.current) {
      gsap.set(line, target);
      return;
    }
    gsap.to(line, { ...target, duration: 0.2, ease: "crelSwap" });
  }, [active]);

  // crossfade + y8 панели
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!panelRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(
      panelRef.current,
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.25, ease: "crelOut" }
    );
    return () => {
      tween.kill();
    };
  }, [active]);

  // после смены таба фокус остаётся управляемым (roving tabindex)
  useEffect(() => {
    if (mounted.current && document.activeElement?.getAttribute("role") === "tab") {
      tabRefs.current[active]?.focus();
    }
  }, [active]);

  const tab = useCases.tabs[active];
  const Mockup = MOCKUPS[tab.mockup];

  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:px-12 md:py-36">
        <p className="text-label text-ink-soft">{useCases.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{useCases.section.title}</h2>

        <div
          ref={listRef}
          role="tablist"
          aria-label="use cases"
          onKeyDown={(e) => {
            const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
            if (!dir) return;
            e.preventDefault();
            setActive((a) => (a + dir + useCases.tabs.length) % useCases.tabs.length);
          }}
          className="relative mt-16 flex gap-6 overflow-x-auto border-b border-line pb-3"
        >
          {useCases.tabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={i === active}
              aria-controls={`panel-${t.id}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={`whitespace-nowrap text-[0.9375rem] lowercase transition-colors duration-(--d-quick) ${
                i === active ? "text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.id}
            </button>
          ))}
          <div ref={underlineRef} aria-hidden className="absolute bottom-0 left-0 h-[2px] bg-ink" />
        </div>

        <div
          ref={panelRef}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          className="mt-12 grid grid-cols-1 items-start gap-10 md:grid-cols-2"
        >
          <div>
            <h3 className="max-w-[20ch] text-[clamp(1.5rem,2.5vw,2rem)] font-medium tracking-[-0.01em]">
              {tab.title}
            </h3>
            <p className="mt-4 max-w-[48ch] text-[0.9375rem] leading-relaxed text-ink-soft">{tab.body}</p>
            <div className="mt-8">
              {tab.checks.map((c) => (
                <p key={c} className="border-t border-line py-3 text-[0.9375rem]">
                  {c}
                </p>
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-[380px]">
            <MockupStage isStatic key={tab.id}>
              <Mockup />
            </MockupStage>
          </div>
        </div>
      </div>
    </section>
  );
}
