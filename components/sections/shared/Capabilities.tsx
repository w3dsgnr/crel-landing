"use client";

// 01: capabilities — слой v4 «светлый референс»: единые серые карточки-сцены
// (CardScene). Редизайн 2026-08-12: мокапы — статичные стеклянные «приборы»
// (*Glass, скоуп .widget-glass, docs/refs/dark-widgets/design.md); очередь
// MockupStage из секции ушла вместе с живыми прогонами. Ячейка Widget/White
// Label API — изометрическая сцена вместо генеративного ассета (спека §7).
import { capabilities } from "@/content/platform";
import { BentoGrid, BentoCard } from "@/components/vendor/MagicBento";
import { KycFlowGlass } from "@/components/mockups/KycFlowGlass";
import { RampWidgetGlass } from "@/components/mockups/RampWidgetGlass";
import { CardDuoGlass } from "@/components/mockups/CardDuoGlass";
import { SellerTerminalGlass } from "@/components/mockups/SellerTerminalGlass";
import { IbanAccountGlass } from "@/components/mockups/IbanAccountGlass";
import { CardScene } from "@/components/v4/CardScene";
import type { MicroTextureKind } from "@/components/v4/MicroTexture";
import { WidgetApiGlass } from "@/components/mockups/WidgetApiGlass";

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
    { cell: kyc, span: "md:col-span-3", texture: "binary", illustration: <div className="w-full max-w-[340px]"><KycFlowGlass /></div> },
    // редизайн 2026-08-12: стеклянный прибор (widget-glass) вместо светлой панели MockupStage
    { cell: ramp, span: "md:col-span-3", texture: "amounts", illustration: <div className="w-full max-w-[340px]"><RampWidgetGlass /></div> },
    { cell: iban, span: "md:col-span-4", texture: "iban", illustration: <div className="w-full max-w-[400px]"><IbanAccountGlass /></div> },
    { cell: cards, span: "md:col-span-2", texture: "grid", illustration: <div className="w-full max-w-[300px]"><CardDuoGlass /></div> },
    { cell: terminal, span: "md:col-span-2", texture: "amounts", illustration: <div className="w-full max-w-[300px]"><SellerTerminalGlass /></div> },
    // редизайн 2026-08-12: изометрию сменил стеклянный «два входа» (код + виджет)
    { cell: widget, span: "md:col-span-4", texture: "grid", illustration: <div className="w-full max-w-[400px]"><WidgetApiGlass /></div> },
  ];

  return (
    <section className="layer-v4 bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        {/* шапка секции по центру (редизайн 2026-08-12): label — title — тезис */}
        <div className="mx-auto max-w-[52ch] text-center">
          <p className="text-label text-pine-600">{capabilities.section.label}</p>
          <h2 className="text-h2 mt-6">{capabilities.section.title}</h2>
          {capabilities.section.sub && (
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">{capabilities.section.sub}</p>
          )}
        </div>

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
