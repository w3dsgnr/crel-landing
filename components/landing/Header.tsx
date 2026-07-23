"use client";

// Шапка: лого (статичный c:rel_, курсор НЕ мигает — живой курсор принадлежит hero),
// временный текстовый тумблер (заменяется на Toggle в И2), якоря, CTA.
import { navAnchors, toggle, hero } from "@/content/shared";
import type { LandingState } from "@/content/types";

interface HeaderProps {
  state: LandingState;
  onSwitch: (next: LandingState) => void;
  scrolled: boolean;
}

export function Header({ state, onSwitch, scrolled }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 h-16 transition-colors duration-150 ${
        scrolled ? "bg-bg border-b border-line" : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* caret-слот И2: линия-каретка «Перепечатки» рендерится под шапкой */}
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-8 px-5 md:px-12">
        <a href={`/${state}`} className="text-[1.15rem] font-bold tracking-[-0.02em]">
          c:rel<span className="inline-block">_</span>
        </a>

        {/* Временный тумблер И1 — только текст, без анимации. И2: Toggle.tsx */}
        <div
          role="radiogroup"
          aria-label={toggle.ariaLabel}
          className="flex items-center gap-2 rounded-(--radius-m) border border-line px-3 py-1.5"
        >
          {toggle.words.map((word) => (
            <button
              key={word}
              role="radio"
              aria-checked={state === word}
              onClick={() => onSwitch(word)}
              className={`text-[0.875rem] lowercase transition-colors duration-200 ${
                state === word ? "text-ink font-medium" : "text-ink-soft"
              }`}
            >
              {word}
              {state === word ? "_" : ""}
            </button>
          ))}
        </div>

        <nav className="ml-auto hidden items-center gap-6 md:flex">
          {navAnchors[state].map((anchor) => (
            <a
              key={anchor}
              href={`#${anchor.replace(" ", "-")}`}
              className="text-[0.875rem] lowercase text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              {anchor}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="rounded-(--radius-m) border border-ink px-4 py-2 text-[0.8125rem] tracking-[0.08em] lowercase transition-colors duration-200 hover:bg-ink hover:text-ink-invert"
        >
          {hero[state].ctaPrimary.replace("_", "")}
        </a>
      </div>
    </header>
  );
}
