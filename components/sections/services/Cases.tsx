// 04: cases — «ведомость» selected work по docs/refs/selected-work/design.md:
// полноширинные нумерованные строки с хайрлайнами вместо bento-карточек.
// Статика намеренно плоская и бесцветна (ни заливок, ни радиусов, ни теней) —
// весь вольтаж в одном жесте: hover инвертирует строку в синюю ленту от края
// до края вьюпорта (full-bleed фон, контент остаётся в контейнере 1200px).
// Мелкий белый текст живёт на #2668D9 (5.17:1, AA); бренд #2E7CF6 — только
// radial-подсветка в зоне рельса. Фото-ассетов кейсов нет — в рельсе
// проявляется линейный глиф проекта («метка, не иллюстрация»). Hover ведём
// opacity абсолютного слоя: background не анимируется (прецедент Approach).
import type { ReactNode } from "react";
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
  // три узла, связанные в цепь: блокчейн-экосистема
  taler: (
    <>
      <circle cx="9" cy="29" r="3.25" />
      <circle cx="20" cy="11" r="3.25" />
      <circle cx="31" cy="29" r="3.25" />
      <path d="M10.75 26.25 18.25 13.75M21.75 13.75l7.5 12.5M12.25 29h15.5" />
    </>
  ),
};

export function Cases() {
  return (
    <section className="layer-v4 bg-bg pb-28 md:pb-40">
      <div className="mx-auto max-w-[1200px] px-5 pt-28 md:px-12 md:pt-40">
        {/* шапка одним цветом по левому краю контентной сетки (решение
            2026-08-13): двухтоновость и отступ до колонки названий не переносим */}
        <h2 className="text-h2">{cases.section.title}</h2>
      </div>

      {/* строки вне контейнера: хайрлайны и лента hover режутся краями
          вьюпорта — обрезанная по 1200px инверсия читалась бы как подсветка */}
      <ul className="mt-16 md:mt-20">
        {cases.projects.map((p, i) => {
          const index = String(i + 1).padStart(2, "0");
          return (
            <li
              key={p.id}
              data-reveal
              className="group relative border-t border-(--v4-hairline) last:border-b"
            >
              {/* лента живёт только под курсором: слой поверх статики, opacity 0→1 */}
              <div
                aria-hidden
                className="grad-work-hover absolute inset-0 opacity-0 transition-opacity duration-(--d-base) ease-(--ease-out-expo) group-hover:opacity-100"
              />
              <div className="relative mx-auto grid max-w-[1200px] px-5 py-10 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1.5fr)_auto] md:gap-x-8 md:px-12 md:py-12">
                {/* рельс: точечная сетка в статике; в ленте её место занимает
                    фото проекта (image) либо глиф (fade + подъём 8px, глушится
                    reduced-motion). -my-12 гасит py контейнера: фото касается
                    хайрлайнов, на всю высоту ленты — как в референсе */}
                <div aria-hidden className="relative hidden md:-my-12 md:block">
                  <div className="dots-rail absolute inset-0 transition-opacity duration-(--d-base) ease-(--ease-out-expo) group-hover:opacity-0" />
                  {p.image ? (
                    <img
                      src={p.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-(--d-base) ease-(--ease-out-expo) select-none group-hover:opacity-100"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        viewBox="0 0 40 40"
                        className="h-16 w-16 text-white opacity-0 transition-[opacity,transform] duration-(--d-base) ease-(--ease-out-expo) group-hover:opacity-100 motion-safe:translate-y-2 motion-safe:group-hover:translate-y-0"
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

                <h3 className="text-[clamp(1.75rem,2.5vw,2.25rem)] leading-[1.1] font-medium tracking-[-0.015em] text-ink transition-colors duration-(--d-base) group-hover:text-white">
                  {/* mobile: индекс живёт в строке названия; desktop-ячейка ниже */}
                  <span className="text-data mr-3 text-[0.9375rem] text-ink-soft transition-colors duration-(--d-base) group-hover:text-white md:hidden">
                    {index}
                  </span>
                  {p.name}
                </h3>

                <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-[1.55] text-ink-soft transition-colors duration-(--d-base) group-hover:text-white md:mt-0 md:text-[1rem]">
                  {p.body}
                </p>

                {/* индекс — данные, роль track-подписей: моно, «01»…«04» */}
                <p className="text-data hidden text-right text-[0.9375rem] text-ink-soft transition-colors duration-(--d-base) group-hover:text-white md:block">
                  {index}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
