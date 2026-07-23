// 01: approach — вертикальный стек: H2 + 3 принципа строками с хайрлайнами.
// Не карточки: разделение тоном и линиями (design-direction, принцип 6).
import { approach } from "@/content/services";

export function Approach() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        <p className="text-label text-ink-soft">{approach.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{approach.section.title}</h2>
        <div className="mt-16 md:mt-20">
          {approach.principles.map((p) => (
            <div
              key={p.title}
              data-reveal
              className="grid grid-cols-1 gap-3 border-t border-line py-8 md:grid-cols-12 md:gap-6 md:py-10"
            >
              <h3 className="text-card-title md:col-span-5">{p.title}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-ink-soft md:col-span-6 md:col-start-7 max-w-[52ch]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
