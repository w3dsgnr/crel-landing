// 04: cases — сетка 2fr/1fr (не повторяет bento-семью 02): featured + 3 компактных.
// Плейсхолдеры до материалов Roman; цифры только из подтверждённых кейсов.
import { cases } from "@/content/services";

export function Cases() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        <p className="text-label text-ink-soft">{cases.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{cases.section.title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div
            data-reveal
            className="flex min-h-[320px] flex-col justify-between rounded-(--radius-l) bg-bg-alt p-8 md:col-span-2 md:p-10"
          >
            <p className="text-label text-ink-soft">{cases.featured.client}</p>
            <div>
              <p className="text-card-title max-w-[28ch]">{cases.featured.task}</p>
              <p className="mt-4 text-[0.9375rem] text-ink-soft">{cases.featured.result}</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {cases.compact.map((c, i) => (
              <div key={i} data-reveal className="flex-1 rounded-(--radius-l) bg-bg-alt p-6">
                <p className="text-label text-ink-soft">{c.client}</p>
                <p className="mt-3 text-[0.9375rem]">{c.task}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
