// 02: services — bento 6 ячеек (2×3). Ровно 6 позиций = 6 ячеек.
// Ревизия «живые карточки»: мини-мокапы больше не статика — каждый играет
// свой микросценарий в общей очереди MockupStage (чек-лист, скан котировок,
// входящий платёж, операционная лента) и живёт idle-циклом.
import { servicesGrid } from "@/content/services";
import { StatusChecklist } from "@/components/mockups/StatusChecklist";
import { VendorCompare } from "@/components/mockups/VendorCompare";
import { OpsFeed } from "@/components/mockups/OpsFeed";
import { WalletFragment } from "@/components/mockups/WalletFragment";

export function ServicesGrid() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 pb-28 md:px-12 md:pb-40">
        <p className="text-label text-ink-soft">{servicesGrid.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{servicesGrid.section.title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {servicesGrid.cells.map((cell) => {
            // Цвет v2: одна «живая» ячейка (лицензирование) — градиентное окно
            // с плавающим белым статус-мокапом; остальные плоские (тон + 1px).
            const isSignal = cell.title === "Licensing and compliance";
            return (
              <div
                key={cell.title}
                data-reveal
                className={`rounded-(--radius-l) p-8 transition-transform duration-(--d-quick) hover:-translate-y-0.5 ${
                  isSignal
                    ? "grad-window-signal text-ink-invert"
                    : "border border-line bg-bg-alt"
                }`}
              >
                <h3 className="text-card-title">{cell.title}</h3>
                <p className={`mt-4 text-[0.9375rem] leading-relaxed ${isSignal ? "text-ink-invert/70" : "text-ink-soft"}`}>
                  {cell.body}
                </p>
                {"miniMockup" in cell && cell.miniMockup && <StatusChecklist rows={cell.miniMockup} className="mt-8" />}
                {"hasUiFragment" in cell && cell.hasUiFragment && <WalletFragment className="mt-8" />}
                {"miniCompare" in cell && cell.miniCompare && <VendorCompare rows={cell.miniCompare} className="mt-8" />}
                {"statusFeed" in cell && cell.statusFeed && <OpsFeed rows={cell.statusFeed} className="mt-8" />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
