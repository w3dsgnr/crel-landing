"use client";

// 02: services — bento v3 на Magic Bento (vendored): 6 позиций, чередование
// заливок по OnRamper (~каждая вторая цветная), одна abyss-плитка — якорь секции.
// Живые мини-мокапы остаются (сами оборачиваются в MockupStage и белыми парят
// на любой заливке); генеративный ассет — плейсхолдер до финальной серии.
import { servicesGrid } from "@/content/services";
import { BentoGrid, BentoCard } from "@/components/vendor/MagicBento";
import { StatusChecklist } from "@/components/mockups/StatusChecklist";
import { VendorCompare } from "@/components/mockups/VendorCompare";
import { OpsFeed } from "@/components/mockups/OpsFeed";
import { WalletFragment } from "@/components/mockups/WalletFragment";

type Cell = (typeof servicesGrid.cells)[number];

function cellByTitle(title: string): Cell {
  const cell = servicesGrid.cells.find((c) => c.title === title);
  if (!cell) throw new Error(`services cell not found: ${title}`);
  return cell;
}

function MiniMockup({ cell, className = "" }: { cell: Cell; className?: string }) {
  if ("miniMockup" in cell && cell.miniMockup) return <StatusChecklist rows={cell.miniMockup} className={className} />;
  if ("hasUiFragment" in cell && cell.hasUiFragment) return <WalletFragment className={className} />;
  if ("miniCompare" in cell && cell.miniCompare) return <VendorCompare rows={cell.miniCompare} className={className} />;
  if ("statusFeed" in cell && cell.statusFeed) return <OpsFeed rows={cell.statusFeed} className={className} />;
  return null;
}

export function ServicesGrid() {
  const implementation = cellByTitle("Platform implementation");
  const architecture = cellByTitle("Architecture consulting");
  const licensing = cellByTitle("Licensing and compliance");
  const vendors = cellByTitle("Vendor selection");
  const mobile = cellByTitle("Mobile apps");
  const support = cellByTitle("Ongoing support");

  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 pb-28 md:px-12 md:pb-40">
        <p className="text-label text-pine-600">{servicesGrid.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{servicesGrid.section.title}</h2>

        <BentoGrid className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* ряд 1: светлая ↔ широкая уверенная заливка с ассетом */}
          <div data-reveal>
            <BentoCard className="h-full rounded-(--radius-xl) bg-bg-mist">
              <div className="flex h-full flex-col p-8">
                <h3 className="text-card-title">{implementation.title}</h3>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{implementation.body}</p>
                <MiniMockup cell={implementation} className="mt-8" />
              </div>
            </BentoCard>
          </div>
          <div data-reveal className="md:col-span-2">
            <BentoCard className="grad-signal h-full rounded-(--radius-xl)">
              <div className="relative flex h-full flex-col justify-end p-8 md:p-10">
                {/* ассет-плейсхолдер: окно-кадр, обрезан верхним краем плитки */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-10 right-8 hidden h-[70%] w-[42%] select-none overflow-hidden rounded-(--radius-m) opacity-95 md:block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/approach/rails.png" alt="" className="h-full w-full object-cover" />
                </div>
                <div className="text-ink-forest md:max-w-[52%]">
                  <h3 className="text-[clamp(1.75rem,2.6vw,2.25rem)] font-medium tracking-[-0.01em]">
                    {architecture.title}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-forest/85">{architecture.body}</p>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* ряд 2: тёмный abyss-якорь (единственный на секцию) ↔ светлая */}
          <div data-reveal className="md:col-span-2">
            <BentoCard className="grad-abyss h-full rounded-(--radius-xl) text-ink-invert">
              <div className="grid h-full grid-cols-1 items-center gap-8 p-8 md:grid-cols-2 md:p-10">
                <div>
                  <h3 className="text-card-title">{licensing.title}</h3>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-invert/70">{licensing.body}</p>
                </div>
                <div className="w-full max-w-[360px] md:justify-self-end">
                  <MiniMockup cell={licensing} />
                </div>
              </div>
            </BentoCard>
          </div>
          <div data-reveal>
            <BentoCard className="h-full rounded-(--radius-xl) bg-bg-mist">
              <div className="flex h-full flex-col p-8">
                <h3 className="text-card-title">{vendors.title}</h3>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{vendors.body}</p>
                <MiniMockup cell={vendors} className="mt-8" />
              </div>
            </BentoCard>
          </div>

          {/* ряд 3: светящаяся halo ↔ широкая светлая */}
          <div data-reveal>
            <BentoCard className="grad-halo h-full rounded-(--radius-xl)">
              <div className="flex h-full flex-col p-8">
                <MiniMockup cell={mobile} />
                <div className="mt-8 text-ink-forest">
                  <h3 className="text-card-title">{mobile.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-forest/85">{mobile.body}</p>
                </div>
              </div>
            </BentoCard>
          </div>
          <div data-reveal className="md:col-span-2">
            <BentoCard className="h-full rounded-(--radius-xl) bg-bg-mist">
              <div className="grid h-full grid-cols-1 items-center gap-8 p-8 md:grid-cols-2 md:p-10">
                <div>
                  <h3 className="text-card-title">{support.title}</h3>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{support.body}</p>
                </div>
                <div className="w-full max-w-[360px] md:justify-self-end">
                  <MiniMockup cell={support} />
                </div>
              </div>
            </BentoCard>
          </div>
        </BentoGrid>
      </div>
    </section>
  );
}
