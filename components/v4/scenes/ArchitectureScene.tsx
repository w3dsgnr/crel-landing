"use client";

// 02: services / Architecture consulting — сцена «предмет на серой сцене»
// по референсу (docs/refs/todesktop/design.md §1.3, §3): белая панель-чертёж
// мульти-провайдерного стека (хаб + узлы) + объёмная лупа внахлёст (проп
// Level 2). Линза наведена на узел emi bank: под стеклом — его увеличенная
// копия, история «audit of your business, not a template».
// Макет утверждён 2026-08-10 (scratchpad/card-02-architecture-consulting.html).
//
// Сцена «аудит» (грамматика docs/motion-capabilities.md, привод usePlayOnce):
// сначала проявляется чертёж как есть — связи и узлы провайдеров stagger 60,
// хаб your rail щёлкает; потом мы НАВОДИМ лупу (.wg-rise), и последней
// проявляется пунктирная связь к emi bank — находка аудита. Пунктир — через
// opacity, не stroke-dashoffset (не GPU). Hover на лупе запрещён: окклюзии нет.
import { usePlayOnce } from "@/lib/usePlayOnce";

// призрачные метки аудита — координаты из утверждённого макета
const GHOSTS = [
  { t: "AUDIT 01", style: { left: "3%", top: "8%" } },
  { t: "SLA 99.99", style: { right: "4%", top: "13%" } },
  { t: "EU / CH", style: { right: "28%", top: "5%" } },
  { t: "0.85%", style: { left: "5%", bottom: "10%" } },
  { t: "TEMPLATE: NO", style: { left: "21%", bottom: "4%" } },
] as const;

// узлы диаграммы: хаб your rail + провайдеры (образец данных, не вендор-лист)
const NODES = [
  { label: "psp a", x: 96, y: 42 },
  { label: "psp b", x: 140, y: 132 },
  { label: "custody", x: 352, y: 38 },
] as const;

// центровка узла по координате живёт на обёртке (-translate-*), жест сцены —
// на внутренней пилюле: два источника transform на одном узле дали бы прыжок
function Node({ label, x, y, delay }: { label: string; x: number; y: number; delay: number }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
      <div
        className="wg-rise wg-rise-s flex items-center gap-1.5 rounded-(--radius-s) bg-bg-mist px-3 py-2 text-[0.8125rem] font-medium whitespace-nowrap"
        style={{ transitionDelay: `calc(var(--wg-t0) + ${delay}ms)` }}
      >
        <span className="size-1.5 rounded-full" style={{ background: "var(--v4-ghost)" }} />
        {label}
      </div>
    </div>
  );
}

// лупа аудита: ось ручки строго через центр линзы (45°); под стеклом —
// увеличенный узел emi bank, оригинал на чертеже полностью накрыт ободом.
// .wg-rise (8px) после чертежа — «мы её навели»; drop-shadow на движущемся
// узле допустим: прогон один и короче 500 мс, hover'а нет
function Loupe() {
  return (
    <svg
      className="wg-rise absolute top-[74px] left-[318px] z-10"
      width="150"
      height="160"
      viewBox="0 0 150 160"
      fill="none"
      aria-hidden
      style={{
        filter: "drop-shadow(0 12px 14px rgb(25 60 130 / 0.2))",
        transitionDelay: "calc(var(--wg-t0) + 380ms)",
      }}
    >
      <defs>
        <linearGradient id="arch-ring" x1="20" y1="14" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fdfdfe" />
          <stop offset="0.55" stopColor="#d9d9df" />
          <stop offset="1" stopColor="#b9b9c2" />
        </linearGradient>
        <linearGradient id="arch-handle" x1="92" y1="92" x2="130" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#48484c" />
          <stop offset="1" stopColor="#161618" />
        </linearGradient>
        <radialGradient id="arch-glass" cx="0.35" cy="0.3" r="0.9">
          <stop stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#eaf1fd" stopOpacity="0.55" />
          <stop offset="1" stopColor="#d5e4fb" stopOpacity="0.65" />
        </radialGradient>
        <clipPath id="arch-lens-clip">
          <circle cx="60" cy="60" r="42" />
        </clipPath>
      </defs>
      <line x1="90" y1="90" x2="130" y2="130" stroke="url(#arch-handle)" strokeWidth="15" strokeLinecap="round" />
      <circle cx="60" cy="60" r="48" fill="url(#arch-ring)" />
      <circle cx="60" cy="60" r="42" fill="url(#arch-glass)" />
      <g clipPath="url(#arch-lens-clip)">
        <path d="M0 44 14 52" stroke="var(--color-accent)" strokeWidth="2.5" strokeDasharray="8 6" />
        <rect x="12" y="43" width="82" height="34" rx="10" fill="#f0f0f3" />
        <circle cx="25" cy="60" r="4" fill="var(--v4-ghost)" />
        <text x="35" y="64.5" fontSize="13.5" fontWeight="500" fill="var(--color-ink)">
          emi bank
        </text>
      </g>
      <path d="M37 44c5-10 17-16 28-14" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

export function ArchitectureScene() {
  // корень сцены — контейнер чертежа с лупой; призраки фона в прогоне не участвуют.
  // Сам контейнер несёт max-sm:scale — он не анимируется, конфликта transform нет
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

      {/* панель-чертёж + лупа; на узких экранах сцена ужимается целиком */}
      <div ref={ref} data-play={playAttr} className="relative max-sm:scale-[0.68]">
        <div className="w-[470px] rounded-(--radius-m) bg-surface" style={{ boxShadow: "var(--shadow-panel)" }}>
          <div className="flex items-center gap-[5px] px-3 pt-2.5 pb-1.5">
            <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
            <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
            <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
            <span
              className="text-data ml-2 text-[0.5625rem] font-medium tracking-[0.08em] uppercase"
              style={{ color: "var(--v4-ghost)" }}
            >
              stack blueprint
            </span>
          </div>
          <div className="relative mx-2.5 mb-2.5 h-[168px]">
            {/* связи: хаб (225,85); psp a (96,42), psp b (140,132), custody (352,38), emi bank (368,126) */}
            <svg className="absolute inset-0" width="450" height="168" viewBox="0 0 450 168" fill="none" aria-hidden>
              {/* hairline-связи — первый такт чертежа */}
              <path
                className="wg-fade"
                style={{ transitionDelay: "var(--wg-t0)" }}
                d="M225 85 96 42 M225 85 140 132 M225 85 352 38"
                stroke="var(--v4-hairline)"
                strokeWidth="1.5"
              />
              {/* находка аудита — пунктир к emi bank проявляется последним, уже под лупой */}
              <path
                className="wg-fade"
                style={{ transitionDelay: "calc(var(--wg-t0) + 520ms)" }}
                d="M225 85 368 126"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
            </svg>
            {NODES.map((n, i) => (
              <Node key={n.label} {...n} delay={60 + i * 60} />
            ))}
            {/* узел emi bank рисует линза; хаб — единственная синяя заливка сцены.
                Центровка на обёртке, .wg-pop — на пилюле (один источник transform) */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 225, top: 85 }}>
              <div
                className="wg-pop flex items-center gap-1.5 rounded-(--radius-s) bg-accent px-3 py-2 text-[0.8125rem] font-medium whitespace-nowrap text-ink-invert"
                style={{ boxShadow: "0 6px 16px rgb(46 124 246 / 0.35)", transitionDelay: "calc(var(--wg-t0) + 240ms)" }}
              >
                <span className="size-1.5 rounded-full bg-white" />
                your rail
              </div>
            </div>
          </div>
        </div>
        <Loupe />
      </div>
    </>
  );
}
