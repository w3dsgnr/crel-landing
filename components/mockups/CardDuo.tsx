// Карты (virtual + plastic): CSS-версия (фото-ассет — вторая итерация, вне плана И4).
// Статика: без stage; hover верхней карты — единственная жизнь. Без 3D-tilt/шиммера.
import { mockups } from "@/content/platform";

export function CardDuo() {
  const m = mockups.cards;
  return (
    <div className="p-5">
      <div className="relative h-[150px]">
        {/* virtual — контурная, позади */}
        <div className="absolute right-0 top-0 aspect-[1.586] w-[72%] rounded-(--radius-l) border border-line bg-bg-alt p-3">
          <div className="flex items-start justify-between">
            <span className="rounded-(--radius-s) border border-line px-1.5 py-0.5 text-[0.6875rem] lowercase">
              {m.virtualTag}
            </span>
          </div>
          <p className="absolute bottom-3 left-3 text-[0.8125rem] tabular-nums text-ink-soft">
            {m.virtualPan}
          </p>
        </div>
        {/* plastic — залитая --ink, впереди */}
        <div className="absolute bottom-0 left-0 aspect-[1.586] w-[72%] rounded-(--radius-l) bg-ink p-3 text-ink-invert transition-transform duration-(--d-quick) hover:-translate-y-1">
          <p className="text-[0.9375rem] font-medium lowercase">{m.plasticBrand}</p>
          <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-[0.8125rem] tabular-nums">
            <span>{m.plasticPan}</span>
            <span className="text-[0.6875rem] opacity-70">{m.plasticExpiry}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {m.chips.map((c) => (
          <span key={c} className="rounded-(--radius-s) border border-line px-2 py-0.5 text-[0.75rem]">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
