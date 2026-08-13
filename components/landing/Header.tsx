"use client";

// Шапка v4 — плавающая стеклянная капсула (glass-light, pill). Контент страницы
// просвечивает и размывается под ней: отделение средой, не линией (v3.2 §1).
// Анатомия: лого слева (статичный c:rel_, курсор НЕ мигает — живой курсор
// принадлежит hero), якоря секций по центру капсулы, CTA-pill справа.
import { navAnchors, hero } from "@/content/shared";

interface HeaderProps {
  scrolled: boolean;
}

export function Header({ scrolled }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6 md:pt-5">
      {/* над чёрным hero (не проскроллено) капсула тёмная: glass-dark +
          инверсия ink-токенов (.layer-v4-invert) перекрашивает нав/CTA сами */}
      <div
        className={`relative mx-auto flex h-14 max-w-[1104px] items-center justify-between rounded-(--radius-pill) pr-2 pl-5 transition-shadow duration-(--d-quick) md:pr-2.5 md:pl-7 ${
          scrolled
            ? "glass-light shadow-[0_16px_48px_rgb(4_41_27/0.14)]"
            : "glass-dark layer-v4-invert"
        }`}
      >
        <a href="/" className="text-[1.15rem] font-bold tracking-[-0.02em]">
          c:rel<span className="inline-block">_</span>
        </a>

        {/* абсолютное центрирование: якоря стоят по оси капсулы независимо
            от ширины лого и CTA */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex">
          {navAnchors.map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-[0.875rem] lowercase text-ink-soft underline-offset-[6px] decoration-2 transition-colors duration-200 hover:text-ink hover:underline hover:decoration-accent"
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="inline-flex h-10 items-center rounded-(--radius-pill) bg-ink px-5 text-[0.8125rem] tracking-[0.08em] text-ink-invert lowercase transition-[box-shadow,transform,background-color] duration-(--d-quick) hover:-translate-y-px hover:bg-ink/90 hover:shadow-(--glow-m)"
        >
          {hero.ctaPrimary.replace("_", "")}
        </a>
      </div>
    </header>
  );
}
