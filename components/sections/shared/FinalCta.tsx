// Финальный CTA v3 — полноширинная «уверенная заливка» --grad-signal с pine-тенью
// из угла текста: белый display живёт на тёмной зоне, насыщенный край уходит
// от текста (транспозиция правила OnRamper «цвет уводится от текста»).
// Развилка A/B v2 снята решением v3. Один CTA-интент на страницу.
import { finalCta } from "@/content/shared";
import type { LandingState } from "@/content/types";

function CtaButton({ label, primary }: { label: string; primary: boolean }) {
  const text = label.endsWith("_") ? label.slice(0, -1) : label;
  const hasCursor = label.endsWith("_");
  return (
    <a
      href="mailto:info@crel.ch"
      className={`group inline-flex items-baseline rounded-(--radius-pill) px-7 py-3.5 text-[0.8125rem] lowercase tracking-[0.08em] transition-[background-color,box-shadow,transform] duration-(--d-quick) hover:-translate-y-px ${
        primary
          ? "bg-ink-invert text-ink hover:bg-ink-invert/90 hover:shadow-[0_12px_40px_rgb(4_21_14/0.35)]"
          : "glass-tint text-ink-invert hover:bg-white/20"
      }`}
    >
      {text}
      {/* вольтаж «живого» — единственный цветной знак на кнопке */}
      {hasCursor && (
        <span
          aria-hidden
          className={`opacity-0 transition-opacity duration-(--d-quick) group-hover:opacity-100 ${
            primary ? "text-accent" : "text-accent-bright"
          }`}
        >
          _
        </span>
      )}
    </a>
  );
}

export function FinalCta({ state }: { state: LandingState }) {
  const c = finalCta[state];
  return (
    <section id="contact" className="grad-cta-signal text-ink-invert">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        {/* текст держим на тёмных 2/3; насыщенный teal-край — в дальнем углу */}
        <div className="md:max-w-[62%]">
          <h2 data-reveal className="text-h2 max-w-[18ch]">
            {c.title}
          </h2>
          <p data-reveal className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-ink-invert/75">
            {c.sub}
          </p>
          <div data-reveal className="mt-10 flex flex-wrap items-center gap-4">
            <CtaButton label={c.ctaPrimary} primary />
            {c.ctaSecondary && <CtaButton label={c.ctaSecondary} primary={false} />}
          </div>
        </div>
      </div>
    </section>
  );
}
