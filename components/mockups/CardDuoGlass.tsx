// Стеклянная версия Cards — итерация «пиздатенько» (frontend-design, 2026-08-12).
// Сцена — веер из двух карт: plastic — тёмный материал с диагональным сиянием
// и настоящей анатомией (чип-пластина, контактлесс-дуги — единственный синий
// акцент), virtual — стеклянный «призрак» позади с mono-тегом. Лёгкие развороты
// дают стопке жизнь; тень — только у парящего plastic (язык островка KYC).
// Статичен: редизайн-кандидат для capabilities. Тексты — mockups.cards дословно.
import { mockups } from "@/content/platform";

// чип-пластина: контактная сетка настоящей карты (stroke наследует цвет)
function ChipPlate() {
  return (
    <svg viewBox="0 0 28 20" className="h-5 w-7" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <rect x="0.5" y="0.5" width="27" height="19" rx="4" />
      <path d="M9.5 0.5v6a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-6M9.5 19.5v-6a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v6M0.5 10h9M18.5 10h9" />
    </svg>
  );
}

// контактлесс-дуги: акцентный глиф-индикатор (цвет = данные/сигнал)
function Contactless() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="var(--wg-accent)" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M3.5 5.5a7.5 7.5 0 0 1 0 5" opacity="0.45" />
      <path d="M6.5 4.2a10 10 0 0 1 0 7.6" opacity="0.7" />
      <path d="M9.5 2.9a12.8 12.8 0 0 1 0 10.2" />
    </svg>
  );
}

export function CardDuoGlass() {
  const m = mockups.cards;
  return (
    <div className="widget-glass w-full">
      <div className="rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) p-5 backdrop-blur-xl">
        {/* веер: virtual-призрак позади (+3°), plastic-герой впереди (−2°) */}
        <div className="relative h-[178px]">
          <div className="absolute top-1 right-0 aspect-[1.586] w-[78%] rotate-3 rounded-[10px] border border-(--wg-hairline) bg-white/55 p-3.5 backdrop-blur-sm">
            <span className="font-mono text-[0.6875rem] lowercase text-(--wg-text-muted)">
              {m.virtualTag}
            </span>
            <p className="absolute right-3.5 bottom-3 font-mono text-[0.75rem] tracking-[0.16em] text-(--wg-text-muted) tabular-nums">
              {m.virtualPan}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 aspect-[1.586] w-[78%] -rotate-2 rounded-[10px] border border-white/[0.07] bg-[linear-gradient(135deg,#2b2b31_0%,#1a1a1e_52%,#141417_100%)] p-3.5 text-(--wg-text-on-action) shadow-[0_20px_40px_-14px_rgb(0_0_0/0.5)]">
            <div className="flex items-start justify-between">
              <p className="text-[1rem] leading-none font-medium lowercase">{m.plasticBrand}</p>
              <Contactless />
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
        {/* кошельки: тихая mono-строка вместо пилюль — карта остаётся героем */}
        <p className="mt-4 text-center font-mono text-[0.6875rem] lowercase text-(--wg-text-muted)">
          {m.chips.join(" · ")}
        </p>
      </div>
    </div>
  );
}
