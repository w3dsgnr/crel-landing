// Стеклянная версия ramp-виджета — «прибор» по анатомии tip-калькулятора
// (docs/refs/dark-widgets/design.md), материал — светлое матовое стекло:
// чёрный корпус на серой карточке секции был бы слишком жирным акцентом.
// Сумма-герой со степперами, чипы пресетов, mono-значения, тёмная пилюля CTA,
// отсоединённый тост-квиток. Статичен: редизайн-кандидат для capabilities,
// живёт на /dev/widgets до утверждения. Тексты — content/platform.ts
// §mockups.ramp дословно; единственный цвет — --wg-accent у значения и чека.
import { mockups } from "@/content/platform";

// пресеты суммы: sendValue из контента + соседние ступени; выбран — sendValue
const PRESETS = ["250", "500", "1 000", "2 500"];
const SELECTED = "1 000";

function Stepper({ sign }: { sign: "−" | "+" }) {
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-(--wg-surface-overlay) text-[1.0625rem] text-(--wg-text-muted) select-none">
      {sign}
    </span>
  );
}

export function RampWidgetGlass() {
  const m = mockups.ramp;
  return (
    <div className="widget-glass w-full">
      {/* корпус-прибор: матовое стекло — блюр подбирает микротекстуру карточки */}
      <div className="rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) p-5 backdrop-blur-xl">
        {/* сумма-герой: ярлык — величина со степперами — чип валюты */}
        <p className="text-center text-[0.8125rem] text-(--wg-text-muted)">{m.sendLabel}</p>
        <div className="mt-3 flex items-center justify-between">
          <Stepper sign="−" />
          <span className="text-[2.375rem] leading-none font-semibold tracking-[-0.01em] tabular-nums">
            {m.sendValue}
          </span>
          <Stepper sign="+" />
        </div>
        <p className="mt-2 text-center text-[0.75rem] font-medium text-(--wg-text-muted)">{m.sendChip}</p>

        {/* чипы пресетов: выбранный — инверсия в тёмную пилюлю */}
        <div className="mt-5 flex justify-center gap-2">
          {PRESETS.map((p) => (
            <span
              key={p}
              className={`rounded-full px-3.5 py-2 text-[0.8125rem] tabular-nums ${
                p === SELECTED
                  ? "bg-(--wg-action) font-medium text-(--wg-text-on-action)"
                  : "bg-(--wg-surface-overlay) text-(--wg-text)"
              }`}
            >
              {p}
            </span>
          ))}
        </div>

        {/* узел получения: ярлык слева — mono-значение справа (--wg-accent) */}
        <div className="mt-5 flex items-center justify-between rounded-(--wg-radius-row) bg-(--wg-surface-raised) px-4 py-3.5">
          <span className="text-[0.8125rem] text-(--wg-text-muted)">{m.receiveLabel}</span>
          <span className="font-mono text-[0.9375rem] text-(--wg-accent) tabular-nums">
            {m.receiveValue} {m.receiveChip}
          </span>
        </div>

        {/* метрика курса: mono, muted */}
        <div className="mt-2 flex items-center justify-between rounded-(--wg-radius-row) bg-(--wg-surface-raised) px-4 py-3.5">
          <span className="font-mono text-[0.75rem] text-(--wg-text-muted)">{m.rate}</span>
        </div>

        {/* главное действие — тёмная пилюля (инверсия на светлом материале) */}
        <div className="mt-5 rounded-full bg-(--wg-action) py-3.5 text-center text-[0.875rem] font-medium text-(--wg-text-on-action)">
          {m.button}
        </div>
        <p className="mt-3 text-center text-[0.6875rem] lowercase text-(--wg-text-muted)">
          {m.footnote}
        </p>
      </div>

      {/* тост-квиток вне корпуса — артефакт завершённой операции */}
      <div className="mt-3 flex items-center gap-3 rounded-full border border-(--wg-hairline) bg-(--wg-surface-base) px-5 py-3.5 backdrop-blur-xl">
        <div className="min-w-0 flex-1">
          {/* [VERIFY: микротекст квитка сгенерирован 2026-08-12 по образцу «Bill has been paid»] */}
          <p className="text-[0.8125rem] font-medium">Order settled</p>
          <p className="mt-0.5 font-mono text-[0.6875rem] text-(--wg-text-muted)">
            {m.receiveValue} {m.receiveChip}&ensp;·&ensp;1.0960&ensp;·&ensp;fees included
          </p>
        </div>
        {/* акцентное кольцо-чек */}
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-(--wg-accent)">
          <svg viewBox="0 0 12 12" className="size-3.5" aria-hidden>
            <path d="M2 6.2 5 9l5-6" fill="none" stroke="var(--wg-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
