"use client";

// 03: licensing — sticky-stack на vendored ScrollStack (React Bits, кастомизация
// v3 в components/vendor/ScrollStack.tsx: без собственного Lenis, чистый cleanup
// при «Перепечатке»). Прежняя GSAP-пин-реализация снята.
// Слой v4 (редизайн 2026-08-13): чёрная лента layer-v4-invert (как Hero и
// UseCases), карточки — белые «документы» с нейтральной тенью-отсечкой и
// гигантским призрачным водяным знаком регуляции в нижнем-правом углу (mark
// из content/services). Единый вид у всех четырёх — стопка документов и есть
// кульминация; прежняя тёмная grad-abyss-карточка снята. Трек-пилюля — моно
// на поле v4 bg-alt со светящейся синей точкой (акцент #2e7cf6).
import ScrollStack, { ScrollStackItem } from "@/components/vendor/ScrollStack";
import { licensing } from "@/content/services";

function TrackPill({ label }: { label: string }) {
  return (
    <p className="text-data inline-flex items-center gap-2.5 self-start rounded-(--radius-pill) bg-bg-alt px-4 py-2 text-[0.8125rem] tracking-[0.02em] lowercase text-ink-soft">
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-accent"
        style={{ boxShadow: "0 0 0 3px rgb(46 124 246 / 0.16), 0 0 10px rgb(46 124 246 / 0.5)" }}
      />
      {label}
    </p>
  );
}

export function LicensingStack() {
  return (
    <section className="layer-v4 layer-v4-invert bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 pt-28 md:px-12 md:pt-40">
        <p className="text-label text-ink-soft">{licensing.section.label}</p>
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
          {licensing.cards.map((card) => (
            <ScrollStackItem
              key={card.title}
              // isolate: водяной знак уходит на -z-10 — над фоном карточки,
              // под текстом; тень нейтральная — отделяет белые края в стопке
              itemClassName="bg-surface isolate overflow-hidden rounded-(--radius-2xl) p-8 md:p-14 min-h-[360px] flex flex-col justify-center shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
            >
              <span
                aria-hidden
                className="text-data pointer-events-none absolute -right-2 -bottom-9 -z-10 text-[clamp(4.5rem,9vw,7.5rem)] font-medium tracking-[-0.04em] whitespace-nowrap select-none"
                style={{ color: "rgb(29 29 31 / 0.05)" }}
              >
                {card.mark}
              </span>
              <TrackPill label={card.track} />
              <h3 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.01em]">
                {card.title}
              </h3>
              <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-soft">
                {card.body}
              </p>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}
