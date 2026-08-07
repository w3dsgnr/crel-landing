"use client";

// 01: capabilities — bento v3 на Magic Bento (vendored, components/vendor/MagicBento):
// spotlight + border-glow приглушены до «дорого». Ритм заливок — чередование
// OnRamper (~каждая вторая плитка цветная): mist → signal / halo → abyss-якорь.
// Живые мокапы ОСТАЮТСЯ (очередь MockupStage); генеративные ассеты — плейсхолдеры
// из public/assets/approach до финальной серии (см. «Бриф на визуалы»).
// Правило текста на заливках: signal/halo → --ink-forest в светлой зоне,
// abyss → белый (v3.1).
import { capabilities } from "@/content/platform";
import { BentoGrid, BentoCard } from "@/components/vendor/MagicBento";
import { MockupStage } from "@/components/mockups/MockupStage";
import { KycFlow } from "@/components/mockups/KycFlow";
import { RampWidget } from "@/components/mockups/RampWidget";
import { CardDuo } from "@/components/mockups/CardDuo";
import { SellerTerminal } from "@/components/mockups/SellerTerminal";
import { IbanAccount } from "@/components/mockups/IbanAccount";

type Cell = (typeof capabilities.cells)[number];

/* Плейсхолдер генеративного ассета: окно-кадр, обрезается краем плитки */
function AssetWindow({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none select-none overflow-hidden rounded-(--radius-m) ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

/* светлая плитка: заголовок сверху, живой мокап снизу (композиция OnRamper) */
function LightCell({ cell, mockup }: { cell: Cell; mockup: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col p-8">
      <h3 className="text-card-title">{cell.title}</h3>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{cell.body}</p>
      <div className="mt-8 flex flex-1 items-end">{mockup}</div>
    </div>
  );
}

/* цветная плитка: мокап сверху (парит на заливке), текст в светлой нижней зоне */
function FillCell({ cell, mockup }: { cell: Cell; mockup: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col p-8">
      <div className="mx-auto w-full max-w-[340px]">{mockup}</div>
      <div className="mt-8 text-ink-forest">
        <h3 className="text-card-title">{cell.title}</h3>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-forest/85">{cell.body}</p>
      </div>
    </div>
  );
}

export function Capabilities() {
  const cells = capabilities.cells;
  const byMockup = (id: string | null) => cells.find((c) => c.mockup === id)!;
  const kyc = byMockup("kyc");
  const ramp = byMockup("ramp");
  const iban = byMockup("iban");
  const cards = byMockup("cards");
  const terminal = byMockup("terminal");
  const widget = byMockup(null);

  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        <p className="text-label text-pine-600">{capabilities.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[18ch]">{capabilities.section.title}</h2>

        <BentoGrid className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-6">
          {/* ряд 1: светлая с мокапом ↔ уверенная заливка */}
          <div data-reveal className="md:col-span-3">
            <BentoCard className="h-full rounded-(--radius-xl) bg-bg-mist">
              <LightCell cell={kyc} mockup={<MockupStage className="w-full"><KycFlow /></MockupStage>} />
            </BentoCard>
          </div>
          <div data-reveal className="md:col-span-3">
            <BentoCard className="grad-signal h-full rounded-(--radius-xl)">
              <FillCell cell={ramp} mockup={<MockupStage><RampWidget /></MockupStage>} />
            </BentoCard>
          </div>

          {/* ряд 2: широкая светлая (текст + мокап) ↔ светящаяся halo */}
          <div data-reveal className="md:col-span-4">
            <BentoCard className="h-full rounded-(--radius-xl) bg-bg-mist">
              <div className="grid h-full grid-cols-1 items-center gap-8 p-8 md:grid-cols-2 md:p-10">
                <div>
                  <h3 className="text-card-title">{iban.title}</h3>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{iban.body}</p>
                </div>
                <div className="w-full max-w-[400px] md:justify-self-end">
                  <MockupStage>
                    <IbanAccount />
                  </MockupStage>
                </div>
              </div>
            </BentoCard>
          </div>
          <div data-reveal className="md:col-span-2">
            <BentoCard className="grad-halo h-full rounded-(--radius-xl)">
              <FillCell cell={cards} mockup={<MockupStage><CardDuo /></MockupStage>} />
            </BentoCard>
          </div>

          {/* ряд 3: светлая ↔ тёмный abyss-якорь (единственный на секцию) */}
          <div data-reveal className="md:col-span-2">
            <BentoCard className="h-full rounded-(--radius-xl) bg-bg-mist">
              <LightCell cell={terminal} mockup={<MockupStage className="w-full"><SellerTerminal /></MockupStage>} />
            </BentoCard>
          </div>
          <div data-reveal className="md:col-span-4">
            <BentoCard className="grad-abyss h-full rounded-(--radius-xl) text-ink-invert">
              <div className="relative flex h-full flex-col justify-center p-8 md:p-10">
                <div className="md:max-w-[55%]">
                  {/* фокус-окно ряда: заголовок крупнее сиблингов — намеренный слом */}
                  <h3 className="text-[clamp(1.75rem,2.6vw,2.25rem)] font-medium tracking-[-0.01em]">
                    {widget.title}
                  </h3>
                  <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink-invert/70">
                    {widget.body}
                  </p>
                </div>
                {/* ассет-плейсхолдер, обрезан правым краем плитки */}
                <AssetWindow
                  src="/assets/approach/gates.png"
                  className="absolute -right-10 -bottom-12 hidden h-[130%] w-[38%] opacity-90 md:block"
                />
              </div>
            </BentoCard>
          </div>
        </BentoGrid>
      </div>
    </section>
  );
}
