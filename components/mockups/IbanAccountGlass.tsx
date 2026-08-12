// Стеклянная версия Virtual accounts / IBANs — «прибор» по анатомии
// metric-row (docs/refs/dark-widgets/design.md): счета — приподнятые узлы на
// стеклянной подложке, IBAN в mono, статус — синяя точка-live + mono-ярлык
// (акцент Crel синий, память crel-accent-blue). Статичен: редизайн-кандидат
// для capabilities. Тексты — content/platform.ts §mockups.iban дословно.
import { mockups } from "@/content/platform";

export function IbanAccountGlass() {
  const m = mockups.iban;
  return (
    <div className="widget-glass w-full">
      <div className="rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) p-5 backdrop-blur-xl">
        {/* шапка: заголовок + muted-подстрока */}
        <p className="text-[0.8125rem] lowercase text-(--wg-text)">{m.header}</p>
        <p className="mt-0.5 font-mono text-[0.6875rem] lowercase text-(--wg-text-muted)">{m.sub}</p>

        {/* счета — приподнятые узлы; неактивный приглушён */}
        <div className="mt-4 flex flex-col gap-2">
          {m.rows.map((row) => (
            <div
              key={row.name}
              className={`rounded-(--wg-radius-row) bg-(--wg-surface-raised) px-4 py-3.5 ${
                "dimmed" in row && row.dimmed ? "opacity-55" : ""
              }`}
            >
              <div className="flex items-center justify-between text-[0.8125rem]">
                <span className="font-medium">{row.name}</span>
                <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] lowercase text-(--wg-accent)">
                  <span className="size-1.5 rounded-full bg-(--wg-accent)" aria-hidden />
                  {row.chip}
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[0.75rem] tracking-[0.04em] text-(--wg-text-muted) tabular-nums">
                {row.iban}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
