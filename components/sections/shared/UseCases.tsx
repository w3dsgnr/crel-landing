"use client";

// 03: use cases — формат Wembi «HOW» (wembi-motion-notes, сц. 4-5-8-9):
// pinned-экран (sticky, без pin-spacer — дружит с Lenis и «Перепечаткой»),
// слева табы-навигация + текст кейса, справа — сцена. Скролл скрабит состояния
// (wallets → payrolls), каждый таб — ПОЛНАЯ смена сцены (свой мокап на своей
// заливке), переключение snappy (250-300ms) против медленного дрейфа фонов.
// Табы кликабельны: в scrub-режиме клик докручивает к сегменту, в фолбэке
// (mobile / reduced-motion) — обычные табы. Мокапы — живые (MockupStage).
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCases } from "@/content/platform";
import { MockupStage } from "@/components/mockups/MockupStage";
import { KycFlow } from "@/components/mockups/KycFlow";
import { RampWidget } from "@/components/mockups/RampWidget";
import { CardDuo } from "@/components/mockups/CardDuo";
import { SellerTerminal } from "@/components/mockups/SellerTerminal";
import { IbanAccount } from "@/components/mockups/IbanAccount";
import { ensureEases } from "@/lib/easing";
import { getLenis } from "@/lib/lenis";

const MOCKUPS = {
  kyc: KycFlow,
  ramp: RampWidget,
  cards: CardDuo,
  terminal: SellerTerminal,
  iban: IbanAccount,
} as const;

// Сцена = заливка-задник + подпись зоны текста. Полная смена вселенной на таб:
// signal → светлая bloom → halo → abyss → pine (чередование тёмное/светлое).
const SCENES = [
  { plate: "grad-signal", dark: false },
  { plate: "bg-bg-mist scene-bloom", dark: false },
  { plate: "grad-halo", dark: false },
  { plate: "grad-abyss", dark: true },
  { plate: "card-pine", dark: true },
] as const;

const N = useCases.tabs.length;
// длина скраба: ~90vh на состояние + экран
const WRAP_HEIGHT = `${N * 90 + 100}vh`;

export function UseCases() {
  const [active, setActive] = useState(0);
  const [scrub, setScrub] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const idxRef = useRef(0);
  const mounted = useRef(false);

  // pinned-скраб только desktop + no-reduced-motion; иначе — обычные табы
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const apply = () => setScrub(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // скраб: прогресс обёртки → индекс состояния (сцены меняются дискретно, snappy)
  useEffect(() => {
    if (!scrub || !wrapRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate(self) {
        const idx = Math.min(N - 1, Math.floor(self.progress * N));
        if (idxRef.current !== idx) {
          idxRef.current = idx;
          setActive(idx);
        }
      },
    });
    // секция монтируется «Перепечаткой» — высоты страницы уже другие
    ScrollTrigger.refresh();
    return () => st.kill();
  }, [scrub]);

  const goTo = useCallback(
    (i: number) => {
      idxRef.current = i;
      setActive(i);
      if (!scrub || !wrapRef.current) return;
      // докрутка к середине сегмента i
      const wrap = wrapRef.current;
      const top = wrap.getBoundingClientRect().top + window.scrollY;
      const span = wrap.offsetHeight - window.innerHeight;
      const target = top + ((i + 0.5) / N) * span;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { duration: 0.6 });
      else window.scrollTo({ top: target, behavior: "auto" });
    },
    [scrub]
  );

  // смена сцены: snappy-вход (быстрый интерфейс против медленного дрейфа фонов)
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ensureEases();
    const tweens: gsap.core.Tween[] = [];
    if (sceneRef.current) {
      tweens.push(
        gsap.fromTo(
          sceneRef.current,
          { autoAlpha: 0, y: 16, scale: 0.985 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "crelOut" }
        )
      );
    }
    if (panelRef.current) {
      tweens.push(
        gsap.fromTo(panelRef.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "crelOut" })
      );
    }
    return () => tweens.forEach((t) => t.kill());
  }, [active]);

  // фокус остаётся управляемым после смены таба (roving tabindex)
  useEffect(() => {
    if (mounted.current && document.activeElement?.getAttribute("role") === "tab") {
      tabRefs.current[active]?.focus();
    }
  }, [active]);

  const tab = useCases.tabs[active];
  const scene = SCENES[active % SCENES.length];
  const Mockup = MOCKUPS[tab.mockup];

  return (
    <section className="bg-bg">
      {/* локальный рецепт сцены-2: светлая плита с ambient-бликом */}
      <style>{`.scene-bloom { background: radial-gradient(70% 90% at 80% 0%, rgb(0 201 167 / 0.14), rgb(0 201 167 / 0) 65%), var(--color-bg-mist); }`}</style>
      <div ref={wrapRef} className="relative" style={scrub ? { height: WRAP_HEIGHT } : undefined}>
        <div className={scrub ? "sticky top-0 flex h-dvh flex-col justify-center overflow-hidden" : ""}>
          <div className={`mx-auto w-full max-w-[1200px] px-5 md:px-12 ${scrub ? "" : "py-28 md:py-40"}`}>
            <p className="text-label text-pine-600">{useCases.section.label}</p>
            <h2 className="mt-4 max-w-[24ch] text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] font-medium tracking-[-0.015em]">
              {useCases.section.title}
            </h2>

            <div className="mt-8 grid grid-cols-1 items-start gap-10 md:mt-10 md:grid-cols-12">
              {/* левая колонка: табы-навигация + editorial-текст кейса */}
              <div className="md:col-span-5">
                <div
                  role="tablist"
                  aria-label="use cases"
                  aria-orientation="horizontal"
                  onKeyDown={(e) => {
                    const dir =
                      e.key === "ArrowRight" || e.key === "ArrowDown"
                        ? 1
                        : e.key === "ArrowLeft" || e.key === "ArrowUp"
                          ? -1
                          : 0;
                    if (!dir) return;
                    e.preventDefault();
                    goTo((active + dir + N) % N);
                  }}
                  className="flex flex-wrap gap-1.5"
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
                      onClick={() => goTo(i)}
                      className={`group flex items-baseline rounded-(--radius-pill) px-4 py-2 text-[0.875rem] lowercase transition-[background-color,color] duration-(--d-quick) ${
                        i === active
                          ? "bg-ink text-ink-invert"
                          : "bg-ink/[0.05] text-ink-soft hover:bg-ink/[0.09] hover:text-ink"
                      }`}
                    >
                      {t.id}
                      <span
                        aria-hidden
                        className={`text-accent-bright transition-opacity duration-(--d-quick) ${
                          i === active ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        _
                      </span>
                    </button>
                  ))}
                </div>

                <div ref={panelRef} role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`} className="mt-8">
                  <h3 className="max-w-[20ch] text-[clamp(1.5rem,2.5vw,2rem)] font-medium tracking-[-0.01em]">
                    {tab.title}
                  </h3>
                  <p className="mt-4 max-w-[48ch] text-[0.9375rem] leading-relaxed text-ink-soft">{tab.body}</p>
                  {/* чек-строки — ячейки, не хайрлайны (v3.5) */}
                  <div className="mt-6 flex flex-col gap-1.5">
                    {tab.checks.map((c) => (
                      <p key={c} className="rounded-(--radius-s) bg-bg-mist px-4 py-2.5 text-[0.9375rem]">
                        {c}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* правая колонка: сцена — полная смена вселенной на таб */}
              <div className="md:col-span-7">
                <div
                  ref={sceneRef}
                  key={tab.id}
                  className={`relative flex items-center justify-center overflow-hidden rounded-(--radius-2xl) p-8 md:p-12 ${scene.plate} h-[420px] md:h-[min(520px,60vh)]`}
                >
                  <div className="w-full max-w-[380px]">
                    <MockupStage key={tab.id}>
                      <Mockup />
                    </MockupStage>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
