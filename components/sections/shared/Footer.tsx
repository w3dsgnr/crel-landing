// Футер — общий, без анимаций. Юр. строка и комплаенс-полоса — видимые
// [VERIFY]-плейсхолдеры до credentials от Roman (content.md).
import { footer } from "@/content/shared";

export function Footer() {
  return (
    <footer className="border-t border-ink-invert/15 bg-ink text-ink-invert">
      <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <p className="text-[1.05rem] font-bold tracking-[-0.02em]">c:rel_</p>
          <div className="max-w-[52ch] text-[0.8125rem] leading-relaxed text-ink-invert/60">
            <p>{footer.legal}</p>
            <p className="mt-2">{footer.complianceStrip}</p>
          </div>
          <a
            href={`mailto:${footer.email}`}
            className="text-[0.875rem] lowercase tracking-[0.12em] text-ink-invert/80 transition-colors duration-200 hover:text-ink-invert"
          >
            {footer.email}
          </a>
        </div>
        {/* /55 вместо /40: контраст мелкого текста на --ink должен проходить AA */}
        <p className="mt-10 text-[0.75rem] text-ink-invert/55">{footer.copyright}</p>
      </div>
    </footer>
  );
}
