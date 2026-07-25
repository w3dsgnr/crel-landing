"use client";

// Карты (virtual + plastic): CSS-версия (фото-ассет — вторая итерация, вне плана И4).
// Ревизия «живые карточки»: в свой такт очереди plastic-карта приподнимается и
// садится — тот же жест, что прежний hover (transform-only). Без 3D-tilt/шиммера.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { mockups } from "@/content/platform";
import { useMockupStage } from "./MockupStage";
import { ensureEases } from "@/lib/easing";

export function CardDuo() {
  const { stage, complete } = useMockupStage();
  const plasticRef = useRef<HTMLDivElement>(null);
  const m = mockups.cards;

  useEffect(() => {
    if (stage !== "play" || !plasticRef.current) return;
    ensureEases();
    const tl = gsap.timeline({ onComplete: complete });
    tl.to(plasticRef.current, { y: -5, duration: 0.35, ease: "crelOut" })
      .to(plasticRef.current, { y: 0, duration: 0.45, ease: "crelSwap" }, "+=0.4");
    return () => {
      tl.kill();
      gsap.set(plasticRef.current, { y: 0 }); // срыв прогона — карта на месте
    };
  }, [stage, complete]);

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
        {/* plastic — залитая --ink, впереди; зоны настоящей карты:
            бренд ↖, контурный чип слева-в-середине, PAN группами ↙, expiry ↘.
            Подъём ведёт GSAP (такт очереди), CSS-hover с узла снят. */}
        <div
          ref={plasticRef}
          className="absolute bottom-0 left-0 aspect-[1.586] w-[72%] rounded-(--radius-l) bg-ink p-3 text-ink-invert"
        >
          <p className="text-[0.9375rem] font-medium lowercase">{m.plasticBrand}</p>
          <div aria-hidden className="absolute left-3 top-[42%] h-5 w-7 rounded-(--radius-s) border border-ink-invert/40">
            <div className="mx-auto mt-[7px] h-px w-4 bg-ink-invert/40" />
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between tabular-nums">
            <span className="text-[0.8125rem] tracking-[0.14em]">{m.plasticPan}</span>
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
