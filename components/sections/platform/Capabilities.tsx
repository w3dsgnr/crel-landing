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

function Cell({ cell, wide = false }: { cell: (typeof capabilities.cells)[number]; wide?: boolean }) {
  const Mockup = cell.mockup ? MOCKUPS[cell.mockup] : null;
  const stage = Mockup && (
    /* все мокапы в очереди прогонов + idle-цикл (карты — подъём-такт) */
    <MockupStage>
      <Mockup />
    </MockupStage>
  );

  if (wide && Mockup) {
    // широкая ячейка (2/3): текст слева, мокап справа — визуалу есть куда дышать
    return (
      <div data-reveal className="grid grid-cols-1 items-center gap-8 rounded-(--radius-l) border border-line bg-bg-alt p-8 md:col-span-2 md:grid-cols-2 md:p-10">
        <div>
          <h3 className="text-card-title">{cell.title}</h3>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{cell.body}</p>
        </div>
        <div className="w-full max-w-[400px] md:justify-self-end">{stage}</div>
      </div>
    );
  }

  // Цвет v2: типографическая ячейка без мокапа (widget/headless API) — единственное
  // градиентное окно бенто: тёмное с зелёным лит-краем, «терминальный» финал ряда.
  const isSignal = !Mockup && wide;
  return (
    <div
      data-reveal
      className={`flex flex-col rounded-(--radius-l) p-8 ${
        isSignal ? "grad-window-signal text-ink-invert" : "border border-line bg-bg-alt"
      } ${wide ? "md:col-span-2 justify-center" : ""}`}
    >
      {/* фокус-окно ряда: заголовок крупнее сиблингов — намеренный слом иерархии */}
      <h3 className={isSignal ? "text-[clamp(1.75rem,2.6vw,2.25rem)] font-medium tracking-[-0.01em]" : "text-card-title"}>
        {cell.title}
      </h3>
      <p
        className={`mt-4 text-[0.9375rem] leading-relaxed ${isSignal ? "text-ink-invert/70" : "text-ink-soft"} ${
          wide ? "max-w-[52ch]" : ""
        }`}
      >
        {cell.body}
      </p>
      {stage && <div className="mt-8 flex-1">{stage}</div>}
    </div>
  );
}

export function Capabilities() {
  const cells = capabilities.cells;
  const byMockup = (id: string | null) => cells.find((c) => c.mockup === id)!;
  const [kyc, ramp] = [byMockup("kyc"), byMockup("ramp")];
  const [iban, cards, terminal, widget] = [
    byMockup("iban"),
    byMockup("cards"),
    byMockup("terminal"),
    byMockup(null),
  ];
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        <p className="text-label text-ink-soft">{capabilities.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[18ch]">{capabilities.section.title}</h2>
        {/* ряд 1: 1/2 + 1/2 */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Cell cell={kyc} />
          <Cell cell={ramp} />
        </div>
        {/* ряды 2-3: бенто 2/3 + 1/3 с чередованием — визуалы не зажаты */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Cell cell={iban} wide />
          <Cell cell={cards} />
          <Cell cell={terminal} />
          <Cell cell={widget} wide />
        </div>
      </div>
    </section>
  );
}
