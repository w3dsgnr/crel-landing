// Widget and White Label API — «два входа» (концепт утверждён 2026-08-12):
// тёмная код-панель с mono-запросом (white label API) и стеклянная мини-панель
// виджета внахлёст (drop-in) — одна операция, два способа её получить.
// Стекло с блюром ложится поверх кода — материал системы работает на смысл.
// Значения — контрастом материала (белое на тёмном, чернильное на стекле):
// синий на этих подложках читался плохо (правка 2026-08-12).
// Суммы — mockups.ramp дословно; строки кода — новые микротексты [VERIFY].
import { mockups } from "@/content/platform";

export function WidgetApiGlass() {
  const m = mockups.ramp;
  return (
    <div className="widget-glass w-full">
      <div className="relative h-[210px]">
        {/* вход 1: white label API — тёмная код-панель (парящий объект) */}
        <div className="absolute top-0 left-0 w-[68%] rounded-[18px] bg-[linear-gradient(160deg,#26262b_0%,#161619_100%)] p-4 text-(--wg-text-on-action) shadow-[0_20px_40px_-14px_rgb(0_0_0/0.5)]">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
          </div>
          {/* [VERIFY: строки запроса сгенерированы 2026-08-12] */}
          <div className="mt-3 font-mono text-[0.6875rem] leading-relaxed">
            <p>POST /v1/ramp</p>
            <p className="text-white/45">
              {"{"} amount: {m.sendValue}, currency: {m.sendChip.toLowerCase()} {"}"}
            </p>
            <p>201 created</p>
          </div>
        </div>
        {/* вход 2: drop-in виджет — стекло внахлёст поверх кода */}
        <div className="absolute right-0 bottom-0 w-[58%] rounded-(--wg-radius-row) border border-(--wg-hairline) bg-(--wg-surface-base) p-3.5 backdrop-blur-xl">
          <p className="text-[0.6875rem] text-(--wg-text-muted)">{m.receiveLabel}</p>
          <p className="mt-1 font-mono text-[0.9375rem] text-(--wg-text) tabular-nums">
            {m.receiveValue} {m.receiveChip}
          </p>
          <div className="mt-3 rounded-full bg-(--wg-action) py-2 text-center text-[0.75rem] font-medium text-(--wg-text-on-action)">
            {m.button}
          </div>
          <p className="mt-2 text-center text-[0.625rem] lowercase text-(--wg-text-muted)">
            {m.footnote}
          </p>
        </div>
      </div>
    </div>
  );
}
