// Финальный CTA — тёмная плоскость --ink, инверсия. Контент по состоянию,
// оболочка общая (анатомия «Перепечатки»: каркас persistent, текст сменный).
// Один CTA-интент на страницу: «Talk to us_» (hover подставляет курсор).
import { finalCta } from "@/content/shared";
import type { LandingState } from "@/content/types";

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
      {hasCursor && (
        <span aria-hidden className="opacity-0 transition-opacity duration-(--d-quick) group-hover:opacity-100">
          _
        </span>
      )}
    </a>
  );
}

export function FinalCta({ state }: { state: LandingState }) {
  const c = finalCta[state];
  return (
    <section id="contact" className="bg-ink text-ink-invert">
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:px-12 md:py-36">
        <h2 data-reveal className="text-h2 max-w-[18ch]">
          {c.title}
        </h2>
        <p data-reveal className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-ink-invert/60">
          {c.sub}
        </p>
        <div data-reveal className="mt-10 flex items-center gap-4">
          <DarkCta label={c.ctaPrimary} primary />
          {c.ctaSecondary && <DarkCta label={c.ctaSecondary} primary={false} />}
        </div>
      </div>
    </section>
  );
}
