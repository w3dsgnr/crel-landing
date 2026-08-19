"use client";

// Hero-каркас (композиция 2026-08-19, двухколоночная): слева текстовая колонка —
// команда-display + таб-переключатель services | platform + смысловой h1 + CTA;
// справа — сцена прибора ветки (ramp-стекло / кодовый терминал), вокруг
// которого в нахлёст стоят четыре парящих мини-интерфейса (две пары: верхняя
// справа, нижняя слева; одна плашка пары за прибором, вторая — перед ним).
// Ниже lg — одна колонка: текст, под ним окно прибора, плашек нет.
// SSG отдаёт полный текст команды — на загрузке ничего не перепечатывается
// (LCP, CLS=0).
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import { gsap } from "gsap";
import { hero, heroBranches } from "@/content/shared";
import type { LandingState } from "@/content/types";
import { ensureEases } from "@/lib/easing";
import { scrollToBranch } from "@/lib/scrollToBranch";
import { RampWidgetGlass } from "@/components/mockups/RampWidgetGlass";
import { HeroCodeTerminal } from "@/components/mockups/HeroCodeTerminal";
import {
  HeroFloatLeftA,
  HeroFloatLeftB,
  HeroFloatRightA,
  HeroFloatRightB,
} from "@/components/mockups/HeroFloats";
import { CursorGrid } from "@/components/vendor/CursorGrid";

interface HeroProps {
  /** ветка оркестратора; hero держит свой таб (useState) и этот проп не читает */
  selected: LandingState | null;
  argRef: RefObject<HTMLSpanElement | null>;
  cursorRef: RefObject<HTMLSpanElement | null>;
  /** обёртка таб+h1 — GSAP-вход при загрузке (оркестратор) */
  subWrapRef: RefObject<HTMLDivElement | null>;
}

const BRANCHES: LandingState[] = ["services", "platform"];
const SWAP_MS = 200;

// CTA — белая пилюля на чёрной плоскости (словарь инвертированного CTA шапки:
// bg-ink в .layer-v4-invert = светлый, текст — ink-invert). Раньше CTA лежала
// поверх прибора и была тёмным стеклом (SpecularButton); в двухколоночной
// композиции она стоит в потоке текстовой колонки, стекло не нужно.
// Отклик — подъём на 1px и плотность, без glow.
function Cta({ label, onClick }: { label: string; onClick: () => void }) {
  const text = label.endsWith("_") ? label.slice(0, -1) : label;
  const hasCursor = label.endsWith("_");
  return (
    // не якорь: CTA доводит скролл к развилке (scrollToBranch, Lenis).
    // cursor-pointer — компенсация preflight Tailwind v4: у <button> его нет.
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex h-12 cursor-pointer items-baseline rounded-(--radius-pill) bg-ink px-7 text-[0.8125rem] leading-[3rem] lowercase tracking-[0.08em] text-ink-invert shadow-[0_8px_24px_rgb(0_0_0/0.35)] transition-[box-shadow,transform,background-color] duration-(--d-quick) hover:-translate-y-px hover:bg-ink/90 hover:shadow-[0_12px_28px_rgb(0_0_0/0.4)]"
    >
      {text}
      {hasCursor && (
        <span
          aria-hidden
          className="text-accent opacity-0 transition-opacity duration-(--d-quick) group-hover:opacity-100"
        >
          _
        </span>
      )}
    </button>
  );
}

// Сегмент-пилюля (референс Arlo «Messages / Slack»): две равные ячейки,
// индикатор — один скользящий transform. Доступность: tablist/tab, стрелки ← →.
function BranchTabs({
  value,
  onChange,
}: {
  value: LandingState;
  onChange: (b: LandingState) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = BRANCHES.indexOf(value);
    const next = BRANCHES[(i + (e.key === "ArrowRight" ? 1 : BRANCHES.length - 1)) % BRANCHES.length];
    onChange(next);
    refs.current[BRANCHES.indexOf(next)]?.focus();
  };
  const idx = BRANCHES.indexOf(value);
  return (
    <div
      role="tablist"
      aria-label="what crel does"
      onKeyDown={onKeyDown}
      // backdrop-blur: капсула лежит на cursor-grid — без блюра линии решётки
      // проходят сквозь невыделенную ячейку резкими; сам узел статичен, движется
      // только индикатор внутри (правило «не анимировать узлы с backdrop-filter»)
      className="relative grid grid-cols-2 rounded-(--radius-pill) border border-line bg-ink/[0.05] p-1 backdrop-blur-md"
    >
      {/* индикатор: ширина ячейки, ход — translateX на 100% своей ширины */}
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-(--radius-pill) bg-ink transition-transform duration-200 ease-(--ease-out-expo) motion-reduce:transition-none"
        style={{ transform: `translateX(${idx * 100}%)` }}
      />
      {BRANCHES.map((b, i) => {
        const on = b === value;
        return (
          <button
            key={b}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`hero-tab-${b}`}
            aria-selected={on}
            aria-controls="hero-panel"
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(b)}
            className={`relative z-10 min-w-[7.5rem] cursor-pointer rounded-(--radius-pill) px-5 py-2 text-[0.8125rem] lowercase tracking-[0.08em] transition-colors duration-200 ${
              on ? "text-ink-invert" : "text-ink-soft hover:text-ink"
            }`}
          >
            {heroBranches[b].tab}
          </button>
        );
      })}
    </div>
  );
}

// фазы crossfade: out — старое уходит (opacity+6px, 200ms), pre — новое стоит в
// стартовой позе без транзишена (один кадр), in — новое доезжает
type SwapPhase = "in" | "out" | "pre";

export function Hero({ argRef, cursorRef, subWrapRef }: HeroProps) {
  const entered = useRef(false);
  // CTA стоит вне subWrap (в потоке под подзаголовком) — входит вместе с ним, последней
  const ctaRef = useRef<HTMLDivElement>(null);
  // дефолт services (первый таб, правка 2026-08-19); состояние только здесь, без URL
  const [branch, setBranch] = useState<LandingState>("services");
  const [phase, setPhase] = useState<SwapPhase>("in");
  const pending = useRef<LandingState | null>(null);
  const timers = useRef<number[]>([]);

  const switchTo = useCallback(
    (next: LandingState) => {
      if (next === branch && !pending.current) return;
      pending.current = next;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      // reduced-motion: мгновенная смена, без фаз
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setBranch(next);
        pending.current = null;
        return;
      }
      setPhase("out");
      timers.current.push(
        window.setTimeout(() => {
          const target = pending.current ?? next;
          pending.current = null;
          setBranch(target);
          setPhase("pre");
          // два rAF: React применил разметку → стартовая поза вычислена → in
          requestAnimationFrame(() => requestAnimationFrame(() => setPhase("in")));
        }, SWAP_MS)
      );
    },
    [branch]
  );

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // Вход при загрузке: подзаголовок, таб и CTA (fade + rise), команда статична.
  useEffect(() => {
    if (entered.current) return;
    entered.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ensureEases();
    const items = subWrapRef.current?.children;
    if (!items) return;
    // порядок stagger — сверху вниз: таб → h1 → CTA
    const targets = [...Array.from(items), ...(ctaRef.current ? [ctaRef.current] : [])];
    gsap.from(targets, {
      y: 12,
      autoAlpha: 0,
      duration: 0.4,
      ease: "crelOut",
      stagger: 0.06,
      clearProps: "all",
    });
  }, [subWrapRef]);

  const copy = heroBranches[branch];
  // классы crossfade для текста и прибора: одна кривая, один ход
  const swapCls =
    phase === "in"
      ? "opacity-100 translate-y-0 transition-[opacity,transform] duration-200 ease-out"
      : phase === "out"
        ? "opacity-0 translate-y-1.5 transition-[opacity,transform] duration-200 ease-out"
        : "opacity-0 translate-y-1.5 transition-none";


  // прибор ветки: services → ramp-виджет (готовый продукт, который команда
  // ставит клиенту), platform → терминал (white label API — код); решение
  // 2026-08-18. key по ветке: терминал монтируется заново и печатает код при
  // каждом показе
  const device =
    branch === "services" ? (
      <div className="mx-auto max-w-[300px] md:max-w-[360px]">
        <RampWidgetGlass key="services" />
      </div>
    ) : (
      <HeroCodeTerminal key="platform" />
    );

  return (
    // Двухколоночная композиция (2026-08-19): текст слева, сцена прибора справа.
    // Фон — cursor-grid во всю ширину секции (серебро --grid).
    // Анатомия Krida: чёрная секция (layer-v4-invert) «лежит» поверх серой ленты
    // логотипов — z-10 над ней, нижние углы скруглены (--v4-radius-hero),
    // overflow режет cursor-grid по радиусу и выступающие плашки по краям.
    <section className="layer-v4 layer-v4-invert relative isolate z-10 overflow-hidden rounded-b-(--v4-radius-hero) bg-bg">
      <CursorGrid />
      {/* Сетка: до lg — одна колонка (текст, под ним окно прибора), с lg — две:
          47/53, текст центрируется по вертикали напротив сцены. pt считает
          клиренс плавающей стеклянной капсулы (fixed, ~76px). min-h 82dvh:
          hero почти на весь первый экран, лого-полоса выглядывает снизу (Krida). */}
      <div className="relative mx-auto grid min-h-[82dvh] w-full max-w-[1200px] grid-rows-[1fr_auto] px-5 pt-24 md:px-12 md:pt-28 lg:grid-cols-[minmax(0,47fr)_minmax(0,53fr)] lg:grid-rows-none lg:items-center lg:gap-x-8 lg:pb-16">
        {/* ── текстовая колонка ── */}
        <div className="flex flex-col items-start justify-center text-left">
          {/* декоративная команда; смысл несёт h1 ниже; курсор — акцент «живого» */}
          <div aria-hidden className="text-display text-display-hero select-none">
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
          {/* обёртка входа: таб → h1 (порядок композиции 2026-08-19: таб сразу
              под командой, подзаголовок — под табом) */}
          <div ref={subWrapRef} className="mt-8 flex flex-col items-start md:mt-10">
            <BranchTabs value={branch} onChange={switchTo} />
            {/* h1 — узел crossfade: меняется вместе с веткой. Высота блока
                зарезервирована под самый длинный подзаголовок: обе строки лежат
                в одной grid-ячейке, неактивная невидима (visibility) — иначе
                подзаголовки разной длины меняли бы высоту, и CTA с прибором
                прыгали бы при каждом переключении. */}
            <div className="mt-8 grid justify-items-start *:col-start-1 *:row-start-1">
              {BRANCHES.map((b) => {
                const on = b === branch;
                // активная — h1 (единственный на странице), запасная — p-призрак
                const Tag = on ? "h1" : "p";
                return (
                  <Tag
                    key={b}
                    aria-hidden={!on || undefined}
                    className={`max-w-[46ch] text-[1.0625rem] leading-relaxed font-normal text-ink-soft ${
                      on ? swapCls : "invisible"
                    }`}
                  >
                    {heroBranches[b].subtitle}
                  </Tag>
                );
              })}
            </div>
          </div>
          {/* CTA — в потоке под подзаголовком. Внешняя обёртка — вход при
              загрузке (ctaRef), внутренняя — crossfade лейбла по ветке (тот же
              swapCls, что у h1 и прибора). */}
          <div ref={ctaRef} className="mt-10 md:mt-12">
            <div className={swapCls}>
              <Cta label={copy.cta} onClick={() => scrollToBranch(branch)} />
            </div>
          </div>
        </div>

        {/* ── сцена прибора ──
            Прибор стоит в потоке (ширина слота 540: терминал занимает его
            целиком, ramp центрируется своей max-w 300/360 внутри); плашки —
            абсолютно вокруг него, в паддинги сцены (pt/pb на lg — их
            выступ сверху и снизу). Ниже lg плашек нет, окно прибора фиксированной
            высоты 220 с overflow-hidden — низ уходит за срез секции («телефон»).
            Слои: плашка-«задник» пары z-0 → прибор z-10 → плашка-«передник»
            z-20; обёртка пары без z-index, чтобы слоты участвовали в контексте
            секции (isolate), а не в своём. */}
        <div className="relative mx-auto mt-12 w-full max-w-[540px] md:mt-16 lg:mx-0 lg:ml-auto lg:mt-0 lg:pt-[96px] lg:pb-[128px]">
          <div
            id="hero-panel"
            role="tabpanel"
            aria-labelledby={`hero-tab-${branch}`}
            className={`relative z-10 h-[220px] overflow-hidden lg:h-auto lg:overflow-visible ${swapCls}`}
          >
            {device}
          </div>

          {/* Верхняя пара, справа: квиток «Order settled» (задник, наезжает на
              верхний правый угол прибора) и код-панель API (передник, правее и
              ниже, поверх прибора). Стопка (.hf-pair/.hf-slot, globals.css):
              B наезжает на A, по наведению на любую пара разъезжается, наведённая
              всплывает. Обёртки pointer-events-none, плашка возвращает себе
              pointer-events сама (.hero-float). */}
          <div
            aria-hidden
            className="hf-pair pointer-events-none absolute top-0 right-[-24px] hidden flex-col items-start lg:flex xl:right-[-72px]"
          >
            <div className="hf-slot hf-slot-a z-0 rotate-2">
              <HeroFloatRightA />
            </div>
            <div className="hf-slot hf-slot-b z-20 -mt-9 ml-[88px] rotate-[1.5deg] xl:ml-[112px]">
              <HeroFloatRightB />
            </div>
          </div>
          {/* Нижняя пара, слева: строка виртуального счёта (задник, под левым
              нижним углом прибора) и KYC-островок (передник, правее и ниже,
              поверх прибора) */}
          <div
            aria-hidden
            className="hf-pair pointer-events-none absolute bottom-0 left-[-200px] hidden flex-col items-start lg:flex"
          >
            <div className="hf-slot hf-slot-a z-0 -rotate-[2.5deg]">
              <HeroFloatLeftB />
            </div>
            <div className="hf-slot hf-slot-b z-20 -mt-12 ml-[70px] -rotate-1">
              <HeroFloatLeftA />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
