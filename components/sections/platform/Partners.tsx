// 04: partners — статичный грид логотипов-плейсхолдеров 4×2 + цитата (≤ 3 строк,
// атрибуция имя/роль/компания). Материалы — от Roman ([VERIFY]).
import { partners } from "@/content/platform";

export function Partners() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 pb-24 md:px-12 md:pb-36">
        <p className="text-label text-ink-soft">{partners.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{partners.section.title}</h2>
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4" data-reveal>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex h-20 items-center justify-center rounded-(--radius-m) bg-bg-alt text-label text-ink-soft"
            >
              [logo]
            </div>
          ))}
        </div>
        <blockquote data-reveal className="mt-16 max-w-[52ch]">
          <p className="text-[1.25rem] leading-snug">{partners.quote.text}</p>
          <footer className="mt-4 text-label text-ink-soft">{partners.quote.attribution}</footer>
        </blockquote>
      </div>
    </section>
  );
}
