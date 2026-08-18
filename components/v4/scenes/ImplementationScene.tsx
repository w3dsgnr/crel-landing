"use client";

// 02: services / Platform implementation — сцена «предмет на серой сцене»
// по референсу (docs/refs/todesktop/design.md §1.3, §3): белое окно-чеклист
// модулей платформы + объёмный куб-модуль внахлёст на угол окна (проп Level 2);
// кастомный модуль ещё не встал — в его строке пунктирный пустой слот.
// Макет утверждён 2026-08-10 (scratchpad/card-01-platform-implementation.html).
//
// Сцена «сборка» (грамматика docs/motion-capabilities.md, привод usePlayOnce):
// строки модулей садятся stagger 70, чипы статуса подтверждаются через 200 мс
// после своей строки, пунктирный слот щёлкает последним. Куб приходит СВЕРХУ
// синхронно с третьей строкой — «модуль пришёл и ещё не встал»; в слот он не
// влетает и слот галкой не становится: незавершённость и есть тезис карточки.
import { servicesGrid } from "@/content/services";
import { usePlayOnce } from "@/lib/usePlayOnce";

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

// пустой слот кастомного модуля — куб сверху «встанет» сюда.
// Появляется последним тактом сцены (.wg-pop): место под модуль — отклик системы
function Slot() {
  return (
    <span
      className="wg-pop size-[18px] flex-none rounded-[5px] border-[1.5px] border-dashed border-accent opacity-55"
      style={{ transitionDelay: "calc(var(--wg-t0) + 380ms)" }}
    />
  );
}

// куб-модуль: скруглённые рёбра — stroke того же градиента с round join.
// .wg-rise-drop (−6px сверху) в такт третьей строке: drop-shadow на движущемся
// узле допустим ровно потому, что прогон один и короче 500 мс
function ModuleCube() {
  return (
    <svg
      className="wg-rise wg-rise-drop absolute -top-[38px] -right-5 z-10"
      width="58"
      height="62"
      viewBox="0 0 58 62"
      fill="none"
      aria-hidden
      style={{
        filter: "drop-shadow(0 16px 16px rgb(25 60 130 / 0.25))",
        transitionDelay: "calc(var(--wg-t0) + 140ms)",
      }}
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
  // корень сцены — само окно: призраки и свет фона в прогоне не участвуют
  const { ref, playAttr } = usePlayOnce<HTMLDivElement>();
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
        ref={ref}
        data-play={playAttr}
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
          {rows.map((row, i) => {
            const enabled = row.chip === "enabled";
            // строка садится в такт (t0 + 70·i), её чип подтверждается через 200 мс
            const rowDelay = `calc(var(--wg-t0) + ${i * 70}ms)`;
            const chipDelay = `calc(var(--wg-t0) + ${i * 70 + 200}ms)`;
            return (
              <div
                key={row.label}
                className={`wg-rise flex items-center gap-2 rounded-(--radius-s) bg-bg-mist px-2.5 py-2 text-[0.78125rem] font-medium ${
                  enabled ? "" : "text-ink-soft"
                }`}
                style={{ transitionDelay: rowDelay }}
              >
                {enabled ? <Check /> : <Slot />}
                {row.label}
                <span
                  className="wg-fade text-data ml-auto text-[0.5625rem] font-medium tracking-[0.06em] uppercase"
                  style={{ color: enabled ? "var(--v4-ok)" : "var(--v4-warn)", transitionDelay: chipDelay }}
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
