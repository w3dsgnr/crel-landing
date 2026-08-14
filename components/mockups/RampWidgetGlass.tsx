// Стеклянная версия ramp-виджета — «прибор» по анатомии tip-калькулятора
// (docs/refs/dark-widgets/design.md), материал — светлое матовое стекло:
// чёрный корпус на серой карточке секции был бы слишком жирным акцентом.
// Сумма-герой со степперами, чипы пресетов, mono-значения, тёмная пилюля CTA,
// отсоединённый тост-квиток. Статичен: редизайн-кандидат для capabilities,
// живёт на /dev/widgets до утверждения. Тексты — content/platform.ts
// §mockups.ramp дословно; единственный цвет — --wg-accent у значения и чека.
// compact (референс Integration 2026-08-13): только ввод суммы — без узла
// получения, курса и тоста; выбранный пресет — синяя пилюля (--wg-accent).
//
// Сцена (спека анимации карточек 01, 2026-08-13) включается пропом animated и
// только в capabilities: в Hero виджет виден с первого кадра и конкурировал бы
// с циклом заголовка, в Integration compact анимировать просто нечего.
// Честных событий в приборе ровно два — котировка вычисляется и сделка
// закрывается; НЕ анимируются сумма-герой, степперы, чипы пресетов и Continue:
// это ввод пользователя, которого на лендинге нет, и любая их «жизнь» —
// пантомима. Причинность кодируется порядком тактов, а не нажатием.
import { mockups } from "@/content/platform";
import { usePlayOnce } from "@/lib/usePlayOnce";

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

export function RampWidgetGlass({
  compact = false,
  animated = false,
}: {
  compact?: boolean;
  animated?: boolean;
}) {
  const m = mockups.ramp;
  // в compact узлов сцены нет в дереве — привод не поднимаем
  const { ref, playAttr } = usePlayOnce<HTMLDivElement>({ enabled: animated && !compact });
  return (
    // relative: корпус позиционирован, чтобы декор-слои секций (монеты)
    // могли рисоваться ПОД стеклом и размываться его backdrop-blur
    <div ref={ref} data-play={playAttr} className="widget-glass relative w-full">
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
              className={`rounded-full px-3.5 py-2 text-[0.8125rem] whitespace-nowrap tabular-nums ${
                p === SELECTED
                  ? `${compact ? "bg-(--wg-accent)" : "bg-(--wg-action)"} font-medium text-(--wg-text-on-action)`
                  : "bg-(--wg-surface-overlay) text-(--wg-text)"
              }`}
            >
              {p}
            </span>
          ))}
        </div>

        {/* узел получения и курс — только в полной версии */}
        {!compact && (
          <>
            <div className="mt-5 flex items-center justify-between rounded-(--wg-radius-row) bg-(--wg-surface-raised) px-4 py-3.5">
              <span className="text-[0.8125rem] text-(--wg-text-muted)">{m.receiveLabel}</span>
              {/* такт 1: котировка не появляется, а печатается слева направо —
                  прибор выдаёт значение. Флекс-элемент, поэтому clip-path
                  считается по одному блочному боксу и не ломается переносом */}
              <span
                className="wg-type font-mono text-[0.9375rem] text-(--wg-accent) tabular-nums"
                style={{ transitionDelay: "var(--wg-t0)" }}
              >
                {m.receiveValue} {m.receiveChip}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-(--wg-radius-row) bg-(--wg-surface-raised) px-4 py-3.5">
              {/* такт 2: сначала цифра, потом условия. Мелкий шрифт не должен
                  тянуть взгляд — только проявление, без движения */}
              <span
                className="wg-fade font-mono text-[0.75rem] text-(--wg-text-muted)"
                style={{ transitionDelay: "calc(var(--wg-t0) + 160ms)" }}
              >
                {m.rate}
              </span>
            </div>
          </>
        )}

        {/* главное действие — тёмная пилюля (инверсия на светлом материале) */}
        <div className="mt-5 rounded-full bg-(--wg-action) py-3.5 text-center text-[0.875rem] font-medium text-(--wg-text-on-action)">
          {m.button}
        </div>
        <p className="mt-3 text-center text-[0.6875rem] lowercase text-(--wg-text-muted)">
          {m.footnote}
        </p>
      </div>

      {/* тост-квиток вне корпуса — артефакт завершённой операции (полная версия).
          Такт 3: артефакт прилетает снизу — оттуда, где он лежит. Пауза после
          котировки кодирует причинность (котировка → расчёт) без фальшивого
          нажатия Continue */}
      {!compact && (
      <div
        className="wg-rise mt-3 flex items-center gap-3 rounded-full border border-(--wg-hairline) bg-(--wg-surface-base) px-5 py-3.5 backdrop-blur-xl"
        style={{ transitionDelay: "calc(var(--wg-t0) + 520ms)" }}
      >
        <div className="min-w-0 flex-1">
          {/* [VERIFY: микротекст квитка сгенерирован 2026-08-12 по образцу «Bill has been paid»] */}
          <p className="text-[0.8125rem] font-medium">Order settled</p>
          <p className="mt-0.5 font-mono text-[0.6875rem] text-(--wg-text-muted)">
            {m.receiveValue} {m.receiveChip}&ensp;·&ensp;1.0960&ensp;·&ensp;fees included
          </p>
        </div>
        {/* такт 4: тот же «щелчок вердикта», что в KYC — общая морфема семейства */}
        <span
          className="wg-pop flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-(--wg-accent)"
          style={{ transitionDelay: "calc(var(--wg-t0) + 760ms)" }}
        >
          <svg viewBox="0 0 12 12" className="size-3.5" aria-hidden>
            <path d="M2 6.2 5 9l5-6" fill="none" stroke="var(--wg-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      )}
    </div>
  );
}
