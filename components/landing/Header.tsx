"use client";

// Шапка v4 — плавающая стеклянная капсула (glass-light, pill). Контент страницы
// просвечивает и размывается под ней: отделение средой, не линией (v3.2 §1).
// Анатомия: лого слева (c:rel_ в стиле «text type»: над hero полностью
// статично — ни мигания, ни печати; после скролла вниз курсор мигает и раз
// в ~5с слово стирается и печатается заново — useLogoCycle), якоря секций
// по центру капсулы, CTA-pill справа.
import { useEffect, useRef } from "react";
import { navAnchors, hero } from "@/content/shared";
import { useContactModal } from "@/components/contact/ContactModalProvider";
import { useTypewriter } from "@/lib/useTypewriter";
import { useLogoCycle } from "@/lib/useLogoCycle";

interface HeaderProps {
  scrolled: boolean;
}

// слово лого без курсора; SSG отдаёт его целиком — без пустой шапки до JS
const LOGO_WORD = "c:rel";

export function Header({ scrolled }: HeaderProps) {
  const { open } = useContactModal();
  const wordRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const typewriter = useTypewriter(wordRef, cursorRef);
  // цикл печати лого — только после скролла вниз (над hero лого статично)
  useLogoCycle(typewriter, LOGO_WORD, scrolled);
  // Мигание курсора — тоже только после скролла: над hero лого полностью
  // статично, включая «_». Класс правится мимо React (как и textContent —
  // машина печати сама тогглит .cursor-blink на паузах), поэтому эффект стоит
  // ПОСЛЕ useLogoCycle: при деактивации его cleanup делает skipTo (снова
  // включает blink), а этот эффект отрабатывает следом и гасит его.
  useEffect(() => {
    cursorRef.current?.classList.toggle("cursor-blink", scrolled);
  }, [scrolled]);
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6 md:pt-5">
      {/* капсула всегда в скоупе .layer-v4: акцент синий, ink — нейтральный
          чёрный, зелёных теней/glow v3 нет. Над чёрным hero (не проскроллено)
          капсула тёмная: glass-dark + инверсия ink-токенов (.layer-v4-invert)
          перекрашивает нав/CTA сами */}
      <div
        className={`layer-v4 relative mx-auto flex h-14 max-w-[1104px] items-center justify-between rounded-(--radius-pill) pr-2 pl-5 transition-shadow duration-(--d-quick) md:pr-2.5 md:pl-7 ${
          scrolled
            ? "glass-light shadow-[0_16px_48px_rgb(0_0_0/0.12)]"
            : "glass-dark layer-v4-invert"
        }`}
      >
        {/* inline-grid: невидимая копия полного лого держит ширину, чтобы
            стирание/печать не двигали соседей; живой текст лежит поверх в той же
            ячейке. aria-label — читалкам полное имя, а не полуслово. */}
        <a
          href="/"
          aria-label={`${LOGO_WORD}_`}
          className="inline-grid text-[1.15rem] font-bold tracking-[-0.02em]"
        >
          <span aria-hidden className="invisible col-start-1 row-start-1">
            {LOGO_WORD}_
          </span>
          <span aria-hidden className="col-start-1 row-start-1 whitespace-nowrap">
            {/* textContent правит машина печати мимо React — как в Hero */}
            <span ref={wordRef} suppressHydrationWarning>
              {LOGO_WORD}
            </span>
            {/* без .cursor-blink в SSR: над hero курсор статичен, класс
                включает эффект выше после скролла */}
            <span ref={cursorRef}>
              _
            </span>
          </span>
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

        {/* не якорь: CTA открывает модалку контакта (спека 2026-08-13
            §Точки подключения). cursor-pointer — компенсация preflight
            Tailwind v4: у <button> он не выставляется, у <a href> был. */}
        <button
          type="button"
          onClick={open}
          className="inline-flex h-10 cursor-pointer items-center rounded-(--radius-pill) bg-ink px-5 text-[0.8125rem] tracking-[0.08em] text-ink-invert lowercase transition-[box-shadow,transform,background-color] duration-(--d-quick) hover:-translate-y-px hover:bg-ink/90 hover:shadow-(--glow-m)"
        >
          {hero.ctaPrimary.replace("_", "")}
        </button>
      </div>
    </header>
  );
}
