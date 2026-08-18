"use client";

// Стеклянная версия Virtual accounts / IBANs — «прибор» по анатомии
// metric-row (docs/refs/dark-widgets/design.md): счета — приподнятые узлы на
// стеклянной подложке, IBAN в mono, статус — синяя точка-live + mono-ярлык
// (акцент Crel синий, память crel-accent-blue).
// Тексты — content/platform.ts §mockups.iban дословно.
//
// Сцена (спека анимации карточек 01, 2026-08-13): момент ВЫДАЧИ счёта —
// узел заводится → на него печатается выделенный номер → счёт встаёт на
// дежурство. Шапка не анимируется: её уже поднял data-reveal ячейки,
// второй вход того же объекта — двойное движение.
import { mockups } from "@/content/platform";
import { usePlayOnce } from "@/lib/usePlayOnce";

export function IbanAccountGlass() {
  const m = mockups.iban;
  const { ref, playAttr } = usePlayOnce<HTMLDivElement>();
  // stagger 70ms между счетами — в вилке 30–80ms
  const at = (base: number, i: number) => `calc(var(--wg-t0) + ${base + i * 70}ms)`;
  return (
    <div ref={ref} data-play={playAttr} className="widget-glass w-full">
      <div className="rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) p-5 backdrop-blur-xl">
        {/* шапка: заголовок + muted-подстрока */}
        <p className="text-[0.8125rem] lowercase text-(--wg-text)">{m.header}</p>
        <p className="mt-0.5 font-mono text-[0.6875rem] lowercase text-(--wg-text-muted)">{m.sub}</p>

        {/* счета — приподнятые узлы; неактивный приглушён */}
        <div className="mt-4 flex flex-col gap-2">
          {m.rows.map((row, i) => (
            // конечной opacity в .wg-rise нет — приглушённая строка возвращается
            // к своему opacity-55, иерархия не ломается анимацией
            <div
              key={row.name}
              className={`wg-rise rounded-(--wg-radius-row) bg-(--wg-surface-raised) px-4 py-3.5 ${
                "dimmed" in row && row.dimmed ? "opacity-55" : ""
              }`}
              style={{ transitionDelay: at(0, i) }}
            >
              <div className="flex items-center justify-between text-[0.8125rem]">
                <span className="font-medium">{row.name}</span>
                {/* статус подтверждается ПОСЛЕ того, как номер выдан. Точка-live
                    проявляется вместе с ярлыком: .wg-pop на 6px даёт 1.2px хода —
                    невидим и лишь дублирует fade родителя (ревью 2026-08-18) */}
                <span
                  className="wg-fade flex items-center gap-1.5 font-mono text-[0.6875rem] lowercase text-(--wg-accent)"
                  style={{ transitionDelay: at(340, i) }}
                >
                  <span className="size-1.5 rounded-full bg-(--wg-accent)" aria-hidden />
                  {row.chip}
                </span>
              </div>
              {/* главный жест прибора: выделенный номер печатается слева направо —
                  буквально «dedicated IBAN per user». Только маска, никогда
                  посимвольно и без скрамбла: иначе прибор станет крипто-лендингом */}
              <p
                className="wg-type mt-1.5 font-mono text-[0.75rem] tracking-[0.04em] text-(--wg-text-muted) tabular-nums"
                style={{ transitionDelay: at(140, i) }}
              >
                {row.iban}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
