// 02: services — bento 6 ячеек (2×3). Ровно 6 позиций = 6 ячеек.
// Разнообразие фонов: ячейка лицензирования — мини-мокап статусов,
// ячейка mobile — фрагмент UI на --surface (единственные тени — у мокапов).
import { servicesGrid } from "@/content/services";

function StatusMiniMockup({ rows }: { rows: { label: string; chip: string }[] }) {
  return (
    <div
      aria-hidden
      className="mt-8 rounded-(--radius-xl) bg-surface p-4 shadow-(--shadow-mockup)"
    >
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between py-2 text-[0.8125rem] lowercase not-last:border-b not-last:border-line"
        >
          <span className="text-ink-soft">{r.label}</span>
          <span className="rounded-(--radius-s) border border-line px-2 py-0.5 text-[0.75rem]">
            {r.chip}
          </span>
        </div>
      ))}
    </div>
  );
}

function MobileUiFragment() {
  // декоративный фрагмент интерфейса мобильного приложения (right-bleed крой)
  return (
    <div aria-hidden className="relative mt-8 h-[132px] overflow-hidden">
      <div className="absolute left-0 top-0 w-[115%] rounded-(--radius-xl) bg-surface p-4 shadow-(--shadow-mockup)">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.75rem] lowercase text-ink-soft">balance</span>
          <span className="text-[1.25rem] font-medium tabular-nums">1 480.00</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-(--radius-m) bg-ink px-3 py-2 text-center text-[0.75rem] lowercase text-ink-invert">
            send
          </div>
          <div className="rounded-(--radius-m) border border-line px-3 py-2 text-center text-[0.75rem] lowercase">
            receive
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServicesGrid() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 pb-24 md:px-12 md:pb-36">
        <p className="text-label text-ink-soft">{servicesGrid.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{servicesGrid.section.title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {servicesGrid.cells.map((cell) => (
            <div
              key={cell.title}
              data-reveal
              className="rounded-(--radius-l) bg-bg-alt p-8 transition-transform duration-(--d-quick) hover:-translate-y-0.5"
            >
              <h3 className="text-card-title">{cell.title}</h3>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{cell.body}</p>
              {"miniMockup" in cell && cell.miniMockup && <StatusMiniMockup rows={cell.miniMockup} />}
              {"hasUiFragment" in cell && cell.hasUiFragment && <MobileUiFragment />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
