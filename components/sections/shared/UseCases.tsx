"use client";

// 03: use cases — «scroll stack» (колода) по docs/refs/usecases-stack/design.md:
// чёрная сцена (layer-v4-invert), N синих непрозрачных карт почти квадратной
// вертикальной ориентации, без картинок. Стартовый кадр: слот кучи ПУСТ, вся
// колода сложена стопкой у нижнего края сцены — видны шапки-названия всех карт
// (контракт «названия вместо чипсов», чипсы-табы удалены). По скроллу карта k
// выезжает из стопки вверх и ложится В КУЧУ поверх предыдущих: позиция у кучи
// одна, но у каждой карты свой наклон (ROT) — края нижних выглядывают из-под
// верхней, как в физической колоде (реф React Bits, кадры 2-3). Механика
// Wembi-скраба сохранена (pinned sticky без pin-spacer — дружит с Lenis и
// «Перепечаткой»); прогресс-модель — N переездов: t = progress·N, сегмент k —
// полёт карты k. Клик по шапке докручивает Lenis к прогрессу (i+1)/N;
// mobile / reduced-motion — нативная CSS-sticky стопка без GSAP.
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCases } from "@/content/platform";
import { ensureEases } from "@/lib/easing";
import { CursorGrid } from "@/components/vendor/CursorGrid";
import { getLenis } from "@/lib/lenis";

const N = useCases.tabs.length;
// длина скраба: N переездов по ~90vh + экран
const WRAP_HEIGHT = `${N * 90 + 100}vh`;
// видимая шапка сложенной карты (desktop-сцена); = высоте кнопки-шапки (h-12)
const PEEK = 48;
// наклоны карт в куче (реф 2-3): детерминированные «случайные» ±°, чтобы края
// нижних карт выглядывали из-под верхней; в стопке и в полёте до кучи — ровные
const ROT = [-4, 3, -2.5, 4.5, -3.5];
// заголовок: разрыв на две строки на desktop — перед этим словом
const TITLE_BREAK_BEFORE = "that";
// mobile-куча: единая sticky-точка (зазор под плавающую шапку сайта)
const STICKY_TOP = 96;
// вертикальный отступ между обёртками mobile-стопки (участвует в расчёте goTo)
const GAP_M = 24;

// оболочка карты: только непрозрачная заливка (перекрытие и есть глубина —
// полупрозрачный синий разрушил бы колоду, см. Don'ts design.md).
// Позиция задаётся веткой рендера (absolute в сцене / relative в sticky-стопке):
// два позиционных класса на одном узле конфликтуют в каскаде Tailwind
const CARD_CLASS = "flex flex-col overflow-hidden rounded-[28px] bg-[#2E7CF6] p-7 text-white md:p-8";
// мягкая тень по контуру: отделяет синюю карту от синей под ней — в куче с
// наклонами края нижних карт должны читаться; других теней нет (design.md §2.5)
const CARD_SHADOW = "0 10px 30px rgb(0 0 0 / 0.35)";
// виньетка заливки: свет из центра, тёмные кромки. Не украшение, а контраст —
// мелкий текст живёт у верхней (лейбл) и нижней (лид, чеки) кромок, где фон
// #2668D9 даёт белому 5.17:1 (AA); чистый #2E7CF6 давал бы 3.94:1
const CARD_BG = "linear-gradient(180deg, #2668D9 0%, #2E7CF6 46%, #2668D9 100%)";

// словарь линейных глифов 40px: чертёжная геометрия штрихом 1.5, метка кейса,
// не иллюстрация (design.md §3.2); ключи = id кейсов из content/platform
const ICONS: Record<string, ReactNode> = {
  // скруглённый прямоугольник + точка внутри
  wallets: (
    <>
      <rect x="6.75" y="10.75" width="26.5" height="18.5" rx="5" />
      <circle cx="26.5" cy="20" r="2.25" />
    </>
  ),
  // две встречные стрелки: вправо-верх и влево-низ
  exchanges: (
    <>
      <path d="M8 14h23.5M26 8.5l5.5 5.5L26 19.5" />
      <path d="M32 26H8.5M14 20.5 8.5 26l5.5 5.5" />
    </>
  ),
  // окружность с горизонтальной хордой
  neobanks: (
    <>
      <circle cx="20" cy="20" r="13.25" />
      <path d="M8.5 24h23" />
    </>
  ),
  // длинная стрелка сквозь две вертикальные засечки (коридор)
  remittances: (
    <>
      <path d="M4.5 20h29M28 14.5l5.5 5.5-5.5 5.5" />
      <path d="M13.5 13.5v13M22.5 13.5v13" />
    </>
  ),
  // три горизонтальные линии убывающей длины (ведомость)
  payrolls: <path d="M8 13.5h24M8 20h16.5M8 26.5h10" />,
};

export function UseCases() {
  const [active, setActive] = useState(0);
  const [scrub, setScrub] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // контейнер стопки: сцена колоды в scrub-режиме, sticky-список в фолбэке
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const idxRef = useRef(0);
  const mounted = useRef(false);

  // pinned-скраб только desktop + no-reduced-motion; иначе — sticky-стопка
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const apply = () => setScrub(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // split-text заголовка (приём React Bits SplitText): посимвольный подъём
  // из-под базовой линии со stagger'ом, один раз при входе в вьюпорт.
  // IntersectionObserver вместо ScrollTrigger: заголовок живёт внутри
  // pinned-sticky, а IO меряет честное пересечение с вьюпортом в обоих режимах
  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ensureEases();
    const chars = el.querySelectorAll<HTMLElement>("[data-char]");
    if (!chars.length) return;
    gsap.set(chars, { y: "0.7em", autoAlpha: 0 });
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        tween = gsap.to(chars, { y: 0, autoAlpha: 1, duration: 0.7, ease: "crelOut", stagger: 0.02 });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      gsap.set(chars, { clearProps: "all" });
    };
  }, [scrub]);

  // скраб: прогресс обёртки → t∈[0..N] → позиции карт колоды (N переездов).
  // Стартовый кадр: слот кучи ПУСТ, все карты сложены стопкой у нижнего края
  // (видны названия всех пяти). Сегмент k — карта k выезжает из стопки вверх
  // и ложится В КУЧУ: одна позиция для всех приехавших, но у каждой свой
  // наклон — края нижних карт выглядывают из-под верхней (реф 2-3).
  // Все расчёты в px от фактической высоты сцены (offsetHeight + ResizeObserver),
  // позиции ставятся quickSetter'ами мимо React-state — state держит только
  // дискретный activeIdx для aria/фокуса
  useEffect(() => {
    if (!scrub || !wrapRef.current || !stackRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const stage = stackRef.current;
    const cards = cardRefs.current.slice(0, N).filter((el): el is HTMLDivElement => el !== null);
    if (cards.length !== N) return;
    const setters = cards.map((el) => ({
      y: gsap.quickSetter(el, "y", "px"),
      rot: gsap.quickSetter(el, "rotation", "deg"),
    }));

    let stageH = stage.offsetHeight;

    let t = 0;
    const render = () => {
      // якорь колоды — НИЖНЯЯ КРОМКА ЭКРАНА, а не низ сцены: на высоких
      // вьюпортах (2K/4K) низ сцены — середина экрана, и контент нижних карт
      // раскрывался бы; приклеиваем стопку к краю вьюпорта — видны только
      // шапки, тела карт живут за кромкой (их режет overflow-hidden pinned-
      // экрана). Пока сцена ещё въезжает в кадр (низ сцены ниже кромки) —
      // фолбэк на низ сцены: max() переключает якоря непрерывно, без прыжка
      const anchor = Math.max(stageH, window.innerHeight - stage.getBoundingClientRect().top);
      for (let k = 0; k < N; k++) {
        const bottom = anchor - (N - k) * PEEK;
        // фаза переезда карты k: 0 — в стопке, 1 — легла в кучу
        const f = Math.min(1, Math.max(0, t - k));
        setters[k].y(bottom * (1 - f));
        // наклон набирается по ходу полёта: в стопке карты ровные
        setters[k].rot(ROT[k % ROT.length] * f);
      }
    };

    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate(self) {
        t = self.progress * N;
        render();
        // активная = верхняя карта кучи (или летящая); до первого переезда — 0
        const idx = Math.min(N - 1, Math.max(0, Math.ceil(t) - 1));
        if (idxRef.current !== idx) {
          idxRef.current = idx;
          setActive(idx);
        }
      },
    });
    // якорь зависит от позиции сцены во вьюпорте — обновляем каждый скролл
    // (до пиннинга прогресс стоит на 0 и onUpdate молчит), listener пассивный
    const onScroll = () => render();
    window.addEventListener("scroll", onScroll, { passive: true });
    // высота сцены зависит от vh — на ресайзе пересчитываем и перерисовываем кадр
    const ro = new ResizeObserver(() => {
      stageH = stage.offsetHeight;
      render();
    });
    ro.observe(stage);
    // секция монтируется «Перепечаткой» — высоты страницы уже другие
    ScrollTrigger.refresh();
    t = st.progress * N;
    render();
    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      st.kill();
      gsap.set(cards, { clearProps: "transform" });
    };
  }, [scrub]);

  const goTo = useCallback(
    (i: number) => {
      idxRef.current = i;
      setActive(i);
      const lenis = getLenis();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (scrub && wrapRef.current) {
        // докрутка к прогрессу (i+1)/N: карта i только что легла в кучу
        const wrap = wrapRef.current;
        const top = wrap.getBoundingClientRect().top + window.scrollY;
        const span = wrap.offsetHeight - window.innerHeight;
        const target = top + ((i + 1) / N) * span;
        if (lenis) lenis.scrollTo(target, { duration: 0.6 });
        else window.scrollTo({ top: target, behavior: "auto" });
        return;
      }
      // фолбэк: flow-позицию липкой обёртки считаем суммой высот предыдущих
      // (offsetTop прилипшей обёртки недостоверен), целимся в её sticky-offset
      const list = stackRef.current;
      if (!list || !cardRefs.current[i]) return;
      let y = list.getBoundingClientRect().top + window.scrollY;
      for (let k = 0; k < i; k++) y += (cardRefs.current[k]?.offsetHeight ?? 0) + GAP_M;
      const target = y - STICKY_TOP;
      if (lenis) lenis.scrollTo(target, reduce ? { immediate: true } : { duration: 0.6 });
      else window.scrollTo({ top: target, behavior: "auto" });
    },
    [scrub]
  );

  // фокус остаётся управляемым после смены карты (roving tabindex)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (document.activeElement?.getAttribute("role") === "tab") {
      tabRefs.current[active]?.focus();
    }
  }, [active]);

  const onTablistKeys = (e: KeyboardEvent) => {
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!dir) return;
    e.preventDefault();
    goTo((active + dir + N) % N);
  };

  // заголовок секции, разбитый на посимвольные спаны для split-text; на desktop
  // рвётся на две строки перед TITLE_BREAK_BEFORE (х2-масштаб живёт в слоте кучи,
  // и карты постепенно перекрывают текст). Спаны aria-hidden, читается aria-label
  const renderHeading = (cls: string) => {
    const words = useCases.section.title.split(" ");
    return (
      <h2 ref={headingRef} aria-label={useCases.section.title} className={cls}>
        {words.map((w, wi) => (
          <span key={wi} aria-hidden>
            {w === TITLE_BREAK_BEFORE && <br className="hidden md:block" />}
            <span className="inline-block whitespace-pre">
              {[...w].map((c, ci) => (
                <span key={ci} data-char className="inline-block will-change-transform">
                  {c}
                </span>
              ))}
              {wi < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </h2>
    );
  };

  // содержимое карты — одинаковое в обоих режимах: шапка-таб (= видимый peek),
  // сверху глиф с заголовком, снизу раскрывающий блок «тезисы → лид»; между
  // ними — воздух (анатомия референса; декоративная окружность-outline убрана)
  const renderCard = (t: (typeof useCases.tabs)[number], i: number) => (
    <>
      {/* шапка втянута отрицательным margin в верхний padding: видимые 56px
          перекрытой карты — ровно строка названия; aria-контракт табов сохранён */}
      <button
        ref={(el) => {
          tabRefs.current[i] = el;
        }}
        role="tab"
        id={`tab-${t.id}`}
        aria-selected={i === active}
        aria-controls={`panel-${t.id}`}
        tabIndex={i === active ? 0 : -1}
        onClick={() => goTo(i)}
        className="-mx-7 -mt-7 flex h-12 shrink-0 items-center px-7 text-left text-[0.8125rem] font-medium tracking-[0.14em] uppercase focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white md:-mx-8 md:-mt-8 md:px-8"
      >
        {t.id}
      </button>

      {/* тело карты = tabpanel; все панели в DOM видимы — допустимо для стека */}
      <div
        role="tabpanel"
        id={`panel-${t.id}`}
        aria-labelledby={`tab-${t.id}`}
        className="flex min-h-0 flex-1 flex-col"
      >
        <svg
          viewBox="0 0 40 40"
          className="mt-5 h-12 w-12 text-white/85"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {ICONS[t.id]}
        </svg>

        <h3 className="mt-5 text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.08] font-medium tracking-[-0.015em]">
          {t.title}
        </h3>

        {/* mt-auto здесь и есть «негативное пространство»: заголовок остаётся у
            глифа, раскрывающий блок прижат к нижней кромке, воздух между ними
            растягивается по остатку высоты карты */}
        <div className="mt-auto pt-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-[0.8125rem] text-white/90 sm:grid-cols-2">
            {t.checks.map((c) => (
              <p key={c}>
                <span aria-hidden className="mr-1.5">
                  _
                </span>
                {c}
              </p>
            ))}
          </div>
          {/* лид чисто-белый: white/78 на #2E7CF6 не проходит AA (design.md) */}
          <p className="mt-4 text-[1rem] leading-[1.55] text-white">{t.body}</p>
        </div>
      </div>
    </>
  );

  return (
    <section className="layer-v4 layer-v4-invert bg-bg">
      <div ref={wrapRef} className="relative" style={scrub ? { height: WRAP_HEIGHT } : undefined}>
        {/* pt под плавающую шапку-капсулу (~104px): сцена центрируется в остатке;
            бюджет 900px-вьюпорта держат vh-капы высоты карты */}
        <div
          className={
            scrub ? "sticky top-0 flex h-dvh flex-col justify-center overflow-hidden pt-[96px] md:pt-[104px]" : ""
          }
        >
          {/* cursor-grid как в hero (правка 2026-08-19): на чёрной сцене клетки
              вспыхивают под курсором. Лежит в sticky-окне — canvas ровно на
              видимый экран, события снимает с этого же контейнера; только в
              scrub-режиме (на мобиле курсора нет, reduced-motion слой сам
              отключает) */}
          {scrub && <CursorGrid />}
          <div className={`mx-auto w-full max-w-[1200px] px-5 md:px-12 ${scrub ? "" : "py-28 md:py-40"}`}>
            {/* mobile / фолбэк: заголовок обычным потоком над стопкой
                (лейбл «03: use cases» удалён по решению design.md) */}
            {!scrub &&
              renderHeading(
                "mx-auto max-w-[30ch] text-center text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] font-medium tracking-[-0.02em]"
              )}

            {scrub ? (
              /* сцена колоды: высота = карта + (N−1)·peek — при p=0 нижняя
                 стопка шапок помещается под активной картой без наложения */
              <div
                ref={stackRef}
                role="tablist"
                aria-label="use cases"
                aria-orientation="vertical"
                onKeyDown={onTablistKeys}
                className="relative mx-auto w-full"
                /* сцена = слот кучи (карта) + зазор 16 + стопка из N peek'ов:
                   куча и нижняя стопка не пересекаются, всё влезает в 900px
                   вместе с шапкой сайта (~104) */
                style={{ height: `calc(min(460px, 50vh) + 16px + ${N * PEEK}px)` }}
              >
                {/* заголовок живёт В слоте кучи (z под картами): карты по мере
                    скролла перекрывают текст; х2-масштаб — витринный жест,
                    строки шире карты, края текста выглядывают из-за колоды */}
                <div className="absolute inset-x-0 top-0 z-0 flex h-[min(460px,50vh)] items-center justify-center">
                  {renderHeading(
                    "text-center text-[clamp(4rem,7.2vw,6rem)] leading-[1.02] font-medium tracking-[-0.02em]"
                  )}
                </div>
                {useCases.tabs.map((t, i) => (
                  <div
                    key={t.id}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className={`${CARD_CLASS} absolute inset-x-0 top-0 mx-auto h-[min(460px,50vh)] w-[min(560px,92vw)]`}
                    /* z растёт с индексом — следующая карта ложится поверх кучи;
                       transform-origin в центре: наклон вращает карту вокруг
                       середины, края нижних выглядывают из-под верхней */
                    style={{
                      zIndex: i + 1,
                      background: CARD_BG,
                      boxShadow: CARD_SHADOW,
                      transformOrigin: "50% 50%",
                      willChange: "transform",
                    }}
                  >
                    {renderCard(t, i)}
                  </div>
                ))}
              </div>
            ) : (
              /* mobile / reduced-motion: нативная sticky-куча — все обёртки
                 липнут в ОДНУ точку, следующая карта наезжает на предыдущую
                 обычным скроллом; наклон у карт статический (ROT), поэтому в
                 куче края нижних выглядывают из-под верхней, как на desktop;
                 без GSAP-позиционирования */
              <div
                ref={stackRef}
                role="tablist"
                aria-label="use cases"
                aria-orientation="vertical"
                onKeyDown={onTablistKeys}
                className="mt-10 flex flex-col"
                style={{ gap: GAP_M }}
              >
                {useCases.tabs.map((t, i) => (
                  <div
                    key={t.id}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="sticky"
                    style={{ top: STICKY_TOP, zIndex: i + 1 }}
                  >
                    <div
                      className={`${CARD_CLASS} relative min-h-[480px] w-full`}
                      style={{
                        background: CARD_BG,
                        boxShadow: CARD_SHADOW,
                        transform: `rotate(${ROT[i % ROT.length]}deg)`,
                      }}
                    >
                      {renderCard(t, i)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
