// 04: how we work — сетка 3-up фич-карточек по docs/refs/approach-hover/design.md:
// слой v4, центрированный H2 без лейбла секции (решение 2026-08-13), плиты
// bg-mist с линейным глифом сверху и текстом у нижней кромки. Статика полностью
// ахроматична; единственный жест — hover-рампа отдельным absolute-слоем
// (background не анимируется — ведём opacity) + инверсия текста в белый.
// Иконка НЕ инвертируется: верх рампы светлый, тёмный штрих читается.
import type { ReactNode } from "react";
import { approach } from "@/content/services";

// словарь линейных глифов 40px: чертёжная геометрия штрихом 1.5 (грамматика
// UseCases), метка принципа, не иллюстрация; ключи = id принципов
const ICONS: Record<string, ReactNode> = {
  // лупа: аудит смотрит в реальность до архитектуры
  audit: (
    <>
      <circle cx="17" cy="17" r="9.25" />
      <path d="M23.75 23.75 32 32" />
    </>
  ),
  // три источника сходятся в один узел: fan-in резервирования
  "multi-provider": (
    <>
      <circle cx="9" cy="9.5" r="2.25" />
      <circle cx="9" cy="20" r="2.25" />
      <circle cx="9" cy="30.5" r="2.25" />
      <circle cx="30" cy="20" r="3.25" />
      <path d="M11.5 10.5 26.75 18.5M11.75 20h14.5M11.5 29.5l15.25-8" />
    </>
  ),
  // щит с галкой: комплаенс встроен в контур, не навешен после
  compliance: (
    <>
      <path d="M20 5.5 31.5 10v8.5c0 7.6-4.9 12.7-11.5 15.9C13.4 31.2 8.5 26.1 8.5 18.5V10Z" />
      <path d="m14.75 19.5 3.75 3.75 6.75-7.25" />
    </>
  ),
};

export function Approach() {
  return (
    <section className="layer-v4 bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        <h2 className="text-h2 mx-auto max-w-[20ch] text-center">{approach.section.title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-5 md:mt-20 md:grid-cols-3 md:gap-6">
          {approach.principles.map((p) => (
            <div
              key={p.id}
              data-reveal
              className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-(--radius-xl) bg-bg-mist p-8 transition-transform duration-(--d-base) ease-(--ease-out-expo) motion-safe:hover:-translate-y-1.5 md:min-h-[420px]"
            >
              {/* рампа живёт только под курсором: слой поверх заливки, opacity 0→1 */}
              <div
                aria-hidden
                className="grad-approach-hover absolute inset-0 opacity-0 transition-opacity duration-(--d-base) ease-(--ease-out-expo) group-hover:opacity-100"
              />
              <svg
                viewBox="0 0 40 40"
                className="relative h-10 w-10 text-ink"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {ICONS[p.id]}
              </svg>
              {/* иерархия label/body — цветом при одном кегле (анатомия референса) */}
              <div className="relative mt-auto pt-10">
                <p className="text-[1.0625rem] leading-snug text-ink-soft transition-colors duration-(--d-base) group-hover:text-white">
                  {p.title}
                </p>
                <p className="mt-1.5 max-w-[30ch] text-[1.0625rem] leading-[1.45] transition-colors duration-(--d-base) group-hover:text-white">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
