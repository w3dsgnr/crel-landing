// Временная заглушка секции для И1. Заменяется реальными секциями в И3/И4.
import type { SectionCopy } from "@/content/types";

export function makeStub(copy: SectionCopy) {
  function StubSection() {
    return (
      <section className="bg-bg-alt">
        <div className="mx-auto max-w-[1200px] px-5 md:px-12 py-24 md:py-32">
          <p className="text-label text-ink-soft">{copy.label}</p>
          <h2 className="text-h2 mt-6 max-w-[18ch]">{copy.title}</h2>
        </div>
      </section>
    );
  }
  StubSection.displayName = `Stub(${copy.label})`;
  return StubSection;
}
