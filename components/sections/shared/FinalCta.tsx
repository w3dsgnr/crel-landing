// Финальный CTA — кульминация драматургии цвета (Цвет v2 §вопрос 3). Два варианта
// под демо, переключаются одной константой ниже:
//   A «Сдержанный» — тёмная плоскость --ink + зелёный вольтаж в курсоре (дефолт).
//   B «Заряд»      — полная градиентная заливка --grad-cta, текст на тёмных 2/3.
// Оболочка и контент общие (анатомия «Перепечатки»); один CTA-интент на страницу.
import { finalCta } from "@/content/shared";
import type { LandingState } from "@/content/types";

// демо-флаг: "A" (сдержанный, шип-дефолт) | "B" (заряд, градиентный финал)
const CTA_VARIANT: "A" | "B" = "A";

function DarkCta({ label, primary }: { label: string; primary: boolean }) {
  const text = label.endsWith("_") ? label.slice(0, -1) : label;
  const hasCursor = label.endsWith("_");
  return (
    <a
      href="mailto:info@crel.ch"
      className={`group inline-flex items-baseline rounded-(--radius-m) px-6 py-3 text-[0.8125rem] lowercase tracking-[0.08em] transition-colors duration-(--d-quick) ${
        primary
          ? "bg-ink-invert text-ink hover:bg-ink-invert/90"
          : "border border-ink-invert/40 text-ink-invert hover:border-ink-invert"
      }`}
    >
      {text}
      {/* зелёный вольтаж «живого» — единственный цвет на кнопке-курсоре */}
      {hasCursor && (
        <span aria-hidden className="text-accent-bright opacity-0 transition-opacity duration-(--d-quick) group-hover:opacity-100">
          _
        </span>
      )}
    </a>
  );
}

export function FinalCta({ state }: { state: LandingState }) {
  const c = finalCta[state];
  const isCharged = CTA_VARIANT === "B";
  return (
    <section
      id="contact"
      className={`text-ink-invert ${isCharged ? "grad-cta" : "bg-ink"}`}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        {/* вариант B: текст держим на тёмных 2/3, зелёный блик уходит в дальний угол */}
        <div className={isCharged ? "md:max-w-[62%]" : ""}>
          <h2 data-reveal className="text-h2 max-w-[18ch]">
            {c.title}
          </h2>
          <p data-reveal className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-ink-invert/60">
            {c.sub}
          </p>
          <div data-reveal className="mt-10 flex flex-wrap items-center gap-4">
            <DarkCta label={c.ctaPrimary} primary />
            {c.ctaSecondary && <DarkCta label={c.ctaSecondary} primary={false} />}
          </div>
        </div>
      </div>
    </section>
  );
}
