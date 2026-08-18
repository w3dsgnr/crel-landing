"use client";

// 04: cases — «ведомость» selected work по docs/refs/selected-work/design.md:
// полноширинные нумерованные строки с хайрлайнами вместо bento-карточек.
// Статика намеренно плоская и бесцветна (ни заливок, ни радиусов, ни теней) —
// весь вольтаж в одном жесте: hover инвертирует строку в синюю ленту от края
// до края вьюпорта (full-bleed фон, контент остаётся в контейнере 1200px).
// Мелкий белый текст живёт на #2668D9 (5.17:1, AA); бренд #2E7CF6 — только
// radial-подсветка в зоне рельса. Фото-ассетов кейсов нет — в рельсе
// проявляется линейный глиф проекта («метка, не иллюстрация»). Hover ведём
// opacity абсолютного слоя: background не анимируется (прецедент Approach).
// Строка целиком — внешняя ссылка на сайт проекта (новая вкладка); что она
// уводит наружу, говорит кастомный курсор-пилюля «host ↗» (см. useWorkCursor),
// на таче вместо него — постоянная стрелка ↗ у названия (.ext-mark).
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cases } from "@/content/services";

// словарь линейных глифов 40px: чертёжная геометрия штрихом 1.5 (грамматика
// ICONS Approach/UseCases), метка проекта, не иллюстрация; ключи = id проектов
const ICONS: Record<string, ReactNode> = {
  // карта + два пересекающихся круга: фиат и крипто в одном балансе
  bitbeon: (
    <>
      <rect x="6.75" y="10.75" width="26.5" height="18.5" rx="5" />
      <circle cx="24.5" cy="20" r="3" />
      <circle cx="28.5" cy="20" r="3" />
    </>
  ),
  // две встречные дуги со стрелками: петля конверсии на одном экране
  trientes: (
    <>
      <path d="M8.5 16.5a11.75 11.75 0 0 1 21.5-3.5M30 5.5V13h-7.5" />
      <path d="M31.5 23.5a11.75 11.75 0 0 1-21.5 3.5M10 34.5V27h7.5" />
    </>
  ),
  // две смещённые карты: стопка виртуальных и пластиковых
  teslapay: (
    <>
      <rect x="10.5" y="6.75" width="24" height="16.5" rx="4" />
      <rect x="5.5" y="16.75" width="24" height="16.5" rx="4" />
    </>
  ),
  // монета со встречными стрелками внутри: своп фиата и крипто в одном счёте
  meinbit: (
    <>
      <circle cx="20" cy="20" r="13.25" />
      <path d="M13.5 17h13l-3.5-3.5M26.5 23h-13l3.5 3.5" />
    </>
  ),
};

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
                      фото проекта (image) либо глиф (fade + подъём 8px, глушится
                      reduced-motion). -my-12 гасит py контейнера: фото касается
                      хайрлайнов, на всю высоту ленты — как в референсе */}
                  <div aria-hidden className="relative hidden md:-my-12 md:block">
                    <div className="dots-rail absolute inset-0 transition-opacity duration-(--d-base) ease-(--ease-out-expo) group-hover:opacity-0 group-focus-visible:opacity-0" />
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-(--d-base) ease-(--ease-out-expo) select-none group-hover:opacity-100 group-focus-visible:opacity-100"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          viewBox="0 0 40 40"
                          className="h-16 w-16 text-white opacity-0 transition-[opacity,transform] duration-(--d-base) ease-(--ease-out-expo) group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:translate-y-2 motion-safe:group-hover:translate-y-0 motion-safe:group-focus-visible:translate-y-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {ICONS[p.id]}
                        </svg>
                      </div>
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
