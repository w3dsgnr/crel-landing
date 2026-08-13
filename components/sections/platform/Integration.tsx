// 02: integration — развилка Widget vs White Label API.
// Редизайн 2026-08-13 по референсу: заголовок по центру в две строки с
// посимвольным появлением (SplitHeading), чек-строки — пилюли в поток,
// карточка API — чёрная (модификатор layer-v4-invert на карточке, консоль
// прижата к нижней кромке), вокруг виджета — стеклянные 3D-монеты
// (public/assets/*.png): йена за карточкой, евро на виджете, доллар и фунт
// под ним. Моноширинный шрифт допустим только в код-окне.
import { integration } from "@/content/platform";
import { RampWidgetGlass } from "@/components/mockups/RampWidgetGlass";
import { CodeSnippet } from "@/components/mockups/CodeSnippet";
import { SplitHeading } from "@/components/typography/SplitHeading";

function Checks({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {items.map((c) => (
        <p
          key={c}
          className={`rounded-(--radius-s) px-4 py-3 text-[0.9375rem] ${
            dark ? "bg-white/8" : "bg-bg-mist"
          }`}
        >
          {c}
        </p>
      ))}
    </div>
  );
}

// декоративная монета: вне потока и вне доступности
function Coin({ src, className }: { src: string; className: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      className={`pointer-events-none absolute select-none ${className}`}
    />
  );
}

export function Integration() {
  return (
    // overflow-x-clip: монеты выступают за карточку и не должны давать
    // горизонтальный скролл на узких вьюпортах
    <section className="layer-v4 overflow-x-clip bg-bg-alt">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        {/* лейбла у секции нет — заголовок по центру открывает сцену (референс) */}
        <SplitHeading
          text={integration.section.title}
          breakBefore="or"
          className="text-h2 text-center"
        />
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Widget: обёртка держит монеты; йена — до карточки в DOM, т.е. под ней */}
          <div data-reveal className="relative">
            <Coin src="/assets/yen.png" className="-top-16 -left-10 w-[130px] md:-top-24 md:-left-16 md:w-[190px]" />
            <div className="relative h-full rounded-(--radius-xl) bg-bg p-8 md:p-10">
              <h3 className="text-card-title">{integration.widget.title}</h3>
              <p className="mt-3 text-[0.9375rem] text-ink-soft">{integration.widget.lead}</p>
              <Checks items={integration.widget.checks} />
              {/* стеклянный ramp-прибор, компактная версия: только ввод суммы.
                  Евро и доллар — ДО виджета в DOM: рисуются под стеклом,
                  корпус морозит их своим backdrop-blur */}
              <div className="relative mx-auto mt-10 max-w-[340px]">
                <Coin src="/assets/euro.png" className="-top-12 -right-8 w-[120px] md:-right-16 md:w-[150px]" />
                <Coin src="/assets/dollar.png" className="-bottom-10 -left-8 w-[120px] md:-left-14 md:w-[150px]" />
                <RampWidgetGlass compact />
              </div>
            </div>
            <Coin src="/assets/frank.png" className="z-10 -bottom-8 left-[58%] w-[85px] md:-bottom-12 md:w-[105px]" />
          </div>
          {/* API: чёрная карточка — инверсия токенов каскадом layer-v4-invert */}
          <div data-reveal className="layer-v4-invert flex flex-col rounded-(--radius-xl) bg-bg p-8 md:p-10">
            <h3 className="text-card-title">{integration.api.title}</h3>
            <p className="mt-3 text-[0.9375rem] text-ink-soft">{integration.api.lead}</p>
            <Checks items={integration.api.checks} dark />
            {/* белая код-панель, прижата к нижней кромке карточки (mt-auto) */}
            <div className="mt-auto pt-10">
              <div className="rounded-(--radius-m) bg-surface p-6 shadow-(--shadow-mockup)">
                <CodeSnippet lines={integration.snippet} variant="light" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
