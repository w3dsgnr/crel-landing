// 02: services / Platform implementation — сцена «предмет на серой сцене»
// по референсу (docs/refs/todesktop/design.md §1.3, §3): белое окно-чеклист
// модулей платформы + объёмный куб-модуль внахлёст на угол окна (проп Level 2);
// кастомный модуль ещё не встал — в его строке пунктирный пустой слот.
// Макет утверждён 2026-08-10 (scratchpad/card-01-platform-implementation.html).
import { servicesGrid } from "@/content/services";

const rows = servicesGrid.cells.find((c) => c.title === "Platform implementation")!.miniMockup!;

// призрачные метки сборки — координаты подобраны в утверждённом макете
const GHOSTS = [
  { t: "BUILD 2.4.1", style: { left: "5%", top: "8%" } },
  { t: "API", style: { right: "5%", top: "18%" } },
  { t: "DEPLOY", style: { left: "7%", bottom: "5%" } },
  { t: "0.9.2", style: { right: "6%", bottom: "8%" } },
] as const;

function Check() {
  return (
    <span
      className="grid size-[18px] flex-none place-items-center rounded-full"
      style={{ background: "var(--v4-ok)" }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M2 5.2 4.2 7.4 8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// пустой слот кастомного модуля — куб сверху «встанет» сюда
function Slot() {
  return <span className="size-[18px] flex-none rounded-[5px] border-[1.5px] border-dashed border-accent opacity-55" />;
}

// куб-модуль: скруглённые рёбра — stroke того же градиента с round join
function ModuleCube() {
  return (
    <svg
      className="absolute -top-[38px] -right-5 z-10"
      width="58"
      height="62"
      viewBox="0 0 58 62"
      fill="none"
      aria-hidden
      style={{ filter: "drop-shadow(0 16px 16px rgb(25 60 130 / 0.25))" }}
    >
      <defs>
        <linearGradient id="impl-cube-top" x1="12" y1="4" x2="46" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8db6ff" />
          <stop offset="1" stopColor="#5b95fa" />
        </linearGradient>
        <linearGradient id="impl-cube-left" x1="4" y1="18" x2="28" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3f86f8" />
          <stop offset="1" stopColor="#2568da" />
        </linearGradient>
        <linearGradient id="impl-cube-right" x1="30" y1="20" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2e77ee" />
          <stop offset="1" stopColor="#1c55bd" />
        </linearGradient>
      </defs>
      <g strokeLinejoin="round">
        <path d="M29 3 54 17 29 31 4 17Z" fill="url(#impl-cube-top)" stroke="url(#impl-cube-top)" strokeWidth="5" />
        <path d="M4 17 29 31V59L4 45Z" fill="url(#impl-cube-left)" stroke="url(#impl-cube-left)" strokeWidth="5" />
        <path d="M54 17 29 31V59L54 45Z" fill="url(#impl-cube-right)" stroke="url(#impl-cube-right)" strokeWidth="5" />
      </g>
      <path d="M29 8.5 45.5 17.8 29 26.5 12.5 17.8Z" fill="#fff" opacity="0.14" />
    </svg>
  );
}

export function ImplementationScene() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {/* «угол студии»: мягкий свет позади предмета */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(70% 55% at 48% 52%, rgb(255 255 255 / 0.75), transparent 100%)" }}
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

      {/* окно платформы; сдвиг вниз-влево — куб дышит в верхнем правом углу */}
      <div
        className="relative w-[248px] -translate-x-2 translate-y-2 rounded-(--radius-m) bg-surface"
        style={{ boxShadow: "var(--shadow-panel)" }}
      >
        <ModuleCube />
        <div className="flex items-center gap-[5px] px-3 pt-2.5 pb-2">
          <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
          <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
          <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
          <span
            className="text-data ml-2 text-[0.5625rem] font-medium tracking-[0.08em] uppercase"
            style={{ color: "var(--v4-ghost)" }}
          >
            crel platform
          </span>
        </div>
        <div className="grid gap-1.5 px-2.5 pb-2.5">
          {rows.map((row) => {
            const enabled = row.chip === "enabled";
            return (
              <div
                key={row.label}
                className={`flex items-center gap-2 rounded-(--radius-s) bg-bg-mist px-2.5 py-2 text-[0.78125rem] font-medium ${
                  enabled ? "" : "text-ink-soft"
                }`}
              >
                {enabled ? <Check /> : <Slot />}
                {row.label}
                <span
                  className="text-data ml-auto text-[0.5625rem] font-medium tracking-[0.06em] uppercase"
                  style={{ color: enabled ? "var(--v4-ok)" : "var(--v4-warn)" }}
                >
                  {row.chip}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
