"use client";

// Стеклянная версия Cards — итерация «пиздатенько» (frontend-design, 2026-08-12).
// Сцена — веер из двух карт: plastic — тёмный материал с диагональным сиянием
// и настоящей анатомией (чип-пластина, контактлесс-дуги — единственный синий
// акцент), virtual — стеклянный «призрак» позади с mono-тегом. Лёгкие развороты
// дают стопке жизнь; тень — только у парящего plastic (язык островка KYC).
// Тексты — mockups.cards дословно.
//
// Сцена (спека анимации карточек 01, 2026-08-13): карты не нарисованы, а СДАНЫ
// в веер, и порядок сдачи буквальный — virtual выпускается мгновенно, plastic
// приходит следом. Единственный hover-моушн секции живёт здесь: пластик
// закрывает ~80% виртуальной карты, и на статике их легко прочитать как одну —
// наведение ОТКРЫВАЕТ информацию, а не украшает. Роли разведены по узлам:
// .wg-slot держит раскрытие, .wg-fan — вход. Карты лежат ровно (углы сняты 2026-08-18).
// НЕ анимируются: glare-свип по пластику (первое клише премиальной карты и
// не-GPU свойство), отрисовка чип-пластины, подмена PAN.
import { mockups } from "@/content/platform";
import { usePlayOnce } from "@/lib/usePlayOnce";
import { Contactless } from "./Contactless";

// чип-пластина: контактная сетка настоящей карты (stroke наследует цвет)
function ChipPlate() {
  return (
    <svg viewBox="0 0 28 20" className="h-5 w-7" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <rect x="0.5" y="0.5" width="27" height="19" rx="4" />
      <path d="M9.5 0.5v6a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-6M9.5 19.5v-6a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v6M0.5 10h9M18.5 10h9" />
    </svg>
  );
}

export function CardDuoGlass() {
  const m = mockups.cards;
  const { ref, playAttr } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} data-play={playAttr} className="widget-glass w-full">
      <div className="rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) p-5 backdrop-blur-xl">
        {/* стопка: virtual-призрак позади, plastic-герой впереди. Обе карты
            лежат ровно (углы покоя ±3°/−2° сняты 2026-08-18 по решению
            заказчика — стопка читается как ровная раскладка, не веер).
            perspective на сцене — иначе rotateX въезда читается как сплющивание */}
        <div className="wg-stage relative h-[178px]">
          <div className="wg-slot wg-slot-back absolute top-1 right-0 w-[78%]">
            {/* backdrop-blur снят: блюр по уже заблюренному корпусу почти ничего
                не давал, а на движущемся узле заставлял пересемплировать его
                каждый кадр (плюс артефакты композитинга в связке с 3D) */}
            <div
              className="wg-fan wg-fan-back relative aspect-[1.586] w-full rounded-[10px] border border-(--wg-hairline) bg-white/55 p-3.5"
              style={{ transitionDelay: "var(--wg-t0)" }}
            >
              <span className="font-mono text-[0.6875rem] lowercase text-(--wg-text-muted)">
                {m.virtualTag}
              </span>
              <p className="absolute right-3.5 bottom-3 font-mono text-[0.75rem] tracking-[0.16em] text-(--wg-text-muted) tabular-nums">
                {m.virtualPan}
              </p>
            </div>
          </div>
          <div className="wg-slot wg-slot-front absolute bottom-0 left-0 w-[78%]">
            <div
              className="wg-fan wg-fan-front relative aspect-[1.586] w-full rounded-[10px] border border-white/[0.07] bg-[linear-gradient(135deg,#2b2b31_0%,#1a1a1e_52%,#141417_100%)] p-3.5 text-(--wg-text-on-action) shadow-[0_20px_40px_-14px_rgb(0_0_0/0.5)]"
              style={{ transitionDelay: "calc(var(--wg-t0) + 110ms)" }}
            >
              <div className="flex items-start justify-between">
                <p className="text-[1rem] leading-none font-medium lowercase">{m.plasticBrand}</p>
                {/* контактлесс-дуги (общий глиф ./Contactless): акцентный —
                    цвет = данные/сигнал. Загораются хвостом посадки пластика —
                    «карта готова к тапу» */}
                <Contactless at={430} />
              </div>
              <div className="mt-4 text-white/30">
                <ChipPlate />
              </div>
              <div className="absolute right-3.5 bottom-3.5 left-3.5 flex items-baseline justify-between font-mono tabular-nums">
                <span className="text-[0.875rem] tracking-[0.18em]">{m.plasticPan}</span>
                <span className="text-[0.6875rem] text-white/55">{m.plasticExpiry}</span>
              </div>
            </div>
          </div>
        </div>
        {/* кошельки: тихая mono-строка вместо пилюль — карта остаётся героем.
            Пуанта: карта выпущена → она уже в кошельке, последствие последним */}
        <p
          className="wg-rise mt-4 text-center font-mono text-[0.6875rem] lowercase text-(--wg-text-muted)"
          style={{ transitionDelay: "calc(var(--wg-t0) + 620ms)" }}
        >
          {m.chips.join(" · ")}
        </p>
      </div>
    </div>
  );
}
