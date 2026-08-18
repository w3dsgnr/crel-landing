"use client";

// 02: services / Licensing and compliance — сцена «предмет на серой сцене»
// по референсу (docs/refs/todesktop/design.md §1.3, §3): стопка документов
// двух регуляторных треков + объёмная зубчатая печать-розетка внахлёст на
// край листа (оммаж оранжевой награде референса; оранжевый — точечный второй
// акцент). Бинарные цифры фона даёт штатная текстура binary в CardScene.
// Макет утверждён 2026-08-10 (scratchpad/card-03-licensing-compliance.html).
//
// Сцена «два регуляторных трека» (грамматика docs/motion-capabilities.md,
// привод usePlayOnce): передний лист садится, задний ВЫЕЗЖАЕТ из-под него в
// свой угол покоя (.wg-doc, globals.css § «Веер документов»), строки текста
// проявляются stagger 50, чип in review — последним. Печать статична: её
// появление спорило бы с in review (печать = решение, которого ещё нет).
import { servicesGrid } from "@/content/services";
import { usePlayOnce } from "@/lib/usePlayOnce";

const rows = servicesGrid.cells.find((c) => c.title === "Licensing and compliance")!.miniMockup!;
const front = rows[0]; // casp application — in review
const back = rows[1]; // aml program

// названия регуляций призраками — координаты из утверждённого макета
const GHOSTS = [
  { t: "MiCA", style: { left: "4%", top: "8%" } },
  { t: "PCI DSS", style: { right: "5%", top: "11%" } },
  { t: "TRAVEL RULE", style: { left: "6%", bottom: "11%" } },
  { t: "AML", style: { right: "7%", bottom: "9%" } },
] as const;

const DOC_LINES = ["60%", "85%", "72%", "40%"];

// печать-розетка: 16-лучевой зубчатый край (скругление рёбер строкой),
// ядро — линейный градиент, радиус почти до впадин зубцов
function Rosette() {
  return (
    <svg
      className="absolute top-[103px] left-[178px] z-10"
      width="120"
      height="122"
      viewBox="0 0 120 122"
      fill="none"
      aria-hidden
      style={{ filter: "drop-shadow(0 10px 12px rgb(140 80 0 / 0.28))" }}
    >
      <defs>
        <linearGradient id="lic-seal" x1="26" y1="20" x2="94" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffc25e" />
          <stop offset="1" stopColor="#f28b00" />
        </linearGradient>
        <linearGradient id="lic-seal-core" x1="34" y1="34" x2="82" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffc866" />
          <stop offset="1" stopColor="#f78f00" />
        </linearGradient>
      </defs>
      <g strokeLinejoin="round">
        <path
          fill="url(#lic-seal)"
          stroke="url(#lic-seal)"
          strokeWidth="6"
          d="M60 16 66.9 22.9 76.4 20.4 79.9 29.6 89.6 30.4 89.4 40.2 97.6 45.4 93.6 54.4 99 62.5 91.4 68.7 93 78.4 83.6 81.2 81.4 90.7 71.6 89.9 65.9 97.9 57.4 93 48.9 97.9 43.2 89.9 33.4 90.7 31.2 81.2 21.8 78.4 23.4 68.7 15.8 62.5 21.2 54.4 17.2 45.4 25.4 40.2 25.2 30.4 34.9 29.6 38.4 20.4 47.9 22.9 Z"
        />
        <circle cx="57.4" cy="57" r="31.5" fill="url(#lic-seal-core)" />
      </g>
      <path d="M46 57.5 54.5 66 71 47" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LicensingScene() {
  // корень сцены — стопка листов с печатью; призраки фона в прогоне не участвуют
  const { ref, playAttr } = usePlayOnce<HTMLDivElement>();
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(55% 55% at 50% 50%, rgb(255 255 255 / 0.75), transparent 100%)" }}
        />
        {GHOSTS.map((g) => (
          <span
            key={g.t}
            className="text-data absolute text-[0.6875rem] tracking-[0.08em]"
            style={{ ...g.style, color: "var(--v4-ghost)" }}
          >
            {g.t}
          </span>
        ))}
      </div>

      {/* стопка документов: передний трек + второй лист под углом позади */}
      <div ref={ref} data-play={playAttr} className="relative h-[196px] w-[232px] -translate-y-2">
        {/* задний лист: угол покоя (26px, −12px, 5°) — переменными .wg-doc,
            а не утилитами translate/rotate: два источника transform дали бы
            прыжок в первом кадре. Стартует из-под переднего (transform: none) */}
        <div
          className="wg-doc absolute inset-0 rounded-(--radius-m) bg-surface p-4"
          style={
            {
              "--dx": "26px",
              "--dy": "-12px",
              "--dr": "5deg",
              boxShadow: "var(--shadow-panel)",
              transitionDelay: "calc(var(--wg-t0) + 90ms)",
            } as React.CSSProperties
          }
        >
          <div
            className="text-data text-[0.5625rem] font-medium tracking-[0.08em] uppercase opacity-70"
            style={{ color: "var(--v4-ghost)" }}
          >
            {back.label}
          </div>
        </div>
        <div
          className="wg-rise absolute inset-0 rounded-(--radius-m) bg-surface px-[18px] py-4"
          style={{ boxShadow: "var(--shadow-panel)", transitionDelay: "var(--wg-t0)" }}
        >
          <div
            className="text-data text-[0.5625rem] font-medium tracking-[0.08em] uppercase"
            style={{ color: "var(--v4-ghost)" }}
          >
            {front.label}
          </div>
          {/* строки документа проявляются stagger 50 — лист заполняется */}
          {DOC_LINES.map((w, i) => (
            <div
              key={w}
              className="wg-fade mt-3 h-1.5 rounded-full bg-[#e9e9ee]"
              style={{ width: w, transitionDelay: `calc(var(--wg-t0) + ${100 + i * 50}ms)` }}
            />
          ))}
          {/* статус — последним: подтверждение приходит после заполнения */}
          <div
            className="wg-fade absolute bottom-4 left-[18px] flex items-center gap-[7px] rounded-(--radius-s) px-2.5 py-1.5"
            style={{ background: "#fff4e0", transitionDelay: "calc(var(--wg-t0) + 300ms)" }}
          >
            <span className="size-[7px] rounded-full" style={{ background: "var(--v4-warn)" }} />
            <span
              className="text-data text-[0.5625rem] font-medium tracking-[0.06em] uppercase"
              style={{ color: "#b46a00" }}
            >
              {front.chip}
            </span>
          </div>
        </div>
        <Rosette />
      </div>
    </>
  );
}
