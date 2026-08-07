"use client";

// Шапка v3 — плавающая стеклянная капсула (glass-light, pill). Контент страницы
// просвечивает и размывается под ней: отделение средой, не линией (v3.2 §1).
// Лого (статичный c:rel_, курсор НЕ мигает — живой курсор принадлежит hero),
// Toggle «ось-двоеточие», якоря состояния, CTA-pill. Каретка «Перепечатки» —
// на нижней кромке шапки, во всю ширину вьюпорта.
import type { RefObject } from "react";
import { navAnchors, hero } from "@/content/shared";
import type { LandingState } from "@/content/types";
import { Toggle } from "./Toggle";

interface HeaderProps {
  state: LandingState;
  onSwitch: (next: LandingState) => void;
  scrolled: boolean;
  caretRef: RefObject<HTMLDivElement | null>;
}

export function Header({ state, onSwitch, scrolled, caretRef }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6 md:pt-5">
      <div
        className={`glass-light relative mx-auto flex h-14 max-w-[1104px] items-center gap-3 rounded-(--radius-pill) pr-2 pl-5 transition-shadow duration-(--d-quick) md:gap-6 md:pr-2.5 md:pl-7 ${
          scrolled ? "shadow-[0_16px_48px_rgb(4_41_27/0.14)]" : ""
        }`}
      >
        <a href={`/${state}`} className="text-[1.15rem] font-bold tracking-[-0.02em]">
          c:rel<span className="inline-block">_</span>
        </a>

        <Toggle state={state} onSwitch={onSwitch} />

        <nav className="ml-auto hidden items-center gap-6 md:flex">
          {navAnchors[state].map((anchor) => (
            <a
              key={anchor}
              href={`#${anchor.replace(" ", "-")}`}
              className="text-[0.875rem] lowercase text-ink-soft underline-offset-[6px] decoration-2 transition-colors duration-200 hover:text-ink hover:underline hover:decoration-accent"
            >
              {anchor}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="ml-auto inline-flex h-10 items-center rounded-(--radius-pill) bg-ink px-5 text-[0.8125rem] tracking-[0.08em] text-ink-invert lowercase transition-[box-shadow,transform,background-color] duration-(--d-quick) hover:-translate-y-px hover:bg-ink/90 hover:shadow-(--glow-m) md:ml-0"
        >
          {hero[state].ctaPrimary.replace("_", "")}
        </a>
      </div>
      {/* каретка «Перепечатки»: 140×2px, проезжает по вьюпорту при переключении */}
      <div
        ref={caretRef}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-[140px] rounded-full bg-accent opacity-0"
      />
    </header>
  );
}
