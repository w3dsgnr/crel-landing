"use client";

// 04: cases — «ведомость» selected work по docs/refs/selected-work/design.md:
// полноширинные нумерованные строки с хайрлайнами вместо bento-карточек.
// Статика намеренно плоская и бесцветна (ни заливок, ни радиусов, ни теней) —
// весь вольтаж в одном жесте: hover инвертирует строку в синюю ленту от края
// до края вьюпорта (full-bleed фон, контент остаётся в контейнере 1200px).
// Мелкий белый текст живёт на #2668D9 (5.17:1, AA); бренд #2E7CF6 — только
// radial-подсветка в зоне рельса. В рельсе под hover проявляется скриншот
// проекта (public/assets/works, ключ = id). Hover ведём opacity абсолютного
// слоя: background не анимируется (прецедент Approach).
// Строка целиком — внешняя ссылка на сайт проекта (новая вкладка); что она
// уводит наружу, говорит кастомный курсор-пилюля «host ↗» (см. useWorkCursor),
// на таче вместо него — постоянная стрелка ↗ у названия (.ext-mark).
import { useEffect, useRef, type RefObject } from "react";
import { cases } from "@/content/services";

// hostname без www — подпись пилюли-курсора и .ext-mark; вычисляется на сборке
const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");

// Кастомный курсор ведомости: одна пилюля на весь список (position: fixed вне
// строк — data-reveal оставляет на <li> transform, а он ломает fixed внутри).
// События снимаем делегированием с <ul>; координаты пишем в transform через
// rAF, React-state на mousemove не трогаем. Один жест: пилюля возникает при
// входе в строку и гаснет при выходе, ambient-циклов нет — rAF живёт лишь пока
// пилюля догоняет курсор. Только (hover: hover) and (pointer: fine): на таче
// хук молчит, и cursor: none на строки не вешается (data-cursor не выставлен).
// reduced-motion — без лага: пилюля стоит ровно под курсором.
function useWorkCursor(
  listRef: RefObject<HTMLUListElement | null>,
  pillRef: RefObject<HTMLDivElement | null>,
  labelRef: RefObject<HTMLSpanElement | null>,
) {
  useEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    const label = labelRef.current;
    if (!list || !pill || !label) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    list.dataset.cursor = "on";

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let current: HTMLAnchorElement | null = null;

    const place = () => {
      pill.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    // догоняющий лаг: за кадр проходим 22% остатка, при |остаток| < 0.1px — стоп
    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      place();
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const linkOf = (t: EventTarget | null) =>
      t instanceof Element ? t.closest<HTMLAnchorElement>("a[data-case-link]") : null;

    const hide = () => {
      current = null;
      delete pill.dataset.on;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onOver = (e: PointerEvent) => {
      const link = linkOf(e.target);
      if (!link || link === current) return;
      label.textContent = link.dataset.host ?? "";
      if (!current) {
        // вход в ведомость: пилюля рождается ровно под курсором, без подлёта
        x = tx = e.clientX;
        y = ty = e.clientY;
        place();
        pill.dataset.on = "";
      }
      current = link;
    };

    const onOut = (e: PointerEvent) => {
      if (!current) return;
      if (linkOf(e.relatedTarget)) return; // переход строка → строка: onOver сменит подпись
      hide();
    };

    const onMove = (e: PointerEvent) => {
      if (!current) return;
      tx = e.clientX;
      ty = e.clientY;
      if (reduce) {
        x = tx;
        y = ty;
        place();
      } else if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    list.addEventListener("pointerover", onOver);
    list.addEventListener("pointerout", onOut);
    list.addEventListener("pointermove", onMove);
    // клик уводит в новую вкладку — при потере фокуса окном pointerout не придёт
    window.addEventListener("blur", hide);

    return () => {
      hide();
      delete list.dataset.cursor;
      list.removeEventListener("pointerover", onOver);
      list.removeEventListener("pointerout", onOut);
      list.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", hide);
    };
  }, [listRef, pillRef, labelRef]);
}

export function Cases() {
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  useWorkCursor(listRef, pillRef, labelRef);

  return (
    <section className="layer-v4 bg-bg pb-28 md:pb-40">
      <div className="mx-auto max-w-[1200px] px-5 pt-28 md:px-12 md:pt-40">
        {/* шапка одним цветом по левому краю контентной сетки (решение
            2026-08-13): двухтоновость и отступ до колонки названий не переносим */}
        <h2 className="text-h2">{cases.section.title}</h2>
      </div>

      {/* строки вне контейнера: хайрлайны и лента hover режутся краями
          вьюпорта — обрезанная по 1200px инверсия читалась бы как подсветка */}
      <ul ref={listRef} className="mt-16 md:mt-20">
        {cases.projects.map((p, i) => {
          const index = String(i + 1).padStart(2, "0");
          const host = hostOf(p.url);
          return (
            <li key={p.id} data-reveal className="border-t border-(--v4-hairline) last:border-b">
              {/* вся строка — ссылка (group на <a>: лента и инверсия текста
                  отвечают и на hover, и на клавиатурный focus-visible). aria-label
                  даёт ссылке короткое имя вместо склейки заголовка и описания;
                  outline фокуса заводим внутрь — строка full-bleed, снаружи негде */}
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${p.name} — open site`}
                data-case-link
                data-host={host}
                className="group relative block focus-visible:outline-offset-[-2px]"
              >
                {/* лента живёт только под курсором: слой поверх статики, opacity 0→1 */}
                <div
                  aria-hidden
                  className="grad-work-hover absolute inset-0 opacity-0 transition-opacity duration-(--d-base) ease-(--ease-out-expo) group-hover:opacity-100 group-focus-visible:opacity-100"
                />
                <div className="relative mx-auto grid max-w-[1200px] px-5 py-10 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1.5fr)_auto] md:gap-x-8 md:px-12 md:py-12">
                  {/* рельс: точечная сетка в статике; в ленте её место занимает
                      скриншот проекта (fade). -my-12 гасит py контейнера: сетка на
                      всю высоту ленты. Фото — фиксированной пропорции ассетов
                      (1440×969), на всю ширину рельса и по центру вертикали: строки
                      разной высоты (2–3 строки описания) иначе резали бы cover
                      с боков, и картинка «влезала» бы только в самых низких */}
                  <div aria-hidden className="relative hidden md:-my-12 md:flex md:items-center">
                    <div className="dots-rail absolute inset-0 transition-opacity duration-(--d-base) ease-(--ease-out-expo) group-hover:opacity-0 group-focus-visible:opacity-0" />
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="relative aspect-[1440/969] w-full object-cover opacity-0 transition-opacity duration-(--d-base) ease-(--ease-out-expo) select-none group-hover:opacity-100 group-focus-visible:opacity-100"
                      />
                    )}
                  </div>

                  <h3 className="text-[clamp(1.75rem,2.5vw,2.25rem)] leading-[1.1] font-medium tracking-[-0.015em] text-ink transition-colors duration-(--d-base) group-hover:text-white group-focus-visible:text-white">
                    {/* mobile: индекс живёт в строке названия; desktop-ячейка ниже */}
                    <span className="text-data mr-3 text-[0.9375rem] text-ink-soft transition-colors duration-(--d-base) group-hover:text-white group-focus-visible:text-white md:hidden">
                      {index}
                    </span>
                    {p.name}
                    {/* тач/coarse pointer: кастомного курсора нет — маленькая
                        постоянная стрелка «наружу» у названия (видима под hover: none) */}
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="ext-mark ml-2 h-[0.55em] w-[0.55em] align-baseline text-ink-soft transition-colors duration-(--d-base) group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12 12 4M5.5 4H12v6.5" />
                    </svg>
                  </h3>

                  <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-[1.55] text-ink-soft transition-colors duration-(--d-base) group-hover:text-white group-focus-visible:text-white md:mt-0 md:text-[1rem]">
                    {p.body}
                  </p>

                  {/* индекс — данные, роль track-подписей: моно, «01»…«04» */}
                  <p className="text-data hidden text-right text-[0.9375rem] text-ink-soft transition-colors duration-(--d-base) group-hover:text-white group-focus-visible:text-white md:block">
                    {index}
                  </p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      {/* пилюля-курсор: fixed на уровне секции, центрируется на точке курсора
          через translate: -50% -50% (в css); JS двигает только transform
          внешнего слоя, появление (scale + opacity) — на внутренней пилюле */}
      <div ref={pillRef} aria-hidden className="work-cursor">
        <div className="work-cursor-pill">
          <span ref={labelRef} className="text-data" />
          <svg
            viewBox="0 0 16 16"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12 12 4M5.5 4H12v6.5" />
          </svg>
        </div>
      </div>
    </section>
  );
}
