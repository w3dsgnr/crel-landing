"use client";

// 03: licensing — pinned-момент Services. Sticky-stack по каноническому скелету:
// start "top top", pin, pinSpacing off; уходящая карточка scale 0.92 + opacity 0.55
// scrub-ом по приходу следующей. Пин только desktop + no-reduced-motion
// (gsap.matchMedia); иначе — простые карточки, reveal делает своё.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { licensing } from "@/content/services";

export function LicensingStack() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".lic-card", root);
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cards[cards.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        // Уходящая карточка остаётся НЕПРОЗРАЧНОЙ: сжатие + скрим цвета фона
        // секции поверх (никакого element-opacity — без грязного просвечивания).
        const scrim = card.querySelector(".lic-scrim");
        const trigger = {
          trigger: cards[i + 1],
          start: "top bottom",
          end: "top top",
          scrub: true,
        };
        gsap.to(card, { scale: 0.92, ease: "none", scrollTrigger: trigger });
        if (scrim) {
          gsap.to(scrim, { opacity: 0.55, ease: "none", scrollTrigger: { ...trigger } });
        }
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="bg-bg-alt">
      <div className="mx-auto max-w-[1200px] px-5 pt-28 md:px-12 md:pt-40">
        <p className="text-label text-ink-soft">{licensing.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[18ch]">{licensing.section.title}</h2>
      </div>
      <div ref={rootRef} className="pb-24 md:pb-0">
        {licensing.cards.map((card) => (
          <div
            key={card.title}
            className="lic-card flex items-center px-5 py-6 md:min-h-[100dvh] md:px-12 md:py-0"
          >
            <div className="mx-auto w-full max-w-[1200px]">
              <div className="relative overflow-hidden rounded-(--radius-l) bg-bg p-8 md:p-14">
                {/* скрим: гасит уходящую карточку цветом фона секции (см. эффект выше) */}
                <div aria-hidden className="lic-scrim pointer-events-none absolute inset-0 bg-bg-alt opacity-0" />
                {/* единственный CLI-акцент экрана — статус-строка трека */}
                <p className="text-label text-ink-soft">{card.track}</p>
                <h3 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.01em]">
                  {card.title}
                </h3>
                <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-soft">
                  {card.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
