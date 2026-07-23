"use client";

// 01: capabilities — bento 2+4 (ряды разной ширины). 5 из 6 ячеек с мокапами
// через MockupStage (очередь «один живой одновременно»), одна типографическая.
import { capabilities } from "@/content/platform";
import { MockupStage } from "@/components/mockups/MockupStage";
import { KycFlow } from "@/components/mockups/KycFlow";
import { RampWidget } from "@/components/mockups/RampWidget";
import { CardDuo } from "@/components/mockups/CardDuo";
import { SellerTerminal } from "@/components/mockups/SellerTerminal";
import { IbanAccount } from "@/components/mockups/IbanAccount";

const MOCKUPS = {
  kyc: KycFlow,
  ramp: RampWidget,
  cards: CardDuo,
  terminal: SellerTerminal,
  iban: IbanAccount,
} as const;

function Cell({ cell }: { cell: (typeof capabilities.cells)[number] }) {
  const Mockup = cell.mockup ? MOCKUPS[cell.mockup] : null;
  return (
    <div data-reveal className="flex flex-col rounded-(--radius-l) bg-bg-alt p-8">
      <h3 className="text-card-title">{cell.title}</h3>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{cell.body}</p>
      {Mockup && (
        <div className="mt-8 flex-1">
          {/* карты — статика (hover-жизнь), остальные — прогон по очереди */}
          <MockupStage isStatic={cell.mockup === "cards"}>
            <Mockup />
          </MockupStage>
        </div>
      )}
    </div>
  );
}

export function Capabilities() {
  const [row1, row2] = [capabilities.cells.slice(0, 2), capabilities.cells.slice(2)];
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:px-12 md:py-36">
        <p className="text-label text-ink-soft">{capabilities.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[18ch]">{capabilities.section.title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {row1.map((cell) => (
            <Cell key={cell.title} cell={cell} />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {row2.map((cell) => (
            <Cell key={cell.title} cell={cell} />
          ))}
        </div>
      </div>
    </section>
  );
}
