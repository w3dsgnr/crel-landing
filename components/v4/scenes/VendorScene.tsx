// 02: services / Vendor selection — сцена «предмет на серой сцене» по
// референсу (docs/refs/todesktop/design.md §1.3, §3): белая панель-шортлист
// провайдеров с комиссиями, выбранная строка подсвечена; предмет-герой —
// белый системный курсор (мотив курсора hero v4), кликающий по цене.
// Метки миллисекунд фона даёт штатная текстура ms в CardScene.
// Макет утверждён 2026-08-10 (scratchpad/card-04-vendor-selection.html).
import { servicesGrid } from "@/content/services";

const providers = servicesGrid.cells.find((c) => c.title === "Vendor selection")!.miniCompare!;

// белый курсор с приглушённым контуром; объём — только мягкой тенью
function Cursor() {
  return (
    <svg
      className="absolute top-[43px] left-[219px] z-10"
      width="46"
      height="52"
      viewBox="0 0 64 72"
      fill="none"
      aria-hidden
      style={{ filter: "drop-shadow(0 10px 22px rgb(29 29 31 / 0.22))" }}
    >
      <defs>
        <linearGradient id="vend-cur-top" x1="14" y1="8" x2="40" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#e7e7ed" />
        </linearGradient>
      </defs>
      <path
        d="M14 14 14 50 24.4 39.9 30.8 54.5 37.4 51.6 31 37.3 45 35.8 Z"
        fill="url(#vend-cur-top)"
        stroke="#8b8b94"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VendorScene() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(70% 55% at 50% 50%, rgb(255 255 255 / 0.75), transparent 100%)" }}
        />
      </div>

      {/* панель-шортлист; сдвиг влево-вниз — курсор дышит справа */}
      <div
        className="relative w-[248px] -translate-x-3.5 translate-y-1.5 rounded-(--radius-m) bg-surface"
        style={{ boxShadow: "var(--shadow-panel)" }}
      >
        <Cursor />
        <div className="flex items-center gap-[5px] px-3 pt-2.5 pb-2">
          <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
          <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
          <span className="size-[7px] rounded-full" style={{ background: "var(--v4-hairline)" }} />
          <span
            className="text-data ml-2 text-[0.5625rem] font-medium tracking-[0.08em] uppercase"
            style={{ color: "var(--v4-ghost)" }}
          >
            shortlist
          </span>
        </div>
        <div className="grid gap-1.5 px-2.5 pb-2.5">
          {providers.map((p) => (
            <div
              key={p.name}
              className={`flex items-center gap-2 rounded-(--radius-s) px-2.5 py-2 text-[0.78125rem] font-medium ${
                p.selected ? "bg-[#eaf2fe]" : "bg-bg-mist text-ink-soft"
              }`}
            >
              {p.selected ? (
                <span className="grid size-[18px] flex-none place-items-center rounded-full bg-accent">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path
                      d="M2 5.2 4.2 7.4 8 3"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : (
                <span className="size-1.5 flex-none rounded-full" style={{ background: "var(--v4-ghost)" }} />
              )}
              {p.name}
              <span
                className={`text-data ml-auto text-[0.625rem] font-medium ${p.selected ? "text-accent" : ""}`}
              >
                {p.fee}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
