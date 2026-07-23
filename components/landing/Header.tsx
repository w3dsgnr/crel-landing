"use client";

// Шапка: лого (статичный c:rel_, курсор НЕ мигает — живой курсор принадлежит hero),
// Toggle «ось-двоеточие», якоря состояния, CTA. Внизу — слот каретки «Перепечатки».
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
    <header
      className={`sticky top-0 z-40 h-16 transition-colors duration-150 ${
        scrolled ? "bg-bg border-b border-line" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-4 px-5 md:gap-8 md:px-12">
        <a href={`/${state}`} className="text-[1.15rem] font-bold tracking-[-0.02em]">
          c:rel<span className="inline-block">_</span>
        </a>

        <Toggle state={state} onSwitch={onSwitch} />

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
          className="hidden rounded-(--radius-m) border border-ink px-4 py-2 text-[0.8125rem] tracking-[0.08em] lowercase transition-colors duration-200 hover:bg-ink hover:text-ink-invert md:inline-flex"
        >
          {hero[state].ctaPrimary.replace("_", "")}
        </a>
      </div>
      {/* каретка «Перепечатки»: 140×2px, проезжает при переключении состояний */}
      <div
        ref={caretRef}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-[140px] bg-accent opacity-0"
      />
    </header>
  );
}
