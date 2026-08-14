"use client";

// Стеклянная версия Seller terminal — «прибор» по анатомии tip-калькулятора
// (docs/refs/dark-widgets/design.md): телефон-терминал — тёмный парящий объект
// (язык островка/plastic-карты), внутри — сумма-герой, клавиатура ступенью
// светлее, светлая пилюля Charge (интерактивность = контраст к материалу).
// Синим — только статус paid (акцент Crel, память crel-accent-blue).
// Тексты — mockups.terminal дословно.
//
// Сцена (спека анимации карточек 01, 2026-08-13). Статика склеивает два
// момента, которых в жизни не бывает одновременно: «списать» и «оплачено»
// в одной пилюле. Задача моушна — расклеить их, и только это: сумма
// выводится на дисплей, а paid приходит после паузы «на сеть».
// Отвергнуто осознанно: набор суммы по клавишам с подсветкой (изображает
// пользователя, которого нет, и даёт вторую печатную машинку на странице —
// первая уже работает в CodeSnippet) и нажатие пилюли Charge (пантомима без
// курсора; причинность кодируется порядком тактов, а не изображённым пальцем).
import { mockups } from "@/content/platform";
import { usePlayOnce } from "@/lib/usePlayOnce";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"];

export function SellerTerminalGlass() {
  const m = mockups.terminal;
  const { ref, playAttr } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} data-play={playAttr} className="widget-glass w-full">
      <div className="rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) p-5 backdrop-blur-xl">
        {/* терминал — тёмный парящий объект по центру сцены */}
        <div className="mx-auto w-[180px] rounded-[18px] bg-[linear-gradient(160deg,#26262b_0%,#161619_100%)] p-3.5 text-(--wg-text-on-action) shadow-[0_20px_40px_-14px_rgb(0_0_0/0.5)]">
          {/* сумма-герой + валюта */}
          <div className="flex items-baseline justify-between">
            {/* такт 1: сумма выводится на дисплей терминала.
                tabular-nums уже стоит — ширина не дрожит, CHF не толкается */}
            <span
              className="wg-type text-[1.5rem] leading-none font-semibold tracking-[-0.01em] tabular-nums"
              style={{ transitionDelay: "var(--wg-t0)" }}
            >
              {m.amount}
            </span>
            <span className="font-mono text-[0.6875rem] text-white/55">{m.currency}</span>
          </div>
          {/* клавиатура — ступень светлее материала */}
          <div className="mt-3.5 grid grid-cols-3 gap-1.5">
            {KEYS.map((k) => (
              <span
                key={k}
                className="rounded-[8px] bg-white/[0.07] py-1.5 text-center font-mono text-[0.75rem] text-white/65 tabular-nums"
              >
                {k}
              </span>
            ))}
          </div>
          {/* действие — светлая пилюля; статус paid — единственный синий */}
          <div className="mt-2.5 flex items-center justify-center gap-2 rounded-full bg-(--wg-action-on-dark,#f2f2f3) py-2.5 text-[0.8125rem] font-medium text-(--wg-text)">
            {m.button}
            {/* такт 2: результат приходит ПОСЛЕ действия — то, что статика
                склеила. Не монтирование, а opacity: paid продолжает занимать
                место в flex gap-2, и Charge не прыгает по центру пилюли */}
            <span
              className="wg-rise wg-rise-s font-mono text-[0.6875rem] lowercase text-(--wg-accent)"
              style={{ transitionDelay: "calc(var(--wg-t0) + 380ms)" }}
            >
              {m.paidStatus}
            </span>
          </div>
        </div>
        {/* подпись сцены */}
        <p className="mt-4 text-center font-mono text-[0.6875rem] lowercase text-(--wg-text-muted)">
          {m.tag}
        </p>
      </div>
    </div>
  );
}
