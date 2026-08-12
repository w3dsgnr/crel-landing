// Стеклянная версия Seller terminal — «прибор» по анатомии tip-калькулятора
// (docs/refs/dark-widgets/design.md): телефон-терминал — тёмный парящий объект
// (язык островка/plastic-карты), внутри — сумма-герой, клавиатура ступенью
// светлее, светлая пилюля Charge (интерактивность = контраст к материалу).
// Синим — только статус paid (акцент Crel, память crel-accent-blue).
// Статичен: редизайн-кандидат для capabilities. Тексты — mockups.terminal дословно.
import { mockups } from "@/content/platform";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"];

export function SellerTerminalGlass() {
  const m = mockups.terminal;
  return (
    <div className="widget-glass w-full">
      <div className="rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) p-5 backdrop-blur-xl">
        {/* терминал — тёмный парящий объект по центру сцены */}
        <div className="mx-auto w-[180px] rounded-[18px] bg-[linear-gradient(160deg,#26262b_0%,#161619_100%)] p-3.5 text-(--wg-text-on-action) shadow-[0_20px_40px_-14px_rgb(0_0_0/0.5)]">
          {/* сумма-герой + валюта */}
          <div className="flex items-baseline justify-between">
            <span className="text-[1.5rem] leading-none font-semibold tracking-[-0.01em] tabular-nums">
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
            <span className="font-mono text-[0.6875rem] lowercase text-(--wg-accent)">
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
