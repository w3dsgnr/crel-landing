"use client";

// Привод внутренних сцен мокапов: один прогон при въезде в вьюпорт + переигровка
// по наведению на ячейку.
// Грамматика (спека анимации карточек 01, 2026-08-13):
//   phase "static" — атрибута data-play нет → элементы в КОНЕЧНОМ состоянии.
//                    Это же состояние получают SSR, no-JS и prefers-reduced-motion.
//   phase "off"    — data-play="off": стартовая поза, выставляется из JS после
//                    монтирования (как autoAlpha в lib/reveal.ts — разметка
//                    никогда не остаётся скрытой, если скрипт не отработал).
//                    Транзишены в этом состоянии запрещены явно (globals.css,
//                    «Сцены приборов»), поза применяется мгновенно.
//   phase "on"     — data-play="on": CSS-транзишены доигрывают до конечного.
//
// Порог старта (правка 2026-08-18, замечание заказчика «сцены играют из точки
// появления»): раньше IO срабатывал на 40% высоты прибора у самой нижней кромки
// — прогон уходил, пока карточка ещё внизу, и к моменту, когда её реально
// видят, был окончен. Теперь корень IO обрезан снизу на VIEW_BAND (30% вьюпорта)
// и нужна половина прибора внутри: сцена стартует, когда прибор дошёл до нижней
// трети экрана, — уже в поле зрения, а не на входе.
//
// Фора --wg-t0 = --wg-fora + --wg-stagger (правило на [data-scene-cell] в
// globals.css). --wg-fora (700ms) нужна только если в момент старта карточка
// ещё едет по data-reveal (autoAlpha) — при позднем пороге это почти всегда не
// так, и тогда фора обнуляется здесь по факту: opacity ячейки уже 1 → сцена
// отвечает сразу, без паузы «карточка стоит, ничего не происходит».
//
// Переигровка (решение 2026-08-18): наведение на ячейку-предка [data-scene-cell]
// снова прогоняет сцену — off → on. Это не ambient-цикл (очередь MockupStage с
// idle-прогонами снята 2026-08-12 и не возвращается): прибор молчит, пока его не
// тронут; каждый прогон — ответ на действие. Только (hover: hover) и (pointer:
// fine), при reduced-motion — нет. Пока прогон идёт (включая ПЕРВЫЙ, по IO —
// у правой ячейки он длится до ~1.8s вместе с форой), повторный вход не
// сбрасывает его: иначе дрожание курсора по краю ячейки рвёт сцену на кадры.
// На переигровке фора --wg-t0 не нужна (карточка уже видна) — на ячейке она
// зануляется, и сцена отвечает сразу.
//
// Три ограничителя переигровки (ревью моушна 2026-08-18):
//  — dwell: replay стартует не по входу курсора, а после DWELL_MS покоя внутри
//    ячейки (hover-intent, как у тултипов). Иначе проезд курсора по гриду
//    наискось запускает шесть рестартов подряд — тот самый «салют», который
//    запрещён спекой §1; транзитный проход теперь ничего не трогает;
//  — ячейка с собственным hover-жестом ([data-hover-scene], сегодня только
//    Cards) replay не получает: два жеста на одно наведение — .wg-slot
//    раздвигает стопку, а replay в тот же кадр гасит обе карты и сдаёт заново,
//    и заднюю карту, ради которой hover и существует, первые ~100ms не видно;
//  — рестарт — жёсткий кат в стартовую позу (в "off" транзишены запрещены):
//    это идиома rewind, а не toast/toggle, где нужна интерраптибельность.
import { useEffect, useRef, useState } from "react";

export type PlayPhase = "static" | "off" | "on";

// Длина самого долгого прогона среди приборов (Cards: последний такт 620ms +
// 420ms транзишена; Ramp: 760 + 180) — до её истечения повторный hover
// игнорируется. К первому прогону прибавляется фора --wg-t0 ячейки.
const RUN_MS = 1400;
// покой курсора внутри ячейки до replay: меньше — ловим транзит, больше —
// отклик уже не читается как ответ на наведение
const DWELL_MS = 160;
// нижняя полоса вьюпорта, в которой прибор ещё считается «на входе»: корень
// IO обрезан на неё снизу, и сцена стартует, когда половина прибора поднялась
// выше этой полосы (в нижнюю треть — уже в поле зрения)
const VIEW_BAND = "30%";

// сумма всех «Nms» в строке: computed-значение --wg-t0 у ячейки — это
// «calc(700ms + 160ms)» (custom property не вычисляется), инлайн после
// replay — «0ms»
const sumMs = (s: string) => (s.match(/-?\d+(?:\.\d+)?(?=ms)/g) ?? []).reduce((a, n) => a + parseFloat(n), 0);

export function usePlayOnce<T extends HTMLElement>({
  enabled = true,
  threshold = 0.5,
}: { enabled?: boolean; threshold?: number } = {}) {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<PlayPhase>("static");

  useEffect(() => {
    // enabled=false — прибор переиспользован там, где сцена не нужна
    // (RampWidgetGlass живёт ещё в Hero и в Integration compact)
    if (!enabled) return;
    // reduced-motion остаётся в static: движения нет, содержимое сразу читаемо
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    const cell = el.closest<HTMLElement>("[data-scene-cell]");
    // момент, когда текущий прогон СТАРТОВАЛ, с поправкой на его фору: пока
    // now − lastRun < RUN_MS, сцену не трогаем — ни по IO, ни по наведению
    let lastRun = -Infinity;
    const t0Ms = () => (cell ? sumMs(getComputedStyle(cell).getPropertyValue("--wg-t0")) : 0);

    let armed = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!armed) {
          armed = true;
          // прибор уже хоть сколько-то на экране (перезагрузка с
          // восстановленным скроллом, переход по якорю) — не отматываем
          // назад то, что человек уже увидел: остаёмся в static
          if (entry.intersectionRatio > 0) {
            io.disconnect();
            return;
          }
          setPhase("off");
          return;
        }
        if (!entry.isIntersecting) return;
        // фора под data-reveal нужна, только если карточка в этот момент ещё
        // непрозрачна; при позднем пороге ревил обычно уже отыграл — тогда
        // сцена стартует сразу (остаётся только --wg-stagger ряда)
        if (cell && parseFloat(getComputedStyle(cell).opacity) >= 0.99) {
          cell.style.setProperty("--wg-fora", "0ms");
        }
        // первый прогон занимает guard: hover в его середине не должен рвать
        // сцену и стартовать с нуля
        lastRun = performance.now() + t0Ms();
        setPhase("on");
        io.disconnect();
      },
      { threshold, rootMargin: `0px 0px -${VIEW_BAND} 0px` }
    );
    io.observe(el);

    // ── переигровка по наведению ────────────────────────────────────────────
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    // ячейка с собственным hover-жестом (веер Cards) replay не получает —
    // один hover, один жест
    if (!cell || !canHover || cell.hasAttribute("data-hover-scene")) return () => io.disconnect();

    let raf = 0;
    let dwell = 0;
    const replay = () => {
      const now = performance.now();
      if (now - lastRun < RUN_MS) return;
      lastRun = now;
      // фора нужна была только первому прогону под data-reveal
      cell.style.setProperty("--wg-t0", "0ms");
      // off (мгновенно, транзишенов нет) → кадр → on. Два rAF: первый — чтобы
      // React успел применить атрибут, второй — чтобы стиль off был вычислен
      // до смены, иначе браузер схлопнет off→on в один кадр без транзишена.
      setPhase("off");
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => setPhase("on"));
      });
    };
    // hover-intent: replay после DWELL_MS покоя в ячейке; выход раньше — отмена
    const onEnter = () => {
      clearTimeout(dwell);
      dwell = window.setTimeout(replay, DWELL_MS);
    };
    const onLeave = () => clearTimeout(dwell);
    cell.addEventListener("pointerenter", onEnter);
    cell.addEventListener("pointerleave", onLeave);

    return () => {
      io.disconnect();
      cell.removeEventListener("pointerenter", onEnter);
      cell.removeEventListener("pointerleave", onLeave);
      clearTimeout(dwell);
      cancelAnimationFrame(raf);
    };
  }, [enabled, threshold]);

  // data-play отсутствует в static — стартовые позы к разметке не применяются
  return { ref, phase, playAttr: phase === "static" ? undefined : phase };
}
