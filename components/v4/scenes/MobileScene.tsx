// 02: services / Mobile apps — сцена «предмет на серой сцене» по референсу
// (docs/refs/todesktop/design.md §1.3, §3): телефон с мини-кошельком на рельсе,
// низ растворяется маской в серый карточки (вместо жёсткого среза краем);
// OS-пилюля iOS/Android — аналог референсного os-pill, крупнее и с глубокой
// тенью на переднем плане. Суммы фона даёт штатная текстура amounts.
// Макет утверждён 2026-08-10 (scratchpad/card-05-mobile-apps.html).
//
// Сцена (грамматика приборов, docs/motion-capabilities.md), минимально:
// баланс печатается → строки-скелетоны садятся в ленту → OS-пилюля ложится
// сверху. Корпус телефона (маска + тень) и кнопка send статичны.
"use client";

import { usePlayOnce } from "@/lib/usePlayOnce";

const SKELETON_WIDTHS = ["64%", "52%", "38%"];

// такты от --wg-t0 ячейки: скелетоны stagger 60 (в вилке 30–80), пилюля после
const at = (ms: number) => `calc(var(--wg-t0) + ${ms}ms)`;
const ROW_STAGGER = 60;
const PILL_AT = 200;

function AppleIcon() {
  return (
    <svg width="15" height="17" viewBox="0 0 17 20" fill="var(--color-ink)" aria-hidden>
      <path d="M11.9 3.3c.7-.9 1.2-2.1 1-3.3-1 .1-2.3.7-3 1.6-.7.8-1.2 2-1 3.2 1.1.1 2.3-.6 3-1.5Z" />
      <path d="M14.6 10.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.7-1.4 0-2.7.8-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7 1.3 0 1.6.7 2.8.7 1.1 0 1.9-1 2.6-2.1.8-1.2 1.1-2.4 1.2-2.4 0 0-2.2-.9-2.3-3.4Z" />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg width="17" height="10" viewBox="0 0 20 12" fill="none" aria-hidden>
      <path d="M1.5 12a8.5 8.5 0 0 1 17 0Z" fill="#3ddc84" />
      <path d="M4.4 3.4 2.9.9M15.6 3.4 17.1.9" stroke="#3ddc84" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="6.6" cy="8.2" r="1" fill="#fff" />
      <circle cx="13.4" cy="8.2" r="1" fill="#fff" />
    </svg>
  );
}

export function MobileScene() {
  // привод сцены висит на якоре телефона, а не на фрагменте: IntersectionObserver
  // нужен реальный бокс, а фон-виньетка сцены к прогону отношения не имеет
  const { ref, playAttr } = usePlayOnce<HTMLDivElement>();
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(70% 55% at 50% 45%, rgb(255 255 255 / 0.75), transparent 100%)" }}
        />
      </div>

      {/* якорь к низу сцены: растворение всегда завершается у края карточки */}
      <div ref={ref} data-play={playAttr} className="absolute -bottom-[50px] left-1/2 h-[300px] w-[158px] -translate-x-1/2">
        <div
          className="absolute inset-0 rounded-t-[28px] px-2 pt-2"
          style={{
            background: "linear-gradient(135deg, #fdfdfe, #e9e9ef)",
            boxShadow: "var(--shadow-panel)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 68%, transparent 84%)",
            maskImage: "linear-gradient(to bottom, #000 68%, transparent 84%)",
          }}
        >
          <div className="relative h-full rounded-t-[21px] bg-surface px-3 pt-[26px]">
            <div
              className="absolute top-[9px] left-1/2 h-[5px] w-11 -translate-x-1/2 rounded-full"
              style={{ background: "#ececf1" }}
            />
            <div
              className="text-data text-[0.5rem] font-medium tracking-[0.08em] uppercase"
              style={{ color: "var(--v4-ghost)" }}
            >
              balance
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              {/* баланс печатается на экран — прибор выдал значение */}
              <span className="wg-type text-[1.1875rem] font-semibold tracking-[-0.01em]" style={{ transitionDelay: at(0) }}>
                1 240.50
              </span>
              <span className="text-data text-[0.5625rem] text-ink-soft">chf</span>
            </div>
            {SKELETON_WIDTHS.map((w, i) => (
              <div
                key={w}
                className="wg-rise wg-rise-s mt-2.5 flex items-center gap-[7px] rounded-(--radius-s) bg-bg-mist px-2 py-[7px]"
                style={{ transitionDelay: at(i * ROW_STAGGER) }}
              >
                <span className="size-1.5 flex-none rounded-full" style={{ background: "var(--v4-ghost)" }} />
                <span className="h-[5px] rounded-full bg-[#e9e9ee]" style={{ width: w }} />
              </div>
            ))}
            {/* кнопка действия — по канону мобильного UI внизу, в непрозрачной зоне */}
            <div
              className="absolute right-3 bottom-[92px] left-3 rounded-full bg-accent py-[7px] text-center text-[0.71875rem] font-medium text-ink-invert"
              style={{ boxShadow: "0 6px 14px rgb(46 124 246 / 0.3)" }}
            >
              send
            </div>
          </div>
        </div>

        {/* OS-пилюля на переднем плане: по центру телефона, глубокая тень.
            Ложится сверху (.wg-rise-drop) — физически лежит над экраном; центровка
            -translate-x-1/2 живёт в свойстве translate и с transform не спорит */}
        <div
          className="wg-rise wg-rise-drop absolute top-[72px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[3px] rounded-full bg-surface px-[9px] py-[7px]"
          style={{
            boxShadow: "0 14px 32px rgb(0 0 0 / 0.14), 0 3px 8px rgb(0 0 0 / 0.05)",
            transitionDelay: at(PILL_AT),
          }}
        >
          <div className="flex items-center gap-[7px] rounded-full bg-bg-mist px-[13px] py-[7px] text-[0.875rem] font-medium whitespace-nowrap">
            <AppleIcon />
            iOS
          </div>
          <div className="flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[0.875rem] font-medium whitespace-nowrap">
            <AndroidIcon />
            Android
          </div>
        </div>
      </div>
    </>
  );
}
