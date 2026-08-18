// 02: services / Ongoing support — сцена «предмет на серой сцене» по
// референсу (docs/refs/todesktop/design.md §1.3, §3): окно ops-консоли со
// статус-лентой и спасательный круг — универсальный знак поддержки — на
// правом крае окна (положение по эскизу заказчика: большая часть на панели,
// правый край выступает наружу). Номера строк фона даёт текстура lines.
// Макет утверждён 2026-08-10 (scratchpad/card-06-ongoing-support.html).
//
// Сцена (грамматика приборов, docs/motion-capabilities.md): «отчёты приходят
// по такту» — сверка печатает значение → инцидентов нет → коридор загорается
// последним, это и есть rollout. Контейнеры строк и круг статичны: анимируются
// только вердикты, сами строки существуют и до отчёта.
"use client";

import { servicesGrid } from "@/content/services";
import { usePlayOnce } from "@/lib/usePlayOnce";

const feed = servicesGrid.cells.find((c) => c.title === "Ongoing support")!.statusFeed!;

const GHOSTS = [
  { t: "UPTIME 99.99", style: { right: "6%", top: "9%" } },
  { t: "24 / 7", style: { left: "13%", bottom: "9%" } },
] as const;

// такты от --wg-t0 ячейки, по типу вердикта (порядок строк в ленте — контентный)
const AT = { type: 0, fade: 160, pop: 320 } as const;
const at = (ms: number) => `calc(var(--wg-t0) + ${ms}ms)`;

function RowIcon({ value }: { value: string }) {
  if (value === "live") {
    return (
      // щёлкает вместе с ярлыком: точка — отклик системы, не декор
      <span
        className="wg-pop mx-[5px] size-2 flex-none rounded-full"
        style={{
          background: "var(--v4-ok)",
          boxShadow: "0 0 0 3px rgb(52 199 89 / 0.14), 0 0 8px rgb(52 199 89 / 0.35)",
          transitionDelay: at(AT.pop),
        }}
      />
    );
  }
  if (value.startsWith("0")) {
    return <span className="size-[18px] flex-none rounded-full" style={{ background: "#ececf1" }} />;
  }
  return (
    <span className="grid size-[18px] flex-none place-items-center rounded-full" style={{ background: "var(--v4-ok)" }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M2 5.2 4.2 7.4 8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// спасательный круг: белый тор, четыре синих сегмента, блик
function Buoy() {
  return (
    <svg
      className="absolute top-[56px] left-[263px] z-10"
      width="116"
      height="116"
      viewBox="0 0 116 116"
      fill="none"
      aria-hidden
      style={{ filter: "drop-shadow(0 8px 14px rgb(25 60 130 / 0.22))" }}
    >
      <defs>
        <linearGradient id="sup-buoy-ring" x1="20" y1="16" x2="94" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#dcdce3" />
        </linearGradient>
        <linearGradient id="sup-buoy-seg" x1="24" y1="20" x2="92" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5b95fa" />
          <stop offset="1" stopColor="#2263d6" />
        </linearGradient>
      </defs>
      <circle cx="58" cy="58" r="36" stroke="url(#sup-buoy-ring)" strokeWidth="26" fill="none" />
      {/* четыре сегмента: длина дуги = 1/8 окружности (2π·36 ≈ 226) */}
      <circle
        cx="58"
        cy="58"
        r="36"
        stroke="url(#sup-buoy-seg)"
        strokeWidth="26"
        fill="none"
        strokeDasharray="28.3 28.3"
        strokeDashoffset="14.15"
        transform="rotate(-90 58 58)"
      />
      <circle cx="58" cy="58" r="49" stroke="#c9c9d2" strokeWidth="1" fill="none" opacity="0.7" />
      <circle cx="58" cy="58" r="23" stroke="#c9c9d2" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M28 38c5-9 14-16 25-18" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// класс и такт вердикта по значению: сверка печатается, «0 open» проявляется,
// live щёлкает последним
function verdictMotion(value: string): { cls: string; delay: string } {
  if (value === "live") return { cls: "wg-pop", delay: at(AT.pop) };
  if (value.startsWith("0")) return { cls: "wg-fade", delay: at(AT.fade) };
  return { cls: "wg-type", delay: at(AT.type) };
}

export function SupportScene() {
  // привод сцены висит на панели, а не на фрагменте: IntersectionObserver
  // нужен реальный бокс, а фон-виньетка сцены к прогону отношения не имеет
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

      {/* окно ops-консоли; сдвиг влево-вверх — круг дышит справа-снизу */}
      <div ref={ref} data-play={playAttr} className="relative w-[330px] -translate-x-7 -translate-y-3">
        <div className="rounded-(--radius-m) bg-surface" style={{ boxShadow: "var(--shadow-panel)" }}>
          <div className="flex items-center gap-[5px] px-3 pt-2.5 pb-2">
            <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
            <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
            <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
            <span
              className="text-data ml-2 text-[0.5625rem] font-medium tracking-[0.08em] uppercase"
              style={{ color: "var(--v4-ghost)" }}
            >
              ops console
            </span>
          </div>
          <div className="grid gap-1.5 px-2.5 pb-2.5">
            {feed.map((row) => {
              const motion = verdictMotion(row.value);
              return (
                <div
                  key={row.label}
                  className="flex items-center gap-2 rounded-(--radius-s) bg-bg-mist px-2.5 py-2 text-[0.78125rem] font-medium"
                >
                  <RowIcon value={row.value} />
                  {row.label}
                  <span
                    className={`${motion.cls} text-data ml-auto text-[0.625rem] font-medium ${
                      row.value === "live" ? "text-[0.5625rem] uppercase tracking-[0.06em]" : "text-ink-soft"
                    }`}
                    style={{
                      ...(row.value === "live" ? { color: "var(--v4-ok)" } : undefined),
                      transitionDelay: motion.delay,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <Buoy />
      </div>
    </>
  );
}
