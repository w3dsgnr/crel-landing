"use client";

// Тумблер «ось-двоеточие»: services : platform. Двоеточие неподвижно и всегда --ink,
// курсор _ мгновенно перепрыгивает к активному слову (релокация через opacity),
// вес/цвет слов перетекают 200ms. Никакой скользящей пилюли (анти-Transak).
import { toggle } from "@/content/shared";
import type { LandingState } from "@/content/types";

interface ToggleProps {
  selected: LandingState | null;
  onSwitch: (next: LandingState) => void;
}

function Word({
  word,
  active,
  focusable,
  onSelect,
}: {
  word: LandingState;
  active: boolean;
  focusable: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={focusable ? 0 : -1}
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
        className={`text-accent transition-opacity duration-(--d-quick) ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
      >
        _
      </span>
    </button>
  );
}

export function Toggle({ selected, onSwitch }: ToggleProps) {
  const other: LandingState = selected === "services" ? "platform" : "services";
  // До выбора ветки (selected === null) обе кнопки имели бы tabIndex=-1 —
  // тумблер выпадал бы из последовательности Tab целиком. Роль первого
  // слова как таб-стопа по умолчанию чинит это, не трогая aria-checked.
  const focusWord: LandingState = selected ?? "services";

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
      className="flex h-10 items-center rounded-(--radius-pill) bg-ink/[0.05] px-3.5 md:h-9"
    >
      <Word
        word="services"
        active={selected === "services"}
        focusable={focusWord === "services"}
        onSelect={() => onSwitch("services")}
      />
      {/* ось: двоеточие принадлежит системе, не словам */}
      <span aria-hidden className="mx-2 text-ink">
        :
      </span>
      <Word
        word="platform"
        active={selected === "platform"}
        focusable={focusWord === "platform"}
        onSelect={() => onSwitch("platform")}
      />
    </div>
  );
}
