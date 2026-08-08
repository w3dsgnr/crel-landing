"use client";

// 01: capabilities — слой v4 «светлый референс»: единые серые карточки-сцены
// (CardScene), живые мокапы сохраняют поведение и очередь MockupStage — кожу
// перекрашивает токен-каскад .layer-v4. Ячейка Widget/White Label API —
// изометрическая сцена вместо генеративного ассета (спека §7).
import { capabilities } from "@/content/platform";
import { BentoGrid, BentoCard } from "@/components/vendor/MagicBento";
import { MockupStage } from "@/components/mockups/MockupStage";
import { KycFlow } from "@/components/mockups/KycFlow";
import { RampWidget } from "@/components/mockups/RampWidget";
import { CardDuo } from "@/components/mockups/CardDuo";
import { SellerTerminal } from "@/components/mockups/SellerTerminal";
import { IbanAccount } from "@/components/mockups/IbanAccount";
import { CardScene } from "@/components/v4/CardScene";
import type { MicroTextureKind } from "@/components/v4/MicroTexture";
import { IsoWidgetEmbed } from "@/components/isometric/scenes";

export function Capabilities() {
  const cells = capabilities.cells;
  const byMockup = (id: string | null) => cells.find((c) => c.mockup === id)!;
  const kyc = byMockup("kyc");
  const ramp = byMockup("ramp");
  const iban = byMockup("iban");
  const cards = byMockup("cards");
  const terminal = byMockup("terminal");
  const widget = byMockup(null);

  // ячейка = сцена: мокап-иллюстрация + тематическая текстура (спека §6)
  const grid: { cell: typeof kyc; span: string; texture: MicroTextureKind; illustration: React.ReactNode }[] = [
    { cell: kyc, span: "md:col-span-3", texture: "binary", illustration: <MockupStage className="w-full max-w-[340px]"><KycFlow /></MockupStage> },
    { cell: ramp, span: "md:col-span-3", texture: "amounts", illustration: <MockupStage className="w-full max-w-[340px]"><RampWidget /></MockupStage> },
    { cell: iban, span: "md:col-span-4", texture: "iban", illustration: <MockupStage className="w-full max-w-[400px]"><IbanAccount /></MockupStage> },
    { cell: cards, span: "md:col-span-2", texture: "grid", illustration: <MockupStage className="w-full max-w-[300px]"><CardDuo /></MockupStage> },
    { cell: terminal, span: "md:col-span-2", texture: "amounts", illustration: <MockupStage className="w-full max-w-[300px]"><SellerTerminal /></MockupStage> },
    { cell: widget, span: "md:col-span-4", texture: "grid", illustration: <IsoWidgetEmbed /> },
  ];

  return (
    <section className="layer-v4 bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        <p className="text-label text-pine-600">{capabilities.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[18ch]">{capabilities.section.title}</h2>

        <BentoGrid
          enableSpotlight={false}
          enableBorderGlow={false}
          className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-6"
        >
          {grid.map(({ cell, span, texture, illustration }) => (
            <div key={cell.title} data-reveal className={span}>
              <BentoCard enableStars={false} className="h-full rounded-(--radius-xl)">
                <CardScene title={cell.title} body={cell.body} illustration={illustration} texture={texture} />
              </BentoCard>
            </div>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
