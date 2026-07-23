// Лента логотипов. Адаптация идеи React Bits LogoLoop, переписана на CSS-keyframes:
// у оригинала rAF-цикл и градиентные fade-маски по краям — маски убраны (резкий
// крой Crel), движение отдано композитору (transform-only, нулевой JS-бюджет).
// Пауза на hover, reduced-motion — статичный ряд (globals.css).
import type { ReactNode } from "react";

export function LogoLoop({ items }: { items: ReactNode[] }) {
  // два прохода подряд для бесшовного цикла (-50% translateX)
  const strip = (key: string, hidden: boolean) => (
    <div key={key} aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-6 pr-6">
      {items.map((item, i) => (
        <div key={i} className="opacity-60 grayscale transition-opacity duration-(--d-quick) hover:opacity-100">
          {item}
        </div>
      ))}
    </div>
  );
  return (
    <div className="logo-marquee-wrap overflow-hidden">
      <div className="logo-marquee flex w-max">
        {strip("a", false)}
        {strip("b", true)}
      </div>
    </div>
  );
}
