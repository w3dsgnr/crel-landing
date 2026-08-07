"use client";

// 03: licensing — sticky-stack на vendored ScrollStack (React Bits, кастомизация
// v3 в components/vendor/ScrollStack.tsx: без собственного Lenis, чистый cleanup
// при «Перепечатке»). Прежняя GSAP-пин-реализация снята.
// Карточки: белые r-2xl с мягким зелёным лифтом; финальный трек — grad-abyss
// (кульминация стека). Статус-трек — стеклянная пилюля со светящейся точкой (v3.7),
// не голая CLI-строка.
import ScrollStack, { ScrollStackItem } from "@/components/vendor/ScrollStack";
import { licensing } from "@/content/services";

function TrackPill({ label, onDark }: { label: string; onDark: boolean }) {
  return (
    <p
      className={`inline-flex items-center gap-2.5 self-start rounded-(--radius-pill) px-4 py-2 text-label ${
        onDark ? "glass-tint text-ink-invert" : "bg-bg-mist text-pine-600"
      }`}
    >
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${onDark ? "dot-live-bright bg-accent-bright" : "dot-live bg-accent"}`}
      />
      {label}
    </p>
  );
}

export function LicensingStack() {
  const last = licensing.cards.length - 1;
  return (
    <section className="bg-bg-alt">
      <div className="mx-auto max-w-[1200px] px-5 pt-28 md:px-12 md:pt-40">
        <p className="text-label text-pine-600">{licensing.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[18ch]">{licensing.section.title}</h2>
      </div>
      <div className="mx-auto max-w-[1200px] px-5 pt-16 md:px-12 md:pt-20">
        <ScrollStack
          itemDistance={56}
          itemScale={0.03}
          itemStackDistance={14}
          stackPosition="16%"
          scaleEndPosition="8%"
          baseScale={0.9}
        >
          {licensing.cards.map((card, i) => {
            const onDark = i === last;
            return (
              <ScrollStackItem
                key={card.title}
                itemClassName={`rounded-(--radius-2xl) p-8 md:p-14 min-h-[360px] flex flex-col justify-center ${
                  onDark
                    ? "grad-abyss text-ink-invert"
                    : "bg-bg shadow-(--glow-soft)"
                }`}
              >
                <TrackPill label={card.track} onDark={onDark} />
                <h3 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.01em]">
                  {card.title}
                </h3>
                <p
                  className={`mt-6 max-w-[52ch] text-[1.0625rem] leading-relaxed ${
                    onDark ? "text-ink-invert/70" : "text-ink-soft"
                  }`}
                >
                  {card.body}
                </p>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>
      </div>
    </section>
  );
}
