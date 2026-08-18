"use client";

// Hero-каркас: по центру команда-display + смысловой h1 + таб-переключатель
// platform | services, под ними — прибор ветки (ramp-стекло / кодовый терминал),
// CTA лежит поверх прибора у нижнего среза секции, по бокам парящие приборы.
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
import { SpecularButton } from "@/components/vendor/SpecularButton";

interface HeroProps {
  /** ветка оркестратора; hero держит свой таб (useState) и этот проп не читает */
  selected: LandingState | null;
  argRef: RefObject<HTMLSpanElement | null>;
  cursorRef: RefObject<HTMLSpanElement | null>;
  /** обёртка h1+таб — GSAP-вход при загрузке (оркестратор) */
  subWrapRef: RefObject<HTMLDivElement | null>;
}

const BRANCHES: LandingState[] = ["platform", "services"];
const SWAP_MS = 200;

// CTA лежит поверх прибора: под ней то светлое ramp-стекло, то тёмный терминал.
// Одна версия на оба фона — тёмное стекло SpecularButton (порт React Bits):
// корпус #0a0a0a на 0.82 + blur, статичная кромка white/.22 и спекулярный блик
// по кромке, смотрящий на курсор и проявляющийся ближе 260px. На светлом
// ramp-стекле кнопку держат тень и плотность корпуса, на тёмном терминале —
// кромка и блик. Тень на hover не становится glow, отклик — подъём на 1px.
function Cta({ label, onClick }: { label: string; onClick: () => void }) {
  const text = label.endsWith("_") ? label.slice(0, -1) : label;
  const hasCursor = label.endsWith("_");
  return (
    // не якорь: CTA доводит скролл к развилке (scrollToBranch, Lenis).
    // cursor-pointer — компенсация preflight Tailwind v4: у <button> его нет.
    <SpecularButton
      onClick={onClick}
      tint="#0a0a0a"
      tintOpacity={0.82}
      blur={16}
      textColor="#ffffff"
      baseColor="rgb(255 255 255 / 0.22)"
      lineColor="#ffffff"
      thickness={1}
      proximity={260}
      className="group inline-flex cursor-pointer items-baseline px-7 py-3.5 text-[0.8125rem] lowercase tracking-[0.08em] shadow-[0_8px_24px_rgb(0_0_0/0.35)] transition-[box-shadow,transform] duration-(--d-quick) hover:-translate-y-px hover:shadow-[0_12px_28px_rgb(0_0_0/0.4)]"
    >
      {text}
      {hasCursor && (
        <span
          aria-hidden
          className="text-accent-bright opacity-0 transition-opacity duration-(--d-quick) group-hover:opacity-100"
        >
          _
        </span>
      )}
    </SpecularButton>
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
  // CTA стоит вне subWrap (абсолют у низа секции) — входит вместе с ним, последней
  const ctaRef = useRef<HTMLDivElement>(null);
  // дефолт platform; состояние только здесь, без URL
  const [branch, setBranch] = useState<LandingState>("platform");
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
    // порядок stagger — сверху вниз: h1 → таб → CTA у низа
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

  return (
    // Центрированная композиция (редизайн 2026-08-18, референс Arlo): текстовая
    // колонка стоит по центру секции, прибор ветки — под ней «телефоном», уходит
    // под нижний срез; по бокам на средней высоте парят мини-интерфейсы.
    // Фон — cursor-grid во всю ширину секции (серебро --grid).
    // Анатомия Krida: чёрная секция (layer-v4-invert) «лежит» поверх серой ленты
    // логотипов — z-10 над ней, нижние углы скруглены (--v4-radius-hero),
    // overflow режет cursor-grid по радиусу и низ прибора по срезу секции.
    <section className="layer-v4 layer-v4-invert relative isolate z-10 overflow-hidden rounded-b-(--v4-radius-hero) bg-bg">
      <CursorGrid />
      {/* Боковые парящие приборы, по две с каждой стороны (референс Arlo): верхние
          (A) ближе к краю и выше, нижние (B) — ближе к центру и ниже, с лёгкой
          асимметрией слева/справа и разными наклонами. Нижние чуть меньше и
          прозрачнее — второй план. Горизонталь привязана к центру секции
          (clamp: не ближе 16px к краю, не дальше 5% от него): до ~1440 плашки
          прижаты к краям и не наезжают на h1 (52ch) и слот прибора (540),
          на широких экранах держат воздух до подзаголовка (правка 2026-08-18:
          были 12% — на 1900+ стояли вплотную к тексту). Вертикаль — процент высоты секции:
          Ниже lg их нет — тексту нужна вся ширина.
          Стопка (правка 2026-08-18): пара — один блок (.hf-pair), B стоит в потоке
          под A и наезжает на неё отрицательным margin (~24px): перекрытие
          фиксированное и не плавает с высотой вьюпорта, как плавало с процентами.
          B закрывает срез рабочей строки A (у KYC — «decision», у квитка — низ
          суммы) — стопка читается как стопка. По наведению на любую из двух
          пара разъезжается (.hf-slot в globals.css), наведённая всплывает выше. */}
      <div
        aria-hidden
        className="hf-pair pointer-events-none absolute top-[38%] left-[clamp(16px,calc(50%_-_700px),5%)] z-10 hidden -translate-y-1/2 flex-col items-start lg:flex"
      >
        <div className="hf-slot hf-slot-a -rotate-[2.5deg]">
          <HeroFloatLeftA />
        </div>
        <div className="hf-slot hf-slot-b -mt-6 ml-10 scale-[0.94] -rotate-1">
          <HeroFloatLeftB />
        </div>
      </div>
      <div
        aria-hidden
        className="hf-pair pointer-events-none absolute top-[54%] right-[clamp(16px,calc(50%_-_690px),5%)] z-10 hidden -translate-y-1/2 flex-col items-end lg:flex"
      >
        <div className="hf-slot hf-slot-a rotate-2">
          <HeroFloatRightA />
        </div>
        <div className="hf-slot hf-slot-b -mt-6 mr-10 scale-[0.94] rotate-[1.5deg]">
          <HeroFloatRightB />
        </div>
      </div>
      {/* Сетка: две строки — [1fr] текст (центрируется в свободной высоте) и [auto]
          окно прибора фиксированной высоты. pt считает клиренс плавающей стеклянной
          капсулы (fixed, ~76px). 82dvh: hero почти на весь первый экран, лого-полоса
          выглядывает снизу (Krida). */}
      <div className="relative mx-auto grid min-h-[82dvh] w-full max-w-[1200px] grid-rows-[1fr_auto] px-5 pt-24 md:px-12 md:pt-28">
        <div className="flex flex-col items-center justify-center text-center">
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
          <div ref={subWrapRef} className="mt-7 flex flex-col items-center md:mt-8">
            {/* h1 — узел crossfade: меняется вместе с веткой. Высота блока
                зарезервирована под самый длинный подзаголовок: обе строки лежат
                в одной grid-ячейке, неактивная невидима (visibility) — иначе на
                мобиле подзаголовки разной длины меняли бы высоту, и таб с
                прибором прыгали бы при каждом переключении. */}
            <div className="grid justify-items-center *:col-start-1 *:row-start-1">
              {BRANCHES.map((b) => {
                const on = b === branch;
                // активная — h1 (единственный на странице), запасная — p-призрак
                const Tag = on ? "h1" : "p";
                return (
                  <Tag
                    key={b}
                    aria-hidden={!on || undefined}
                    className={`max-w-[52ch] text-[1.0625rem] leading-relaxed font-normal text-ink-soft ${
                      on ? swapCls : "invisible"
                    }`}
                  >
                    {heroBranches[b].subtitle}
                  </Tag>
                );
              })}
            </div>
            {/* таб — сразу под h1, на месте бывшей CTA */}
            <div className="mt-8">
              <BranchTabs value={branch} onChange={switchTo} />
            </div>
          </div>
        </div>
        {/* Окно прибора: высота фиксирована и меньше самого прибора — низ выходит
            за секцию и режется её overflow-hidden (телефон в референсе); высота
            слота от ветки не зависит — срез не прыгает. Слот шириной 540: терминал
            занимает его целиком (коду нужна строка), ramp центрируется своей
            max-w 300/360 внутри. На мобиле — вся ширина минус паддинги, длинные
            строки кода режет overflow-hidden терминала. Отступ от таба 48/64px.
            key по ветке: терминал монтируется заново и печатает код при каждом
            показе. */}
        <div
          id="hero-panel"
          role="tabpanel"
          aria-labelledby={`hero-tab-${branch}`}
          className={`mx-auto mt-12 h-[220px] w-full max-w-[540px] overflow-hidden md:mt-16 md:h-[280px] ${swapCls}`}
        >
          {/* platform → терминал (white label API — код), services → ramp-виджет
              (готовый продукт, который команда ставит клиенту); решение 2026-08-18 */}
          {branch === "platform" ? (
            <HeroCodeTerminal key="platform" />
          ) : (
            <div className="mx-auto max-w-[300px] md:max-w-[360px]">
              <RampWidgetGlass key="services" />
            </div>
          )}
        </div>
      </div>
      {/* CTA — поверх прибора у нижнего среза (bottom 52px), по центру; z выше слота.
          Внешняя обёртка — позиция и вход при загрузке (ctaRef), внутренняя —
          crossfade лейбла по ветке (тот же swapCls, что у h1 и прибора). */}
      <div ref={ctaRef} className="absolute bottom-[52px] left-1/2 z-20 -translate-x-1/2">
        <div className={swapCls}>
          <Cta label={copy.cta} onClick={() => scrollToBranch(branch)} />
        </div>
      </div>
    </section>
  );
}
