"use client";

// Widget and White Label API — «два входа» (концепт утверждён 2026-08-12):
// тёмная код-панель с mono-запросом (white label API) и стеклянная мини-панель
// виджета внахлёст (drop-in) — одна операция, два способа её получить.
// Стекло с блюром ложится поверх кода — материал системы работает на смысл.
// Значения — контрастом материала (белое на тёмном, чернильное на стекле):
// синий на этих подложках читался плохо (правка 2026-08-12).
// Суммы — mockups.ramp дословно; строки кода — новые микротексты [VERIFY].
//
// Сцена (спека анимации карточек 01, 2026-08-13). Статика врёт дважды: запрос
// и ответ 201 стоят в одном блоке, а наложение панелей читается как случайное.
// Такты: запрос уходит → тело следом → стеклянная панель ЛОЖИТСЯ сверху
// (параллельно коду, а не после него: виджет — альтернатива вызову API, а не
// его следствие) → 201 created и 912.44 USDC зажигаются РОВНО одновременно.
// Синхронность и есть тезис карточки; разнести их даже на 60ms «чтобы было
// живее» — потерять весь номер. Дельта строго 0.
import { mockups } from "@/content/platform";
import { usePlayOnce } from "@/lib/usePlayOnce";

// оба входа выдают один результат в один кадр
const RESULT_AT = "calc(var(--wg-t0) + 470ms)";

// строки код-панели [VERIFY: сгенерированы 2026-08-12]. Экспорт — та же панель
// стоит фрагментом в hero (HeroFloats.tsx), строки живут в одном месте
export const API_LINES = { request: "POST /v1/ramp", response: "201 created" };

export function WidgetApiGlass() {
  const m = mockups.ramp;
  const { ref, playAttr } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} data-play={playAttr} className="widget-glass w-full">
      <div className="relative h-[210px]">
        {/* вход 1: white label API — тёмная код-панель (парящий объект) */}
        <div className="absolute top-0 left-0 w-[68%] rounded-[18px] bg-[linear-gradient(160deg,#26262b_0%,#161619_100%)] p-4 text-(--wg-text-on-action) shadow-[0_20px_40px_-14px_rgb(0_0_0/0.5)]">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
          </div>
          <div className="mt-3 font-mono text-[0.6875rem] leading-relaxed">
            {/* вайп строкой целиком, а не посимвольно: даёт «набралось» без
                джиттера символов и без второй печатной машинки на странице */}
            <p className="wg-type" style={{ transitionDelay: "var(--wg-t0)" }}>
              {API_LINES.request}
            </p>
            <p className="wg-type text-white/45" style={{ transitionDelay: "calc(var(--wg-t0) + 70ms)" }}>
              {"{"} amount: {m.sendValue}, currency: {m.sendChip.toLowerCase()} {"}"}
            </p>
            {/* ответ не может существовать в один момент с запросом */}
            <p className="wg-rise wg-rise-s" style={{ transitionDelay: RESULT_AT }}>
              {API_LINES.response}
            </p>
          </div>
        </div>
        {/* вход 2: drop-in виджет — стекло внахлёст поверх кода.
            Только translateY + opacity и ≤300ms: под панелью backdrop-blur-xl,
            каждый кадр трансформа пересчитывает блюр — scale здесь запрещён */}
        <div
          className="wg-rise wg-rise-drop absolute right-0 bottom-0 w-[58%] rounded-(--wg-radius-row) border border-(--wg-hairline) bg-(--wg-surface-base) p-3.5 backdrop-blur-xl"
          style={{ transitionDelay: "calc(var(--wg-t0) + 90ms)" }}
        >
          <p className="text-[0.6875rem] text-(--wg-text-muted)">{m.receiveLabel}</p>
          <p
            className="wg-rise wg-rise-s mt-1 font-mono text-[0.9375rem] text-(--wg-text) tabular-nums"
            style={{ transitionDelay: RESULT_AT }}
          >
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
