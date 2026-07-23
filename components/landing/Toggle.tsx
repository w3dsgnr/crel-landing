"use client";

// Тумблер «ось-двоеточие»: services : platform. Двоеточие неподвижно и всегда --ink,
// курсор _ мгновенно перепрыгивает к активному слову (релокация через opacity),
// вес/цвет слов перетекают 200ms. Никакой скользящей пилюли (анти-Transak).
import { toggle } from "@/content/shared";
import type { LandingState } from "@/content/types";

interface ToggleProps {
  state: LandingState;
  onSwitch: (next: LandingState) => void;
}

function Word({
  word,
  active,
  onSelect,
}: {
  word: LandingState;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      className={`group flex items-baseline text-[0.875rem] lowercase outline-none transition-[color,font-weight] duration-(--d-quick) focus-visible:underline focus-visible:underline-offset-4 ${
        active ? "font-medium text-ink" : "font-normal text-ink-soft hover:text-ink"
      }`}
      style={{ transitionTimingFunction: "var(--ease-swap)" }}
    >
      {word}
      {/* курсор: ширина зарезервирована всегда — слова не двигаются */}
      <span
        aria-hidden
        className={`transition-opacity duration-(--d-quick) ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
      >
        _
      </span>
    </button>
  );
}

export function Toggle({ state, onSwitch }: ToggleProps) {
  const other: LandingState = state === "services" ? "platform" : "services";

  return (
    <div
      role="radiogroup"
      aria-label={toggle.ariaLabel}
      onKeyDown={(e) => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          onSwitch(other);
        }
      }}
      className="flex h-11 items-center rounded-(--radius-m) border border-line px-3 md:h-9"
    >
      <Word word="services" active={state === "services"} onSelect={() => onSwitch("services")} />
      {/* ось: двоеточие принадлежит системе, не словам */}
      <span aria-hidden className="mx-2 text-ink">
        :
      </span>
      <Word word="platform" active={state === "platform"} onSelect={() => onSwitch("platform")} />
    </div>
  );
}
