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

  // Ход сцены --wg-t0 = --wg-fora + --wg-stagger (правило [data-scene-cell] в
  // globals.css). Здесь ставится только разведение ряда:
  //  0 левой / 160ms правой ячейке — соседи входят в кадр одновременно, и без
  //          разведения ряд «вспыхивает» целиком; с ним читается слева
  //          направо, как текст: эстафета, а не аккорд.
  //  --wg-fora (700ms — столько ячейка ещё едет по data-reveal, autoAlpha:0, а
  //          IO про невидимость не знает) живёт в CSS и обнуляется приводом,
  //          если в момент старта карточка уже проявлена (usePlayOnce.ts).
  const T0_LEFT = "0ms";
  const T0_RIGHT = "160ms";

  // ячейка = сцена: мокап-иллюстрация + тематическая текстура (спека §6)
  const grid: {
    cell: typeof kyc;
    span: string;
    texture: MicroTextureKind;
    t0: string;
    /** ячейка ловит курсор для hover-жеста внутри прибора (только Cards) */
    hover?: boolean;
    illustration: React.ReactNode;
  }[] = [
    { cell: kyc, span: "md:col-span-3", texture: "binary", t0: T0_LEFT, illustration: <div className="w-full max-w-[340px]"><KycFlowGlass /></div> },
    // редизайн 2026-08-12: стеклянный прибор (widget-glass) вместо светлой панели MockupStage
    { cell: ramp, span: "md:col-span-3", texture: "amounts", t0: T0_RIGHT, illustration: <div className="w-full max-w-[340px]"><RampWidgetGlass animated /></div> },
    { cell: iban, span: "md:col-span-4", texture: "iban", t0: T0_LEFT, illustration: <div className="w-full max-w-[400px]"><IbanAccountGlass /></div> },
    { cell: cards, span: "md:col-span-2", texture: "grid", t0: T0_RIGHT, hover: true, illustration: <div className="w-full max-w-[300px]"><CardDuoGlass /></div> },
    { cell: terminal, span: "md:col-span-2", texture: "amounts", t0: T0_LEFT, illustration: <div className="w-full max-w-[300px]"><SellerTerminalGlass /></div> },
    // редизайн 2026-08-12: изометрию сменил стеклянный «два входа» (код + виджет)
    { cell: widget, span: "md:col-span-4", texture: "grid", t0: T0_RIGHT, illustration: <div className="w-full max-w-[400px]"><WidgetApiGlass /></div> },
  ];

  return (
    <section className="layer-v4 bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        {/* шапка секции по центру: title — тезис. CLI-лейблы "NN: name" в вёрстке
            не выводим (решение 2026-08-13) — остаются только в content как id секции. */}
        <div className="mx-auto max-w-[52ch] text-center">
          <h2 className="text-h2">{capabilities.section.title}</h2>
          {capabilities.section.sub && (
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">{capabilities.section.sub}</p>
          )}
        </div>

        <BentoGrid
          enableSpotlight={false}
          enableBorderGlow={false}
          className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-6"
        >
          {grid.map(({ cell, span, texture, t0, hover, illustration }) => (
            <div
              key={cell.title}
              data-reveal
              data-scene-cell
              data-hover-scene={hover ? "" : undefined}
              className={span}
              style={{ "--wg-stagger": t0 } as React.CSSProperties}
            >
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
