"use client";

// 03: licensing / compliance — чёрная pinned-сцена со scroll-scrub повествованием
// (спека владельца 2026-08-13). Прежний sticky-stack белых карточек на vendored
// ScrollStack снят вместе с самим вендором. Механика пина — паттерн UseCases:
// wrap фиксированной vh-высоты + sticky h-dvh БЕЗ pin-spacer (дружит с Lenis
// и «Перепечаткой»), один GSAP timeline на ScrollTrigger-скрабе. Драматургия:
// интро-заголовок рождается в центре пустого экрана, паркуется 18px-лейблом под
// шапку-капсулу; четыре тезиса из licensing.cards проходят тот же цикл
// «появился по центру (предмет-герой за текстом) — улетел в стек под лейбл».
// К финалу под лейблом собран список всего пройденного — стек и есть кульминация.
// Перелёты — FLIP: целевые маленькие узлы отрисованы заранее (aria-hidden),
// большой заголовок летит transform'ом (translate + scale к целевому кеглю) и
// в конце свапается по opacity на настоящий мелкий узел — финальный кадр без
// мыла от transform: scale. Семантика живёт в больших узлах (h2/h3/p, скрытие
// только opacity — текст остаётся в дереве доступности и в DOM для SEO).
// Mobile / reduced-motion — обычный поток без GSAP и без пина.
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { licensing } from "@/content/services";
import { ensureEases } from "@/lib/easing";

const N = licensing.cards.length;

const ASSETS = "/assets/commplience/";

// орбитальный предмет сцены: смещение от центра героя и собственная ширина —
// всё в долях фактической ширины кадра героя, поэтому композиция референса
// держится на любом вьюпорте. rot — доворот самого предмета (кадр PNG уже
// снят под углом, доворачиваем только там, где референс просит другой наклон)
type SceneProp = { src: string; x: number; y: number; w: number; rot?: number };

type Scene = {
  hero: string;
  // Ширина кадра героя — ТОЛЬКО классом, никогда инлайновым style. build()
  // начинается с gsap.set(clearProps:"all"), а он сносит инлайновые стили от
  // React (та же ловушка, что с color лейбла ниже, — React о мутации DOM не
  // знает и не восстановит). Без ширины <img> рендерится в натуральном размере
  // PNG, а до загрузки его рект = 0 — и геометрия предметов, которая считается
  // от этого ректа, уезжает вдвое. Классу clearProps ничего не сделает, и рект
  // честен ещё до загрузки картинки.
  // Калибруется поштучно: кадры ассетов по-разному заполнены предметом (badge
  // занимает 36% ширины своего PNG, folder — 79%), поэтому равная ширина кадра
  // дала бы визуально разные предметы. heroWSm — тот же кадр в мобильном потоке
  heroW: string;
  heroWSm: string;
  props: SceneProp[];
};

// сцена тезиса по его mark из content/services.ts: порядок карточек живёт в
// контенте, привязка «тезис → предметы» — здесь, в визуальном слое
const SCENES: Record<string, Scene> = {
  // кадры героев — в натуральную величину PNG (утверждено владельцем): предметы
  // на чёрном крупные, воздуха вокруг мало. Доли предметов ниже пересчитаны
  // под эти кадры, поэтому менять heroW и props надо только вместе
  MiCA: {
    hero: `${ASSETS}badge.png`,
    heroW: "w-[min(738px,62vw)]",
    heroWSm: "w-[min(590px,80vw)]",
    props: [],
  },
  "PCI DSS": {
    hero: `${ASSETS}safe.png`,
    heroW: "w-[min(802px,68vw)]",
    heroWSm: "w-[min(642px,80vw)]",
    props: [
      // референс: ¥ крупная слева-сверху, £ мелкая справа-снизу
      { src: `${ASSETS}coin-yen.png`, x: -0.359, y: -0.227, w: 0.251 },
      { src: `${ASSETS}coin-pound.png`, x: 0.299, y: 0.311, w: 0.12 },
    ],
  },
  EMI: {
    hero: `${ASSETS}pig.png`,
    heroW: "w-[min(444px,38vw)]",
    heroWSm: "w-[min(355px,80vw)]",
    props: [],
  },
  AML: {
    hero: `${ASSETS}folder.png`,
    heroW: "w-[min(620px,53vw)]",
    heroWSm: "w-[min(496px,80vw)]",
    props: [
      // референс владельца: один штамп справа-сверху, второй слева-снизу с
      // наклоном в противоход — папка читается как «проштампованная с двух рук».
      { src: `${ASSETS}shtamp2.png`, x: 0.457, y: -0.217, w: 0.186 },
      { src: `${ASSETS}shtamp.png`, x: -0.426, y: 0.194, w: 0.178, rot: -28 },
    ],
  },
};

const FALLBACK_SCENE: Scene = {
  hero: `${ASSETS}safe.png`,
  heroW: "w-[min(520px,44vw)]",
  heroWSm: "w-[min(420px,80vw)]",
  props: [],
};
const sceneOf = (mark: string): Scene => SCENES[mark] ?? FALLBACK_SCENE;

// дуга ухода предметов: поворот пивота вокруг центра героя
const PROP_SPIN = -30;

// фазы таймлайна в условных единицах; масштаб единицы задаёт VH_PER_UNIT —
// высота wrap выводится из суммы фаз, а не подгоняется вручную
const PH = {
  introIn: 1, // рождение интро из пустоты
  introHold: 0.35, // короткая пауза — заголовок читается до парковки
  introPark: 1, // перелёт интро в лейбл под капсулой
  thesisIn: 1, // появление тезиса (герой + текст, у PCI и AML — предметы)
  thesisRead: 0.5, // тезис стоит — время на чтение body
  thesisOut: 1, // распад картинки + перелёт заголовка в стек
  finalHold: 1.2, // финальный кадр (лейбл + 4 заголовка) держится до отпускания
};
const UNITS =
  PH.introIn + PH.introHold + PH.introPark + N * (PH.thesisIn + PH.thesisRead + PH.thesisOut) + PH.finalHold;
const VH_PER_UNIT = 55;
// +100vh: скролл-дистанция скраба = высота wrap минус экран (end: bottom bottom)
const WRAP_HEIGHT = `${Math.round(UNITS * VH_PER_UNIT) + 100}vh`;

// посадка лейбла: низ плавающей шапки-капсулы (md: pt-5 20px + h-14 56px) + 64px
const STACK_TOP = 140;

// разрыв интро-заголовка на две строки (как в референсе) — перед этим словом
const TITLE_BREAK_BEFORE = "before";

// цвет припаркованного лейбла (спека): глуше ink-soft — лейбл тише контента
const LABEL_COLOR = "#919191";

// интро и лейбл делят один и тот же двухстрочный разрыв: перелёт масштабирует
// большой узел ровно в маленький, строки обязаны совпадать
const introWords = licensing.section.title.split(" ");
const breakAt = introWords.indexOf(TITLE_BREAK_BEFORE);
const TITLE_L1 = breakAt > 0 ? introWords.slice(0, breakAt).join(" ") : licensing.section.title;
const TITLE_L2 = breakAt > 0 ? introWords.slice(breakAt).join(" ") : "";

// FLIP-замер перелёта: дельта центров + масштаб к целевому кеглю. Масштаб — из
// font-size, а не из ширин: у большого узла строка может ломаться иначе, чем у
// маленького, а кегль однозначен (трекинг em-овый — сжимается пропорционально)
function measureFlight(from: HTMLElement, to: HTMLElement) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  return {
    x: b.left + b.width / 2 - (a.left + a.width / 2),
    y: b.top + b.height / 2 - (a.top + a.height / 2),
    scale: parseFloat(getComputedStyle(to).fontSize) / parseFloat(getComputedStyle(from).fontSize),
  };
}

export function LicensingStack() {
  const [scrub, setScrub] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const bodyRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const smallRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const heroRefs = useRef<(HTMLImageElement | null)[]>([]);
  // предметы и их пивоты — по карточке на строку: [k][i]
  const propRefs = useRef<(HTMLImageElement | null)[][]>([]);
  const pivotRefs = useRef<(HTMLDivElement | null)[][]>([]);

  // pinned-скраб только desktop + no-reduced-motion; иначе — обычный поток
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const apply = () => setScrub(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!scrub) return;
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const intro = introRef.current;
    const label = labelRef.current;
    const blocks = blockRefs.current.slice(0, N).filter((el): el is HTMLDivElement => el !== null);
    const titles = titleRefs.current.slice(0, N).filter((el): el is HTMLHeadingElement => el !== null);
    const bodies = bodyRefs.current.slice(0, N).filter((el): el is HTMLParagraphElement => el !== null);
    const smalls = smallRefs.current.slice(0, N).filter((el): el is HTMLParagraphElement => el !== null);
    if (!wrap || !stage || !intro || !label) return;
    if ([blocks, titles, bodies, smalls].some((arr) => arr.length !== N)) return;

    // привязка сцен к DOM: герой и его предметы собраны в один объект — дальше
    // timeline работает с любой сценой единообразно, без веток по индексу
    // карточки. Сцены без предметов дают пустой props и просто не добавляют твинов
    type Bound = { cfg: SceneProp; img: HTMLImageElement; pivot: HTMLDivElement };
    const scenes: { hero: HTMLImageElement; props: Bound[] }[] = [];
    for (let k = 0; k < N; k++) {
      const hero = heroRefs.current[k];
      if (!hero) return;
      const bound: Bound[] = [];
      sceneOf(licensing.cards[k].mark).props.forEach((cfg, i) => {
        const img = propRefs.current[k]?.[i];
        const pivot = pivotRefs.current[k]?.[i];
        if (img && pivot) bound.push({ cfg, img, pivot });
      });
      if (bound.length !== sceneOf(licensing.cards[k].mark).props.length) return;
      scenes.push({ hero, props: bound });
    }

    const heroes = scenes.map((s) => s.hero);
    const propImgs = scenes.flatMap((s) => s.props.map((p) => p.img));
    const propPivots = scenes.flatMap((s) => s.props.map((p) => p.pivot));

    ensureEases();
    gsap.registerPlugin(ScrollTrigger);

    // до своей фазы элемент невидим; появления делает timeline из этой базы
    const hidden = [intro, label, ...smalls, ...blocks, ...heroes, ...propImgs];
    const animated = [...hidden, ...titles, ...bodies, ...propPivots];

    let tl: gsap.core.Timeline | null = null;

    const teardown = () => {
      tl?.scrollTrigger?.kill();
      tl?.kill();
      tl = null;
    };

    // сборка сцены целиком: FLIP-замеры честны только на нетрансформированных
    // узлах, поэтому ресайз/шрифты не правят твины, а пересобирают всё — скраб
    // сам восстановит кадр из текущего прогресса скролла
    const build = () => {
      teardown();
      gsap.set(animated, { clearProps: "all" });
      gsap.set(hidden, { opacity: 0 });
      // clearProps стирает и React-овый инлайновый color лейбла — React о
      // мутации DOM не знает и не восстановит; возвращаем руками
      gsap.set(label, { color: LABEL_COLOR });

      // геометрия предметов — от фактической ширины кадра своего героя; радиус
      // дуги ухода = смещение предмета от центра-пивота
      scenes.forEach(({ hero, props }) => {
        const w = hero.getBoundingClientRect().width || 480;
        props.forEach(({ cfg, img }) => {
          gsap.set(img, {
            xPercent: -50,
            yPercent: -50,
            x: cfg.x * w,
            y: cfg.y * w,
            width: cfg.w * w,
            rotation: cfg.rot ?? 0,
          });
        });
      });

      const introFlight = measureFlight(intro, label);
      const titleFlights = titles.map((el, k) => measureFlight(el, smalls[k]));

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: true },
      });
      tl = timeline;

      let t = 0;
      // интро: рождение из пустоты в центре чёрного экрана
      timeline.fromTo(
        intro,
        { scale: 0.75, opacity: 0 },
        { scale: 1, opacity: 1, duration: PH.introIn, ease: "crelOut" },
        t
      );
      t += PH.introIn + PH.introHold;
      // парковка: transform к эквиваленту 18px, цвет глохнет до лейбла
      timeline.to(
        intro,
        {
          x: introFlight.x,
          y: introFlight.y,
          scale: introFlight.scale,
          color: LABEL_COLOR,
          duration: PH.introPark,
          ease: "crelSwap",
        },
        t
      );
      t += PH.introPark;
      // свап на настоящий 18px-узел: припаркованный кадр без scale-мыла
      timeline.set(intro, { opacity: 0 }, t);
      timeline.set(label, { opacity: 1 }, t);

      for (let k = 0; k < N; k++) {
        const props = scenes[k].props;
        // появление тезиса: герой стартует чуть раньше текста, предметы
        // догоняют со сдвигом — лёгкий каскад вместо одновременной вспышки
        timeline.fromTo(
          heroes[k],
          { scale: 0.75, opacity: 0 },
          { scale: 1, opacity: 1, duration: PH.thesisIn, ease: "crelOut" },
          t
        );
        timeline.fromTo(
          blocks[k],
          { scale: 0.75, opacity: 0 },
          { scale: 1, opacity: 1, duration: PH.thesisIn * 0.9, ease: "crelOut" },
          t + PH.thesisIn * 0.1
        );
        props.forEach(({ img }, i) => {
          timeline.fromTo(
            img,
            { scale: 0.75, opacity: 0 },
            { scale: 1, opacity: 1, duration: PH.thesisIn * 0.8, ease: "crelOut" },
            t + PH.thesisIn * (0.15 + i * 0.08)
          );
        });
        t += PH.thesisIn + PH.thesisRead;

        // уход: предметы уезжают по дуге ~30° (вращение пивота вокруг центра
        // героя), сжимаясь и гаснут; герой сдувается 100→75% с fade; body
        // гаснет; заголовок летит в свой слот стека — белый, без изменения opacity
        props.forEach(({ img, pivot }) => {
          timeline.to(pivot, { rotation: PROP_SPIN, duration: PH.thesisOut * 0.7, ease: "crelSwap" }, t);
          timeline.to(img, { scale: 0.55, opacity: 0, duration: PH.thesisOut * 0.7, ease: "crelSwap" }, t);
        });
        timeline.to(heroes[k], { scale: 0.75, opacity: 0, duration: PH.thesisOut * 0.7, ease: "crelSwap" }, t);
        timeline.to(bodies[k], { opacity: 0, duration: PH.thesisOut * 0.45, ease: "crelSwap" }, t);
        timeline.to(
          titles[k],
          {
            x: titleFlights[k].x,
            y: titleFlights[k].y,
            scale: titleFlights[k].scale,
            duration: PH.thesisOut,
            ease: "crelSwap",
          },
          t
        );
        t += PH.thesisOut;
        // финальная строка стека — настоящий 28px-узел, не отмасштабированный
        timeline.set(titles[k], { opacity: 0 }, t);
        timeline.set(smalls[k], { opacity: 1 }, t);
      }

      // пустой твин держит хвост прогресса: финальный кадр стоит до отпускания
      timeline.to({}, { duration: PH.finalHold }, t);

      // секция монтируется «Перепечаткой» — высоты страницы уже другие
      ScrollTrigger.refresh();
    };

    build();

    // ресайз меняет FLIP-дельты и геометрию предметов — пересборка одним кадром;
    // первый вызов observer'а (сразу после observe) — не ресайз, пропускаем
    let raf = 0;
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    });
    ro.observe(stage);

    // web-шрифт догружается после монтирования и меняет ширины строк — замеры
    // перелётов пересобираются по факту загрузки
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) build();
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      teardown();
      gsap.set(animated, { clearProps: "all" });
    };
  }, [scrub]);

  return (
    <section className="layer-v4 layer-v4-invert bg-bg">
      {scrub ? (
        <div ref={wrapRef} className="relative" style={{ height: WRAP_HEIGHT }}>
          <div ref={stageRef} className="sticky top-0 h-dvh overflow-hidden">
            {/* сцены тезисов: герой (фон) + текст по центру; слои inset-0 лежат
                стопкой, видимость каждого ведёт timeline. Вся сцена декоративно-
                текстовая, без интерактива — pointer-events выключены, скролл
                проходит сквозь */}
            {licensing.cards.map((card, k) => {
              const scene = sceneOf(card.mark);
              return (
                <div key={card.title} className="pointer-events-none absolute inset-0">
                  <div aria-hidden className="absolute inset-0 grid place-items-center">
                    <img
                      ref={(el) => {
                        heroRefs.current[k] = el;
                      }}
                      src={scene.hero}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`${scene.heroW} select-none will-change-transform`}
                      style={{ opacity: 0 }}
                    />
                  </div>
                  {/* пивоты предметов — точки в центре экрана (= центр героя):
                      дуга ухода — вращение пивота, радиус — смещение предмета;
                      max-w-none обязателен — родитель нулевой ширины */}
                  {scene.props.map((prop, i) => (
                    <div
                      key={prop.src}
                      ref={(el) => {
                        (pivotRefs.current[k] ??= [])[i] = el;
                      }}
                      aria-hidden
                      className="absolute top-1/2 left-1/2 will-change-transform"
                    >
                      <img
                        ref={(el) => {
                          (propRefs.current[k] ??= [])[i] = el;
                        }}
                        src={prop.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute max-w-none select-none"
                        style={{ opacity: 0 }}
                      />
                    </div>
                  ))}
                  <div
                    ref={(el) => {
                      blockRefs.current[k] = el;
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center will-change-transform"
                    style={{ opacity: 0 }}
                  >
                    <h3
                      ref={(el) => {
                        titleRefs.current[k] = el;
                      }}
                      className="text-h2 whitespace-nowrap will-change-transform"
                    >
                      {card.title}
                    </h3>
                    <p
                      ref={(el) => {
                        bodyRefs.current[k] = el;
                      }}
                      className="mt-5 max-w-[52ch] text-[1.125rem] leading-[1.5] text-ink-soft"
                    >
                      {card.body}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* интро — семантический h2 секции: рождается в центре, паркуется
                лейблом; после свапа скрыт только opacity — остаётся читаемым AT */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center px-5">
              <h2 ref={introRef} className="text-h2 text-center will-change-transform" style={{ opacity: 0 }}>
                {TITLE_L1}
                {TITLE_L2 && <br />}
                {TITLE_L2}
              </h2>
            </div>

            {/* верхний стек — цели FLIP-перелётов, отрисованы заранее для
                замеров; текст дублирует большие узлы — вне дерева доступности.
                Кегль/линия/трекинг маленьких узлов зеркалят большие, чтобы
                свап в конце перелёта был бесшовным */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
              style={{ top: STACK_TOP }}
            >
              <p
                ref={labelRef}
                className="text-center text-[1.125rem] leading-[1.05] font-medium tracking-[-0.015em]"
                style={{ color: LABEL_COLOR, opacity: 0 }}
              >
                {TITLE_L1}
                {TITLE_L2 && <br />}
                {TITLE_L2}
              </p>
              <div className="mt-6 flex flex-col items-center gap-2.5">
                {licensing.cards.map((card, k) => (
                  <p
                    key={card.title}
                    ref={(el) => {
                      smallRefs.current[k] = el;
                    }}
                    className="text-[1.75rem] leading-[1.05] font-medium tracking-[-0.015em] whitespace-nowrap"
                    style={{ opacity: 0 }}
                  >
                    {card.title}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* mobile / reduced-motion: те же тексты обычным потоком — лейбл сверху,
           дальше четыре блока «заголовок + текст + герой»; без GSAP и пина.
           Орбитальные предметы сюда не тащим: без скраба им негде летать */
        <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
          <h2 className="text-h2 mx-auto max-w-[18ch] text-center">{licensing.section.title}</h2>
          <div className="mt-16 flex flex-col gap-24">
            {licensing.cards.map((card) => (
              <div key={card.title} className="flex flex-col items-center text-center">
                <h3 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.015em]">
                  {card.title}
                </h3>
                <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-soft">{card.body}</p>
                <img
                  src={sceneOf(card.mark).hero}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className={`mt-8 select-none ${sceneOf(card.mark).heroWSm}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
